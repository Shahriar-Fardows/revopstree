import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Next.js 16 renamed `middleware.ts` to `proxy.ts` — same behaviour, new
   file and export name.

   This is an OPTIMISTIC check only: it asks whether a session cookie is
   present, never whether it is valid. The real authorisation boundary is the
   Data Access Layer (lib/dal.ts), which verifies the JWT and re-reads the
   staff record on every request. Doing that work here would slow every
   request and still would not cover statically rendered routes.

   Duplicated cookie name rather than imported: lib/session.ts is marked
   `server-only` and throws when SESSION_SECRET is absent, neither of which
   suits the proxy runtime. */
const SESSION_COOKIE = "session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);
  const isLoginRoute = pathname.startsWith("/admin/login");

  if (!hasSessionCookie && !isLoginRoute) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (hasSessionCookie && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
