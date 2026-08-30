"use server";

import crypto from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { buildEsewaPaymentForm } from "@/lib/payment-gateway/esewa";
import { buildFonepayRedirectUrl } from "@/lib/payment-gateway/fonepay";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export type PaymentMethodOption = {
  key: string;
  name: string;
  kind: "cod" | "gateway";
};

const METHOD_DISPLAY_NAMES: Record<string, string> = {
  cod: "Cash on Delivery",
};
const GATEWAY_DISPLAY_NAMES: Record<string, string> = {
  esewa: "eSewa",
  fonepay: "FonePay",
};

export async function getAvailablePaymentMethods(
  businessId: string
): Promise<PaymentMethodOption[]> {
  const id = BigInt(businessId);

  const [methods, gateways] = await Promise.all([
    prisma.paymentMethod.findMany({ where: { businessId: id, enabled: true } }),
    prisma.paymentGateway.findMany({
      where: {
        businessId: id,
        enabled: true,
        apiKeyEnc: { not: null },
        secretKeyEnc: { not: null },
      },
    }),
  ]);

  const methodOptions: PaymentMethodOption[] = methods.map((m) => ({
    key: m.methodKey,
    name: m.name || METHOD_DISPLAY_NAMES[m.methodKey] || m.methodKey,
    kind: "cod",
  }));

  const gatewayOptions: PaymentMethodOption[] = gateways.map((g) => ({
    key: g.gatewayKey,
    name: g.name || GATEWAY_DISPLAY_NAMES[g.gatewayKey] || g.gatewayKey,
    kind: "gateway",
  }));

  return [...methodOptions, ...gatewayOptions];
}

export type InitiatePaymentResult =
  | { success: true; type: "cod" }
  | { success: true; type: "redirect_form"; gatewayUrl: string; fields: Record<string, string> }
  | { success: true; type: "redirect_url"; url: string }
  | { success: false; message: string };

/**
 * Starts the actual payment. For "cod" this just acknowledges the choice —
 * no money has moved. For gateway methods, this returns everything the
 * client needs to send the customer's browser to eSewa/FonePay's own
 * hosted page, where the real deduction happens.
 */
export async function initiatePaymentAction(
  orderId: string,
  methodKey: string
): Promise<InitiatePaymentResult> {
  const order = await prisma.order.findUnique({ where: { id: BigInt(orderId) } });
  if (!order) return { success: false, message: "Order not found." };

  if (methodKey === "cod") {
    // paymentStatus stays "unpaid" — cash hasn't been collected yet.
    return { success: true, type: "cod" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error("NEXT_PUBLIC_APP_URL is not set — gateway redirects cannot be built.");
    return { success: false, message: "Online payment is temporarily unavailable. Please pay at the counter." };
  }

  // A random suffix keeps each payment ATTEMPT unique (gateways reject
  // reused transaction IDs on retry), while still being findable by the
  // callback route via Order.paymentRef.
  const paymentRef = `ORD${orderId}-${crypto.randomBytes(4).toString("hex")}`;
  await prisma.order.update({ where: { id: order.id }, data: { paymentRef } });

  const amount = Number(order.totalAmount);

  if (methodKey === "esewa") {
    const { gatewayUrl, fields } = buildEsewaPaymentForm({
      amount,
      transactionUuid: paymentRef,
      successUrl: `${appUrl}/api/payment/esewa/success`,
      failureUrl: `${appUrl}/api/payment/esewa/failure`,
    });
    return { success: true, type: "redirect_form", gatewayUrl, fields };
  }

  if (methodKey === "fonepay") {
    const url = buildFonepayRedirectUrl({
      amount,
      prn: paymentRef,
      remarks1: `Order #${orderId}`,
      returnUrl: `${appUrl}/api/payment/fonepay/callback`,
    });
    return { success: true, type: "redirect_url", url };
  }

  return { success: false, message: "That payment method isn't supported yet." };
}