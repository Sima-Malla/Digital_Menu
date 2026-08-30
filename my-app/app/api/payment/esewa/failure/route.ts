import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  return NextResponse.redirect(`${appUrl}/payment-result?status=failed&reason=cancelled`);
}