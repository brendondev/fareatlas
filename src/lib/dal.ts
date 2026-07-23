import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isAuthConfigured } from "./auth-config";
import { prisma } from "./db";
import { decrypt, SESSION_COOKIE } from "./session";

/**
 * This module is the security boundary — not `proxy.ts`, not layouts.
 *
 * Per the Next auth guide: layouts don't re-render on navigation (Partial
 * Rendering), so a check there isn't run on every route change; and Server
 * Actions are POSTs to whichever page invokes them, which proxy matchers do
 * not reliably cover. Every page and action calls in here on its own.
 */

export type Tier = "free" | "premium" | "pro";

export type Viewer = {
  authConfigured: boolean;
  user: { id: string; email: string; name: string | null } | null;
  tier: Tier;
};

const ANONYMOUS: Viewer = {
  authConfigured: false,
  user: null,
  tier: "free",
};

/** Anything unrecognised fails closed to free. */
function toTier(value: string): Tier {
  if (value === "pro") return "pro";
  if (value === "premium") return "premium";
  return "free";
}

/** Reads and verifies the cookie. No database access. */
export const verifySession = cache(async (): Promise<{ userId: string } | null> => {
  if (!isAuthConfigured()) return null;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);

  return session ? { userId: session.userId } : null;
});

/**
 * The single function everything calls to find out who is asking.
 *
 * Never throws. The guide lets this redirect or blow up, but the rest of this
 * codebase degrades honestly rather than erroring (see `getOffers`), and a
 * transient Neon failure should render the page as anonymous rather than 500
 * the whole site. `requireUser()` is the one that redirects.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  if (!isAuthConfigured()) return ANONYMOUS;

  const session = await verifySession();
  if (!session) return { authConfigured: true, user: null, tier: "free" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, tier: true },
    });

    // Valid token for a user that no longer exists — deleted mid-session.
    if (!user) return { authConfigured: true, user: null, tier: "free" };

    return {
      authConfigured: true,
      user: { id: user.id, email: user.email, name: user.name },
      tier: toTier(user.tier),
    };
  } catch (error) {
    console.error("[dal] viewer lookup failed", error);
    return { authConfigured: true, user: null, tier: "free" };
  }
});

/** For pages that require an account. Redirects instead of returning null. */
export async function requireUser(nextPath?: string) {
  const viewer = await getViewer();

  if (!viewer.user) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${next}`);
  }

  return viewer;
}
