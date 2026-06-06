import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC.some((p) => pathname === p) || pathname.startsWith("/dashboard/invite");
  if (isPublic) return NextResponse.next();

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
