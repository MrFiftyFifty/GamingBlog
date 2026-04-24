import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const DISABLED_PATHS: RegExp[] = [
  /^\/messages(\/|$)/,
  /^\/settings(\/|$)/,
  /^\/moderation(\/|$)/,
  /^\/search(\/|$)/,
  /^\/user\/[^/]+/,
  /^\/auth\/forgot-password(\/|$)/,
  /^\/auth\/reset-password(\/|$)/,
  /^\/forum(\/|$)/,
];

const PROTECTED_PATHS: RegExp[] = [
  /^\/profile(\/|$)/,
  /^\/notifications(\/|$)/,
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (DISABLED_PATHS.some((re) => re.test(pathname))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (PROTECTED_PATHS.some((re) => re.test(pathname))) {
    const token = await getToken({ req });
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/moderation/:path*",
    "/search/:path*",
    "/user/:path*",
    "/forum/:path*",
    "/auth/forgot-password",
    "/auth/reset-password",
  ],
};
