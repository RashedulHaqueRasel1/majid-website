import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const userRole = (token?.role as string)?.toUpperCase();
  const isShopkeeper = userRole === "SHOPKEEPER";
  const isUser = userRole === "USER" || userRole === "CUSTOMER";
  const isGuest = !token;

  // Protect shopkeeper routes
  if (pathname.startsWith("/shopkeeper")) {
    if (isGuest) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }
    if (isUser) {
      const newPath = pathname.replace(/^\/shopkeeper/, "/customer");
      return NextResponse.redirect(new URL(newPath, request.url));
    }
  }

  // Protect customer routes
  if (pathname.startsWith("/customer")) {
    if (isGuest) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }
    if (isShopkeeper) {
      const newPath = pathname.replace(/^\/customer/, "/shopkeeper");
      return NextResponse.redirect(new URL(newPath, request.url));
    }
  }

  // General dashboard protection
  if (pathname.startsWith("/dashboard")) {
    if (isGuest) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }
    // Redirect generic dashboard based on role
    if (isShopkeeper) {
      return NextResponse.redirect(
        new URL("/shopkeeper/dashboard", request.url),
      );
    } else if (isUser) {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
