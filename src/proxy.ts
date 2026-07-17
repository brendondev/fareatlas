import { NextResponse, type NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth-config";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * `proxy.ts`, not `middleware.ts` — the middleware convention is deprecated as
 * of Next 16. Note there is no `runtime` export: Proxy is Node-only and
 * setting it throws.
 *
 * This is decoration, not defence. It only checks that a session cookie is
 * *present* — it does not verify the signature and never touches the database,
 * because Proxy runs on every request including prefetches.
 *
 * The real check is `getViewer()` / `requireUser()` in `lib/dal.ts`, which
 * every protected page and every Server Action calls for itself. A forged
 * cookie sails past this file and is rejected there.
 */
export function proxy(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.next();

  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = request.nextUrl;

  if (!hasCookie && pathname.startsWith("/account")) {
    const url = new URL("/login", request.nextUrl);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // Already signed in? Skip the sign-in forms.
  if (hasCookie && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/account", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/login", "/register"],
};
