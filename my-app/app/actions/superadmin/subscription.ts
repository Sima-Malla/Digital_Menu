"use server";

// app/actions/superadmin/subscription.ts
// Backend for /app/settings/subscription/page.tsx.
// Platform-level settings (not per-business) — same singleton pattern as
// PlatformSettings elsewhere in the app.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSuperAdminNotification } from "@/lib/superadmin-notifications";
// import { requireSuperAdmin } from "@/lib/session"; // TODO: wire real auth

type ActionResult<T> = { data?: T; error?: string };

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export async function getSubscriptionPlans() {
  // await requireSuperAdmin();
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } });
  // Prisma's Decimal type can't be passed from a Server Action to a Client
  // Component as-is — convert it to a plain number first.
  return plans.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    price: Number(p.price),
    cycle: p.cycle,
    isDefault: p.isDefault,
    sortOrder: p.sortOrder,
  }));
}

const planInputSchema = z.object({
  name: z.string().min(1).max(60),
  price: z.number().min(0),
  cycle: z.enum(["Monthly", "Yearly"]),
});

export async function createPlan(
  input: z.infer<typeof planInputSchema>
): Promise<ActionResult<{ id: string }>> {
  // await requireSuperAdmin();
  const parsed = planInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };

  const count = await prisma.subscriptionPlan.count();
  const plan = await prisma.subscriptionPlan.create({
    data: { ...parsed.data, sortOrder: count },
  });

  await createSuperAdminNotification({
    title: "New Subscription Plan Created",
    message: `Subscription plan '${plan.name}' (${plan.cycle}) was created.`,
    type: "system_alert",
  });

  revalidatePath("/settings/subscription");
  return { data: { id: plan.id.toString() } };
}

export async function updatePlan(
  id: bigint,
  input: z.infer<typeof planInputSchema>
): Promise<ActionResult<true>> {
  // await requireSuperAdmin();
  const parsed = planInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };

  await prisma.subscriptionPlan.update({ where: { id }, data: parsed.data });

  await createSuperAdminNotification({
    title: "Subscription Plan Updated",
    message: `Plan '${input.name}' pricing or cycle configuration was updated.`,
    type: "system_alert",
  });

  revalidatePath("/settings/subscription");
  return { data: true };
}

export async function deletePlan(id: bigint): Promise<ActionResult<true>> {
  // await requireSuperAdmin();
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!plan) return { error: "Plan not found." };
  if (plan.isDefault) return { error: "Can't delete the default plan — set another plan as default first." };

  await prisma.subscriptionPlan.delete({ where: { id } });

  await createSuperAdminNotification({
    title: "Subscription Plan Deleted",
    message: `Plan '${plan.name}' was deleted.`,
    type: "system_alert",
  });

  revalidatePath("/settings/subscription");
  return { data: true };
}

export async function setDefaultPlan(id: bigint): Promise<ActionResult<true>> {
  // await requireSuperAdmin();
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!plan) return { error: "Plan not found." };

  await prisma.$transaction([
    prisma.subscriptionPlan.updateMany({ data: { isDefault: false }, where: {} }),
    prisma.subscriptionPlan.update({ where: { id }, data: { isDefault: true } }),
  ]);

  await createSuperAdminNotification({
    title: "Default Subscription Plan Changed",
    message: `'${plan.name}' is now set as the default subscription plan.`,
    type: "system_alert",
  });

  revalidatePath("/settings/subscription");
  return { data: true };
}

// ---------------------------------------------------------------------------
// Trial / Billing / Grace period settings
// ---------------------------------------------------------------------------

export async function getSubscriptionSettings() {
  // await requireSuperAdmin();
  const settings = await prisma.subscriptionSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  // Same Decimal-serialization issue as above — convert before returning.
  return { ...settings, taxRate: Number(settings.taxRate) };
}

const settingsInputSchema = z.object({
  trialEnabled: z.boolean(),
  trialDays: z.number().int().min(0).max(365),
  requireCardForTrial: z.boolean(),
  taxRate: z.number().min(0).max(100),
  invoicePrefix: z.string().min(1).max(10),
  autoGenerateInvoice: z.boolean(),
  gracePeriodDays: z.number().int().min(0).max(90),
  sendReminders: z.boolean(),
  autoSuspend: z.boolean(),
});

export async function updateSubscriptionSettings(
  input: z.infer<typeof settingsInputSchema>
): Promise<ActionResult<true>> {
  // await requireSuperAdmin();
  const parsed = settingsInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };

  await prisma.subscriptionSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  await createSuperAdminNotification({
    title: "Subscription Rules Updated",
    message: "Trial days, tax rate, or grace period settings were updated.",
    type: "system_alert",
  });

  revalidatePath("/settings/subscription");
  return { data: true };
}