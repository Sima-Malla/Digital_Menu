import { NextRequest, NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import {
  decodeEsewaCallback,
  verifyEsewaCallbackSignature,
  checkEsewaTransactionStatus,
} from "@/lib/payment-gateway/esewa";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const encodedData = req.nextUrl.searchParams.get("data");

  if (!encodedData) {
    return NextResponse.redirect(`${appUrl}/payment-result?status=failed&reason=missing_data`);
  }

  const payload = decodeEsewaCallback(encodedData);
  if (!payload || !verifyEsewaCallbackSignature(payload)) {
    console.error("eSewa callback signature mismatch — possible tampering:", payload);
    return NextResponse.redirect(`${appUrl}/payment-result?status=failed&reason=signature`);
  }

  const order = await prisma.order.findFirst({ where: { paymentRef: payload.transaction_uuid } });
  if (!order) {
    return NextResponse.redirect(`${appUrl}/payment-result?status=failed&reason=order_not_found`);
  }

  // Defence in depth — don't trust the redirect payload alone.
  const statusCheck = await checkEsewaTransactionStatus({
    transactionUuid: payload.transaction_uuid,
    totalAmount: Number(Number(payload.total_amount).toFixed(2)),
  });
  const verifiedPaid = payload.status === "COMPLETE" && statusCheck?.status === "COMPLETE";

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: verifiedPaid ? "paid" : "failed" },
  });

  return NextResponse.redirect(
    `${appUrl}/payment-result?status=${verifiedPaid ? "paid" : "failed"}&orderId=${order.id}`
  );
}