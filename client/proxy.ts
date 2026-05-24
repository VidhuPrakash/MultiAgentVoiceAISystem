import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get("role")?.value;

  // Skip role-based redirects for RSC/prefetch/HMR internal requests to
  // prevent infinite redirect loops caused by speculative prefetching.
  const isInternalRequest =
    req.headers.has("RSC") ||
    req.headers.has("Next-Router-Prefetch") ||
    req.headers.has("Next-HMR-Refresh");

  const isAuthPage = PUBLIC.some((p) => pathname.startsWith(p));
  const isAdminPath = pathname.startsWith("/admin");

  if (!isInternalRequest) {
    if (pathname === "/") {
      if (!role) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url),
      );
    }

    // Unauthenticated user
    if (!role) {
      if (!isAuthPage) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      return NextResponse.next();
    }

    // Authenticated users cannot visit auth pages
    if (isAuthPage) {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url),
      );
    }

    // Admin trying to access non-admin routes
    if (role === "admin" && !isAdminPath) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Normal user trying to access admin routes
    if (role !== "admin" && isAdminPath) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
