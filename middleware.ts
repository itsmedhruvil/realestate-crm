import { type NextRequest } from "next/server";
import { proxy } from "@/proxy";

export async function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/signin", "/register", "/logout"],
};
