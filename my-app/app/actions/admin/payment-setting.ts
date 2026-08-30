"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

// Payment configuration is more sensitive than general staff duties —
// intentionally narrower than the POS/order ALLOWED_ROLES pattern.
const ALLOWED_ROLES = ["owner", "manager"];

async function requireBusinessId(): Promise<bigint | null> {
  const session = await getSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) return null;
  const staff = await prisma.staff.findUnique({
    where: { id: BigInt(session.userId) },
    select: { businessId: true },
  });
  return staff?.businessId ?? null;
}

const GATEWAY_NAMES: Record<string, string> = { esewa: "eSewa", fonepay: "FonePay" };
const METHOD_NAMES: Record<string, string> = { cod: "Cash on Delivery" };

export async function togglePaymentMethodAction(
  methodKey: string,
  enabled: boolean
): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  try {
    await prisma.paymentMethod.upsert({
      where: { businessId_methodKey: { businessId, methodKey } },
      update: { enabled },
      create: { businessId, methodKey, name: METHOD_NAMES[methodKey] ?? methodKey, enabled },
    });
    revalidatePath("/settings/payment");
    return { success: true };
  } catch (err) {
    console.error("Failed to toggle payment method:", err);
    return { success: false, message: "Couldn't update that payment method." };
  }
}

/** Enables/disables a gateway and, if provided, updates its credentials. */
export async function saveGatewayAction(input: {
  gatewayKey: string;
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
}): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  try {
    await prisma.paymentGateway.upsert({
      where: { businessId_gatewayKey: { businessId, gatewayKey: input.gatewayKey } },
      update: {
        enabled: input.enabled,
        ...(input.apiKey !== undefined ? { apiKeyEnc: input.apiKey || null } : {}),
        ...(input.secretKey !== undefined ? { secretKeyEnc: input.secretKey || null } : {}),
        // Credentials changed — the last test result no longer means anything.
        ...(input.apiKey !== undefined || input.secretKey !== undefined ? { lastTestOk: null } : {}),
      },
      create: {
        businessId,
        gatewayKey: input.gatewayKey,
        name: GATEWAY_NAMES[input.gatewayKey] ?? input.gatewayKey,
        enabled: input.enabled,
        apiKeyEnc: input.apiKey || null,
        secretKeyEnc: input.secretKey || null,
      },
    });
    revalidatePath("/settings/payment");
    return { success: true };
  } catch (err) {
    console.error("Failed to save gateway:", err);
    return { success: false, message: "Couldn't save that gateway's settings." };
  }
}

/**
 * STUB: this confirms keys are present and marks the gateway as tested.
 * Swap the marked block for a real call to eSewa's / FonePay's status or
 * test-transaction endpoint using the stored credentials before relying on
 * this in production — right now it cannot actually detect wrong keys.
 */
export async function testGatewayConnectionAction(
  gatewayKey: string
): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  const gateway = await prisma.paymentGateway.findUnique({
    where: { businessId_gatewayKey: { businessId, gatewayKey } },
  });

  if (!gateway?.apiKeyEnc || !gateway?.secretKeyEnc) {
    return { success: false, message: "Add both keys before testing the connection." };
  }

  // ── TODO: replace with a real eSewa / FonePay API call ──
  const ok = true;
  // ──────────────────────────────────────────────────────

  await prisma.paymentGateway.update({
    where: { businessId_gatewayKey: { businessId, gatewayKey } },
    data: { lastTestOk: ok },
  });

  revalidatePath("/settings/payment");
  return ok ? { success: true } : { success: false, message: "Connection test failed — check your keys." };
}

export async function updatePaymentSettingsAction(input: {
  transactionFee: number;
  feeBearer: "Business" | "Customer";
  autoRefund: boolean;
  refundWindowDays: number;
  manualApproval: boolean;
}): Promise<{ success: boolean; message?: string }> {
  const businessId = await requireBusinessId();
  if (!businessId) return { success: false, message: "Not authenticated" };

  if (input.transactionFee < 0 || input.transactionFee > 100) {
    return { success: false, message: "Transaction fee must be between 0 and 100." };
  }
  if (input.refundWindowDays < 0) {
    return { success: false, message: "Refund window can't be negative." };
  }

  try {
    await prisma.paymentSettings.upsert({
      where: { businessId },
      update: input,
      create: { businessId, ...input },
    });
    revalidatePath("/settings/payment");
    return { success: true };
  } catch (err) {
    console.error("Failed to update payment settings:", err);
    return { success: false, message: "Couldn't save payout settings." };
  }
}