"use server";

// Adjust this import to wherever your Prisma client singleton lives.
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// NOTE: apiKeyEnc / secretKeyEnc are stored as plain text for now. Before
// production, encrypt on write and decrypt on read instead of writing
// req.apiKey directly to apiKeyEnc.

const DEFAULT_GATEWAYS = [
  { gatewayKey: "esewa", name: "eSewa" },
  { gatewayKey: "khalti", name: "Khalti" },
];

const DEFAULT_METHODS = [
  { methodKey: "wallet", name: "Digital Wallet (eSewa / Khalti)" },
  { methodKey: "cod", name: "Cash on Delivery" },
];

function maskKey(value: string | null): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `••••••${value.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Refund settings (per business)
// ---------------------------------------------------------------------------
export type RefundSettings = {
  autoRefund: boolean;
  refundWindowDays: number;
};

export async function getPaymentSettings(businessId: bigint): Promise<RefundSettings> {
  try {
    const row = await prisma.paymentSettings.findUnique({ where: { businessId } });
    if (row) {
      return { autoRefund: row.autoRefund, refundWindowDays: row.refundWindowDays };
    }
    const created = await prisma.paymentSettings.create({ data: { businessId } });
    return { autoRefund: created.autoRefund, refundWindowDays: created.refundWindowDays };
  } catch (err) {
    console.error("getPaymentSettings error:", err);
    return { autoRefund: true, refundWindowDays: 7 };
  }
}

export async function updatePaymentSettings(
  businessId: bigint,
  input: RefundSettings
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.paymentSettings.upsert({
      where: { businessId },
      update: {
        autoRefund: input.autoRefund,
        refundWindowDays: input.refundWindowDays,
      },
      create: {
        businessId,
        autoRefund: input.autoRefund,
        refundWindowDays: input.refundWindowDays,
      },
    });
    revalidatePath("/settings/payment");
    return { success: true, message: "Refund settings saved." };
  } catch (err) {
    console.error("updatePaymentSettings error:", err);
    return { success: false, message: "Failed to save refund settings." };
  }
}

// ---------------------------------------------------------------------------
// Gateways (eSewa / Khalti)
// ---------------------------------------------------------------------------
export type Gateway = {
  id: string;
  gatewayKey: string;
  name: string;
  enabled: boolean;
  apiKey: string; // masked
  lastTestOk: boolean | null;
};

export async function getPaymentGateways(businessId: bigint): Promise<Gateway[]> {
  try {
    const existing = await prisma.paymentGateway.findMany({ where: { businessId } });
    const existingKeys = new Set(existing.map((g) => g.gatewayKey));

    const missing = DEFAULT_GATEWAYS.filter((g) => !existingKeys.has(g.gatewayKey));
    if (missing.length > 0) {
      await prisma.paymentGateway.createMany({
        data: missing.map((g) => ({
          businessId,
          gatewayKey: g.gatewayKey,
          name: g.name,
          enabled: true,
        })),
        skipDuplicates: true,
      });
    }

    const rows = missing.length > 0
      ? await prisma.paymentGateway.findMany({ where: { businessId } })
      : existing;

    const order = DEFAULT_GATEWAYS.map((g) => g.gatewayKey);
    const sorted = [...rows].sort((a, b) => order.indexOf(a.gatewayKey) - order.indexOf(b.gatewayKey));

    return sorted.map((g) => ({
      id: g.id.toString(),
      gatewayKey: g.gatewayKey,
      name: g.name,
      enabled: g.enabled,
      apiKey: maskKey(g.apiKeyEnc),
      lastTestOk: g.lastTestOk,
    }));
  } catch (err) {
    console.error("getPaymentGateways error:", err);
    return [];
  }
}

type UpdateGatewayInput = {
  gatewayKey: string;
  enabled?: boolean;
  apiKey?: string;
  secretKey?: string;
};

export async function updatePaymentGateway(
  businessId: bigint,
  input: UpdateGatewayInput
): Promise<{ success: boolean; message: string }> {
  try {
    const data: Record<string, unknown> = {};
    if (input.enabled !== undefined) data.enabled = input.enabled;
    if (input.apiKey !== undefined && input.apiKey !== "") data.apiKeyEnc = input.apiKey.trim();
    if (input.secretKey !== undefined && input.secretKey !== "") data.secretKeyEnc = input.secretKey.trim();

    await prisma.paymentGateway.upsert({
      where: { businessId_gatewayKey: { businessId, gatewayKey: input.gatewayKey } },
      update: data,
      create: {
        businessId,
        gatewayKey: input.gatewayKey,
        name: DEFAULT_GATEWAYS.find((g) => g.gatewayKey === input.gatewayKey)?.name ?? input.gatewayKey,
        enabled: input.enabled ?? true,
        apiKeyEnc: input.apiKey?.trim(),
        secretKeyEnc: input.secretKey?.trim(),
      },
    });

    revalidatePath("/settings/payment");
    return { success: true, message: "Gateway updated." };
  } catch (err) {
    console.error("updatePaymentGateway error:", err);
    return { success: false, message: "Failed to update gateway." };
  }
}

export async function testPaymentGateway(
  businessId: bigint,
  gatewayId: bigint
): Promise<{ success: boolean; message: string; data?: { success: boolean } }> {
  try {
    const gateway = await prisma.paymentGateway.findFirst({
      where: { id: gatewayId, businessId },
    });
    if (!gateway) {
      return { success: false, message: "Gateway not found." };
    }

    const ok = Boolean(gateway.apiKeyEnc && gateway.secretKeyEnc);

    await prisma.paymentGateway.update({
      where: { id: gatewayId },
      data: { lastTestOk: ok },
    });

    return {
      success: true,
      message: ok ? "Connection successful." : "Missing API key or secret key.",
      data: { success: ok },
    };
  } catch (err) {
    console.error("testPaymentGateway error:", err);
    return { success: false, message: "Test failed unexpectedly.", data: { success: false } };
  }
}

// ---------------------------------------------------------------------------
// Payment methods (Digital Wallet, COD)
// ---------------------------------------------------------------------------
export type Method = {
  id: string;
  methodKey: string;
  name: string;
  enabled: boolean;
};

export async function getPaymentMethods(businessId: bigint): Promise<Method[]> {
  try {
    const existing = await prisma.paymentMethod.findMany({ where: { businessId } });
    const existingKeys = new Set(existing.map((m) => m.methodKey));

    const missing = DEFAULT_METHODS.filter((m) => !existingKeys.has(m.methodKey));
    if (missing.length > 0) {
      await prisma.paymentMethod.createMany({
        data: missing.map((m) => ({ businessId, methodKey: m.methodKey, name: m.name, enabled: true })),
        skipDuplicates: true,
      });
    }

    const rows = missing.length > 0
      ? await prisma.paymentMethod.findMany({ where: { businessId } })
      : existing;

    const order = DEFAULT_METHODS.map((m) => m.methodKey);
    const sorted = [...rows].sort((a, b) => order.indexOf(a.methodKey) - order.indexOf(b.methodKey));

    return sorted.map((m) => ({
      id: m.id.toString(),
      methodKey: m.methodKey,
      name: m.name,
      enabled: m.enabled,
    }));
  } catch (err) {
    console.error("getPaymentMethods error:", err);
    return [];
  }
}

export async function togglePaymentMethod(
  businessId: bigint,
  input: { methodKey: string; enabled: boolean }
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.paymentMethod.upsert({
      where: { businessId_methodKey: { businessId, methodKey: input.methodKey } },
      update: { enabled: input.enabled },
      create: {
        businessId,
        methodKey: input.methodKey,
        name: DEFAULT_METHODS.find((m) => m.methodKey === input.methodKey)?.name ?? input.methodKey,
        enabled: input.enabled,
      },
    });
    revalidatePath("/settings/payment");
    return { success: true, message: "Payment method updated." };
  } catch (err) {
    console.error("togglePaymentMethod error:", err);
    return { success: false, message: "Failed to update payment method." };
  }
}