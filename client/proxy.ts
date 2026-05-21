import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

type JwtPayload = { userId: string; role: "admin" | "user"; exp: number };

const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_COOKIE!;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshCookie = req.cookies.get(REFRESH_COOKIE)?.value;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!refreshCookie) {
    if (isAuthPage) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { role, exp } = jwtDecode<JwtPayload>(refreshCookie);

    if (exp * 1000 < Date.now()) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete(REFRESH_COOKIE);
      return res;
    }

    if (isAuthPage)
      return NextResponse.redirect(new URL("/dashboard", req.url));

    if (pathname.startsWith("/admin") && role !== "admin")
      return NextResponse.redirect(new URL("/dashboard", req.url));

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
