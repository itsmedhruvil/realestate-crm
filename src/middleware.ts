import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard"];
const authPaths = ["/signin", "/register"];

// API routes that should be publicly accessible
const publicApis = ["/api/inquiries", "/api/properties", "/api/webhooks"];

// Public pages accessible without authentication
const publicPages = ["/listings", "/contact"];

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Allow public API routes without auth
    const isPublicApi = publicApis.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (isPublicApi) {
      return NextResponse.next();
    }

    // Allow public pages without auth
    const isPublicPage = publicPages.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (isPublicPage) {
      return NextResponse.next();
    }

    // Allow root path without auth (redirects handled client-side)
    if (pathname === "/") {
      return NextResponse.next();
    }

    const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const isAuth = authPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (isProtected && !userId) {
      const signInUrl = new URL("/signin", req.url);
      signInUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (isAuth && userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } catch (error) {
    console.error("Middleware error:", error);
    // Allow request to proceed if auth check fails to avoid blocking the app entirely
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};