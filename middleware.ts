import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Vérifier les permissions en fonction du rôle
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/seller") && token?.role !== "SELLER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/manager") && token?.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/marketplace/:path*",
    "/admin/:path*",
    "/markets/:path*",
    "/seller/:path*",
    "/checkout/:path*",
    "/account/:path*",
    "/api/orders/:path*",
    "/api/products/:path*",
    "/api/markets/:path*",
    "/api/admin/:path*",
    "/api/seller/:path*",
  ],
}; 