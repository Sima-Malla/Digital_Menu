"use server";

import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type PaymentMethodOption = {
  key: string; // "cod" | "wallet" | "card" | "bank" | "esewa" | "khalti" ...
  name: string;
};

/** Payment methods this business has actually enabled — drives which buttons the checkout modal shows. */
export async function getAvailablePaymentMethods(businessId: string): Promise<PaymentMethodOption[]> {
  const [methods, gateways] = await Promise.all([
    prisma.paymentMethod.findMany({
      where: { businessId: BigInt(businessId), enabled: true },
    }),
    prisma.paymentGateway.findMany({
      where: { businessId: BigInt(businessId), enabled: true },
    }),
  ]);

  return [
    ...methods.map((m) => ({ key: m.methodKey, name: m.name })),
    ...gateways.map((g) => ({ key: g.gatewayKey, name: g.name })),
  ];
}

export type MarkPaidResult = { success: boolean; message?: string };

/**
 * Marks an already-created order as paid. This does NOT process a real
 * card/wallet transaction — it's the "confirm payment received" step for
 * cash-on-delivery / at-counter / manually-confirmed gateway flows.
 * A real card/esewa/khalti integration would call out to that provider's
 * API here and only mark paid on a verified callback — see note below.
 */
export async function markOrderPaidAction(
  orderId: string,
  methodKey: string
): Promise<MarkPaidResult> {
  if (!orderId || !methodKey) {
    return { success: false, message: "Missing order or payment method." };
  }

  const order = await prisma.order.findUnique({ where: { id: BigInt(orderId) } });
  if (!order) {
    return { success: false, message: "Order not found." };
  }
  if (order.paymentStatus === "paid") {
    return { success: true }; // already paid — idempotent, not an error
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "paid" },
  });

  revalidatePath("/orders");
  revalidatePath("/live-orders");

  return { success: true };
}