import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session";


export async function middleware(request: NextRequest) {

  const token = request.cookies.get(COOKIE_NAME)?.value;


  const session = token
    ? await verifySessionToken(token)
    : null;


  if (!session) {
    return NextResponse.redirect(
      new URL("/slogin", request.url)
    );
  }


  return NextResponse.next();
}


export const config = {
  matcher: [
    "/staffdashboard/:path*"
  ],
};