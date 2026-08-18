"use server";

// actions/payment.ts
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, mask } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─────────────────────────────────────────────
// Transaction Fee + Refund Policy
// ─────────────────────────────────────────────

const settingsSchema = z.object({
  transactionFee: z.number().min(0).max(100).optional(),
  feeBearer: z.enum(["Business", "Customer", "Split Equally"]).optional(),
  autoRefund: z.boolean().optional(),
  refundWindowDays: z.number().int().min(0).max(365).optional(),
  manualApproval: z.boolean().optional(),
});

export async function getPaymentSettings(businessId: bigint) {
  const settings = await prisma.paymentSettings.upsert({
    where: { businessId },
    update: {},
    create: { businessId },
  });
  return { ...settings, businessId: settings.businessId.toString() };
}

export async function updatePaymentSettings(
  businessId: bigint,
  input: z.infer<typeof settingsSchema>
) {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const updated = await prisma.paymentSettings.upsert({
    where: { businessId },
    update: parsed.data,
    create: { businessId, ...parsed.data },
  });

  revalidatePath("/settings/payment");
  return { data: { ...updated, businessId: updated.businessId.toString() } };
}

// ─────────────────────────────────────────────
// Payment Gateways (eSewa / Khalti / Stripe)
// ─────────────────────────────────────────────

export async function getPaymentGateways(businessId: bigint) {
  const gateways = await prisma.paymentGateway.findMany({ where: { businessId } });

  return gateways.map((g) => ({
    id: g.id.toString(),
    gatewayKey: g.gatewayKey,
    name: g.name,
    enabled: g.enabled,
    apiKey: g.apiKeyEnc ? mask(decrypt(g.apiKeyEnc)) : "",
    lastTestOk: g.lastTestOk,
  }));
}

const gatewaySchema = z.object({
  gatewayKey: z.string(),
  enabled: z.boolean().optional(),
  apiKey: z.string().optional(),
  secretKey: z.string().optional(),
});

export async function updatePaymentGateway(
  businessId: bigint,
  input: z.infer<typeof gatewaySchema>
) {
  const parsed = gatewaySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { gatewayKey, enabled, apiKey, secretKey } = parsed.data;
  const data: Record<string, unknown> = {};
  if (enabled !== undefined) data.enabled = enabled;
  if (apiKey) data.apiKeyEnc = encrypt(apiKey);
  if (secretKey) data.secretKeyEnc = encrypt(secretKey);

  const updated = await prisma.paymentGateway.upsert({
    where: { businessId_gatewayKey: { businessId, gatewayKey } },
    update: data,
    create: { businessId, gatewayKey, name: gatewayKey, ...data },
  });

  revalidatePath("/settings/payment");
  return { data: { id: updated.id.toString(), gatewayKey, enabled: updated.enabled } };
}

export async function testPaymentGateway(businessId: bigint, gatewayId: bigint) {
  const gateway = await prisma.paymentGateway.findFirst({
    where: { id: gatewayId, businessId },
  });
  if (!gateway?.apiKeyEnc) return { error: "Not configured" };

  const apiKey = decrypt(gateway.apiKeyEnc);
  let ok = false;
  try {
    // TODO: replace with real call per provider (eSewa/Khalti/Stripe)
    ok = !!apiKey;
  } catch {
    ok = false;
  }

  await prisma.paymentGateway.update({ where: { id: gateway.id }, data: { lastTestOk: ok } });
  revalidatePath("/settings/payment");
  return { data: { success: ok } };
}

// ─────────────────────────────────────────────
// Supported Payment Methods (COD / Wallet / Card / Bank)
// ─────────────────────────────────────────────

export async function getPaymentMethods(businessId: bigint) {
  const methods = await prisma.paymentMethod.findMany({ where: { businessId } });
  return methods.map((m) => ({ ...m, id: m.id.toString(), businessId: m.businessId.toString() }));
}

const methodSchema = z.object({ methodKey: z.string(), enabled: z.boolean() });

export async function togglePaymentMethod(
  businessId: bigint,
  input: z.infer<typeof methodSchema>
) {
  const parsed = methodSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const updated = await prisma.paymentMethod.upsert({
    where: { businessId_methodKey: { businessId, methodKey: parsed.data.methodKey } },
    update: { enabled: parsed.data.enabled },
    create: {
      businessId,
      methodKey: parsed.data.methodKey,
      name: parsed.data.methodKey,
      enabled: parsed.data.enabled,
    },
  });

  revalidatePath("/settings/payment");
  return { data: { ...updated, id: updated.id.toString(), businessId: updated.businessId.toString() } };
}