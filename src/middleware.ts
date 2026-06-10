import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { canAccessAdmin } from "@/lib/permissions";

const { auth } = NextAuth(authConfig);

const protectedPaths = [
  "/feed", "/explore", "/profile", "/messages", "/notifications",
  "/friends", "/groups", "/events", "/marketplace", "/reels",
  "/watch", "/live", "/gaming", "/saved", "/memories", "/settings",
  "/search", "/ads", "/pages",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isProtected && !req.auth?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canAccessAdmin(req.auth.user.role)) {
      return NextResponse.redirect(new URL("/feed?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/feed", "/explore", "/profile/:path*", "/messages", "/notifications",
    "/friends", "/groups", "/events", "/marketplace", "/reels",
    "/watch", "/live", "/gaming", "/saved", "/memories", "/settings",
    "/search", "/ads", "/pages",
  ],
};
