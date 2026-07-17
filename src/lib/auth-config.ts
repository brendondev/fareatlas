import { isDatabaseConfigured } from "./db";

/**
 * Auth is a capability, not a feature that degrades.
 *
 * Everything else in this app falls back to demo data when Neon is absent
 * (see `lib/offers.ts`). Auth must not: a faked session is a security lie,
 * not an honest degradation. So when this returns false the auth routes
 * genuinely do not exist — `/login`, `/register` and `/account` return 404,
 * the header shows no sign-in, and `getViewer()` reports an anonymous free
 * viewer. A deploy without a database is a demo, and demos get the demo tier.
 */
export function isAuthConfigured(): boolean {
  return isDatabaseConfigured() && Boolean(process.env.SESSION_SECRET?.trim());
}
