import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/api"];
const authPaths = ["/signin", "/register"];

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

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