import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

const protectedRoutePrefixes = ["/dashboard", "/profile"];
const unauthenticatedOnlyRoutePrefixes = ["/sign-in", "/sign-up"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const isProtectedRoute = matchesPrefix(pathname, protectedRoutePrefixes);
  const isUnauthenticatedOnlyRoute = matchesPrefix(
    pathname,
    unauthenticatedOnlyRoutePrefixes,
  );

  if (!hasAuthCookie && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(redirectUrl);
  }

  if (hasAuthCookie && isUnauthenticatedOnlyRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
