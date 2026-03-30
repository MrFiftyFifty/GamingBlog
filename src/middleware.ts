export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/moderation/:path*",
    "/forum/:slug/new",
    "/forum/:slug/topic/:id/edit",
  ],
};
