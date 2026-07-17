import { NextResponse, type NextRequest } from "next/server";
import { isAuthConfigured } from "@/lib/auth-config";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * `proxy.ts`, not `middleware.ts` — the middleware convention is deprecated as
 * of Next 16. No `runtime` export: Proxy is Node-only and setting it throws.
 *
 * This does two things:
 *
 * 1. Emits a per-request nonce Content-Security-Policy. Next parses the CSP on
 *    the *request* header and stamps the nonce onto its own scripts, so no tag
 *    needs it by hand. A nonce forces dynamic rendering — but every page here
 *    is already dynamic (the layout reads the session cookie), so there is no
 *    extra caching cost to pay.
 *
 * 2. Optimistic auth redirects. This is NOT the security boundary — it only
 *    checks that a session cookie is *present*, never its signature, and never
 *    touches the database. A forged cookie sails past here and is rejected by
 *    getViewer()/requireUser() in lib/dal.ts, which every protected page and
 *    Server Action calls for itself.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    `default-src 'self'`,
    // strict-dynamic + nonce: Next's own scripts carry the nonce and can load
    // their chunks; nothing else runs. unsafe-eval only in dev (React uses it).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // <style> tags get the nonce; inline style="" ATTRIBUTES aren't covered by
    // nonces, so style-src-attr allows them (program colours, gradients). Dev
    // needs unsafe-inline for React's injected styles.
    `style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ""}`,
    `style-src-attr 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    // Same-origin only — the award search fetches /api/awards on this host.
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  // --- optimistic auth redirects, layered on the same response ---
  if (isAuthConfigured()) {
    const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    const { pathname, search } = request.nextUrl;

    if (!hasCookie && pathname.startsWith("/account")) {
      const url = new URL("/login", request.nextUrl);
      url.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    if (hasCookie && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/account", request.nextUrl));
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // All routes except API, static assets and image optimisation. The
    // `missing` clause skips prefetches, which don't need the header.
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
