import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS: RegExp[] = [
  /^\/profile(\/|$)/,
  /^\/notifications(\/|$)/,
  /^\/messages(\/|$)/,
  /^\/settings(\/|$)/,
  /^\/moderation(\/|$)/,
  /^\/forum\/[^/]+\/new$/,
  /^\/forum\/[^/]+\/topic\/[^/]+\/edit$/,
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
    "/notifications/:path*",
    "/messages/:path*",
    "/settings/:path*",
    "/moderation/:path*",
    "/forum/:slug/new",
    "/forum/:slug/topic/:id/edit",
  ],
};
