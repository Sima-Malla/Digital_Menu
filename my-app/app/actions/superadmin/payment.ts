"use server";

// app/actions/superadmin/payment.ts
//
// Backend for /app/settings/payment/page.tsx.
// Matches the real schema.prisma: PaymentGateway, PaymentMethod, PaymentSettings
// (apiKeyEnc / secretKeyEnc field names, gateways: esewa | khalti | stripe,
// methods: cod | wallet | card | bank).

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, mask } from "@/lib/crypto";
// import { requireSuperAdmin } from "@/lib/session"; // TODO: wire real auth

type ActionResult<T> = { data?: T; error?: string };

const DEFAULT_GATEWAYS = [
  { gatewayKey: "esewa", name: "eSewa" },
  { gatewayKey: "khalti", name: "Khalti" },
  { gatewayKey: "stripe", name: "Stripe" },
] as const;

const DEFAULT_METHODS = [
  { methodKey: "cod", name: "Cash on Delivery" },
  { methodKey: "wallet", name: "Digital Wallet (eSewa / Khalti)" },
  { methodKey: "card", name: "Credit / Debit Card" },
  { methodKey: "bank", name: "Bank Transfer" },
] as const;

// ---------------------------------------------------------------------------
// Settings (fee / refund policy)
// ---------------------------------------------------------------------------

export async function getPaymentSettings(businessId: bigint) {
  // await requireSuperAdmin();
  const settings = await prisma.paymentSettings.upsert({
    where: { businessId },
    update: {},
    create: { businessId },
  });
  return settings;
}

const updateSettingsSchema = z.object({
  transactionFee: z.number().min(0).max(100),
  feeBearer: z.enum(["Business", "Customer", "Split Equally"]),
  autoRefund: z.boolean(),
  refundWindowDays: z.number().int().min(0).max(365),
  manualApproval: z.boolean(),
});

export async function updatePaymentSettings(
  businessId: bigint,
  input: z.infer<typeof updateSettingsSchema>
): Promise<ActionResult<true>> {
  // await requireSuperAdmin();
  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.paymentSettings.upsert({
    where: { businessId },
    update: parsed.data,
    create: { businessId, ...parsed.data },
  });

  revalidatePath("/settings/payment");
  return { data: true };
}

// ---------------------------------------------------------------------------
// Gateways
// ---------------------------------------------------------------------------

async function ensureGatewaysSeeded(businessId: bigint) {
  const existing = await prisma.paymentGateway.findMany({ where: { businessId } });
  const existingKeys = new Set(existing.map((g) => g.gatewayKey));
  const missing = DEFAULT_GATEWAYS.filter((g) => !existingKeys.has(g.gatewayKey));

  if (missing.length > 0) {
    await prisma.paymentGateway.createMany({
      data: missing.map((g) => ({ businessId, gatewayKey: g.gatewayKey, name: g.name })),
      skipDuplicates: true,
    });
    return prisma.paymentGateway.findMany({ where: { businessId }, orderBy: { id: "asc" } });
  }
  return existing;
}

export async function getPaymentGateways(businessId: bigint) {
  // await requireSuperAdmin();
  const gateways = await ensureGatewaysSeeded(businessId);
  return gateways.map((g) => ({
    id: g.id.toString(),
    gatewayKey: g.gatewayKey,
    name: g.name,
    enabled: g.enabled,
    apiKey: mask(g.apiKeyEnc ? decrypt(g.apiKeyEnc) : ""),
    lastTestOk: g.lastTestOk,
  }));
}

const updateGatewaySchema = z.object({
  gatewayKey: z.string().min(1),
  enabled: z.boolean().optional(),
  apiKey: z.string().optional(),
  secretKey: z.string().optional(),
});

export async function updatePaymentGateway(
  businessId: bigint,
  input: z.infer<typeof updateGatewaySchema>
): Promise<ActionResult<true>> {
  // await requireSuperAdmin();
  const parsed = updateGatewaySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  const { gatewayKey, enabled, apiKey, secretKey } = parsed.data;

  const data: Record<string, unknown> = {};
  if (enabled !== undefined) data.enabled = enabled;
  if (apiKey) data.apiKeyEnc = encrypt(apiKey);
  if (secretKey) data.secretKeyEnc = encrypt(secretKey);

  const gatewayMeta = DEFAULT_GATEWAYS.find((g) => g.gatewayKey === gatewayKey);

  await prisma.paymentGateway.upsert({
    where: { businessId_gatewayKey: { businessId, gatewayKey } },
    update: data,
    create: {
      businessId,
      gatewayKey,
      name: gatewayMeta?.name ?? gatewayKey,
      ...data,
    },
  });

  revalidatePath("/settings/payment");
  return { data: true };
}

// --- Test connection ---------------------------------------------------

async function testStripe(secretKey: string): Promise<boolean> {
  const res = await fetch("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  return res.ok;
}

// eSewa and Khalti (Nepal) don't expose a lightweight "ping" endpoint the
// way Stripe does — verifying them properly means running a real
// transaction against their merchant APIs. For now this does a basic
// format/presence check; swap in a real call against their docs
// (developer.esewa.com.np / docs.khalti.com) when you're ready.
async function testEsewaOrKhalti(apiKey: string, secretKey: string): Promise<boolean> {
  return Boolean(apiKey && secretKey && apiKey.length > 6 && secretKey.length > 6);
}

export async function testPaymentGateway(
  businessId: bigint,
  gatewayId: bigint
): Promise<ActionResult<{ success: boolean }>> {
  // await requireSuperAdmin();
  const gateway = await prisma.paymentGateway.findFirst({ where: { id: gatewayId, businessId } });
  if (!gateway) return { error: "Gateway not found." };
  if (!gateway.apiKeyEnc) return { error: "No API key configured yet." };

  const apiKey = decrypt(gateway.apiKeyEnc);
  const secretKey = gateway.secretKeyEnc ? decrypt(gateway.secretKeyEnc) : "";

  let success = false;
  try {
    switch (gateway.gatewayKey) {
      case "stripe":
        success = await testStripe(secretKey || apiKey);
        break;
      case "esewa":
      case "khalti":
        success = await testEsewaOrKhalti(apiKey, secretKey);
        break;
      default:
        return { error: `No test handler for gateway "${gateway.gatewayKey}".` };
    }
  } catch {
    success = false;
  }

  await prisma.paymentGateway.update({
    where: { id: gateway.id },
    data: { lastTestOk: success },
  });

  revalidatePath("/settings/payment");
  return { data: { success } };
}

// ---------------------------------------------------------------------------
// Methods
// ---------------------------------------------------------------------------

async function ensureMethodsSeeded(businessId: bigint) {
  const existing = await prisma.paymentMethod.findMany({ where: { businessId } });
  const existingKeys = new Set(existing.map((m) => m.methodKey));
  const missing = DEFAULT_METHODS.filter((m) => !existingKeys.has(m.methodKey));

  if (missing.length > 0) {
    await prisma.paymentMethod.createMany({
      data: missing.map((m) => ({ businessId, methodKey: m.methodKey, name: m.name })),
      skipDuplicates: true,
    });
    return prisma.paymentMethod.findMany({ where: { businessId }, orderBy: { id: "asc" } });
  }
  return existing;
}

export async function getPaymentMethods(businessId: bigint) {
  // await requireSuperAdmin();
  const methods = await ensureMethodsSeeded(businessId);
  return methods.map((m) => ({
    id: m.id.toString(),
    methodKey: m.methodKey,
    name: m.name,
    enabled: m.enabled,
  }));
}

const toggleMethodSchema = z.object({
  methodKey: z.string().min(1),
  enabled: z.boolean(),
});

export async function togglePaymentMethod(
  businessId: bigint,
  input: z.infer<typeof toggleMethodSchema>
): Promise<ActionResult<true>> {
  // await requireSuperAdmin();
  const parsed = toggleMethodSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  const { methodKey, enabled } = parsed.data;
  const methodMeta = DEFAULT_METHODS.find((m) => m.methodKey === methodKey);

  await prisma.paymentMethod.upsert({
    where: { businessId_methodKey: { businessId, methodKey } },
    update: { enabled },
    create: { businessId, methodKey, name: methodMeta?.name ?? methodKey, enabled },
  });

  revalidatePath("/settings/payment");
  return { data: true };
}