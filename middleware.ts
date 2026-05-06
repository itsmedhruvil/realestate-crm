import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const debugCookieParam = request.nextUrl.searchParams.get("debug-cookies");

  if (debugCookieParam === "1") {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean);

    const debugData = {
      cookieHeaderLength: cookieHeader.length,
      cookieCount: cookies.length,
      cookies,
    };

    console.log("[debug cookies]", debugData);
    return NextResponse.json(debugData);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
