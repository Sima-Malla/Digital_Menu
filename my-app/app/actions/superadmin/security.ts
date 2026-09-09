"use server";

// app/actions/security.ts
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSuperAdminNotification } from "@/lib/superadmin-notifications";

const schema = z.object({
  minLength: z.number().int().min(4).max(64).optional(),
  requireUppercase: z.boolean().optional(),
  requireNumber: z.boolean().optional(),
  requireSpecialChar: z.boolean().optional(),

  enforce2FA: z.boolean().optional(),
  twoFAMethod: z.enum(["Authenticator App", "SMS", "Email"]).optional(),

  sessionTimeoutMinutes: z.number().int().min(1).max(1440).optional(),
  maxLoginAttempts: z.number().int().min(1).max(20).optional(),
  autoBlockMinutes: z.number().int().min(1).max(1440).optional(),

  auditRetentionPeriod: z.enum(["30 days", "90 days", "180 days", "1 year", "Indefinite"]).optional(),
});

export async function getSecuritySettings() {
  const settings = await prisma.securitySettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return settings;
}

export async function updateSecuritySettings(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const updated = await prisma.securitySettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  await createSuperAdminNotification({
    title: "Security Settings Updated",
    message: "Platform security policies (2FA, password policy, or session limits) were updated.",
    type: "system_alert",
  });

  revalidatePath("/settings/security");
  return { data: updated };
}