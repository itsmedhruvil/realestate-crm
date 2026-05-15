import { clerkMiddleware } from "@clerk/nextjs/server";

const protectedPaths = ["/dashboard", "/api"];
const authPaths = ["/signin", "/register"];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuth = authPaths.includes(pathname);

  if (isProtected && !userId) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("next", pathname);
    return Response.redirect(signInUrl);
  }

  if (isAuth && userId) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};