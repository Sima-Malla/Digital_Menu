import { NextRequest, NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { verifyFonepayTransaction } from "@/lib/payment-gateway/fonepay";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString ?? "" }) });

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const prn = req.nextUrl.searchParams.get("PRN");
  const bid = req.nextUrl.searchParams.get("BID");
  const uid = req.nextUrl.searchParams.get("UID");
  const amount = req.nextUrl.searchParams.get("PAMT") ?? req.nextUrl.searchParams.get("AMT");

  if (!prn || !bid || !uid || !amount) {
    return NextResponse.redirect(`${appUrl}/payment-result?status=failed&reason=missing_params`);
  }

  const order = await prisma.order.findFirst({ where: { paymentRef: prn } });
  if (!order) {
    return NextResponse.redirect(`${appUrl}/payment-result?status=failed&reason=order_not_found`);
  }

  const verification = await verifyFonepayTransaction({ prn, amount, bid, uid });
  const verifiedPaid = verification?.paymentSuccess === true;

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: verifiedPaid ? "paid" : "failed" },
  });

  return NextResponse.redirect(
    `${appUrl}/payment-result?status=${verifiedPaid ? "paid" : "failed"}&orderId=${order.id}`
  );
}