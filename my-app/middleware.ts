import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Redirect बन्द गरिएको छ - अव सिधै Staff Dashboard र Live Orders खुल्नेछ
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/staffdashboard/:path*",
    "/live-orders/:path*",
    "/menu-editor/:path*",
    "/aanalytics/:path*",
    "/settings/:path*",
    "/sorder/:path*",
  ],
};