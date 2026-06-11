export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/organizations/:path*",
    "/audits/:path*",
    "/self-audit/:path*",
    "/settings/:path*"
  ]
};
