import type { Tier } from "@/lib/dal";

/**
 * The billing catalogue: the bridge between Stripe price IDs and this app's
 * tiers. Everything about *what a plan costs and how it's sold* lives here;
 * what a plan is *allowed to do* lives in lib/entitlements.ts. Keeping the two
 * apart is deliberate — a price change must never be able to silently alter an
 * entitlement, and vice versa.
 *
 * Price IDs are read from the environment, never hard-coded, so the same build
 * runs against test-mode and live-mode Stripe by swapping env in Vercel. A
 * missing price is treated as "this plan isn't for sale on this deploy" rather
 * than a crash (see isBillingConfigured / priceIdFor).
 */

export type BillingInterval = "month" | "year";

/** The tiers that can actually be purchased. Free is the absence of a sub. */
export const PAID_TIERS = ["premium", "pro"] as const;
export type PaidTier = (typeof PAID_TIERS)[number];

export function isPaidTier(tier: Tier): tier is PaidTier {
  return (PAID_TIERS as readonly string[]).includes(tier);
}

/**
 * Env var name holding the Stripe price ID for a (tier, interval).
 * e.g. premium+month → STRIPE_PRICE_PREMIUM_MONTH.
 */
function priceEnvKey(tier: PaidTier, interval: BillingInterval): string {
  return `STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`;
}

/** The configured price ID for a plan, or undefined if unset on this deploy. */
export function priceIdFor(
  tier: PaidTier,
  interval: BillingInterval,
): string | undefined {
  return process.env[priceEnvKey(tier, interval)]?.trim() || undefined;
}

/**
 * Reverse lookup used by the webhook: given the price ID on a subscription,
 * which tier does it grant? Built fresh from env on each call so a price added
 * in Vercel takes effect without a redeploy of this module's constants.
 *
 * Unknown price → null. The webhook fails closed on null (leaves tier alone and
 * logs) rather than guessing, so a stray price from another product can never
 * silently upgrade someone.
 */
export function tierForPriceId(priceId: string): PaidTier | null {
  for (const tier of PAID_TIERS) {
    for (const interval of ["month", "year"] as const) {
      if (priceIdFor(tier, interval) === priceId) return tier;
    }
  }
  return null;
}

/**
 * Billing is "configured" when the app can actually open a Checkout: a secret
 * key plus at least one sellable price. When false, /pricing falls back to the
 * waitlist and the account page hides billing controls — the same honest
 * degradation the rest of the app uses (see isAuthConfigured/isEmailConfigured).
 *
 * The webhook signing secret is checked separately, at the webhook, because a
 * deploy can legitimately receive webhooks without exposing Checkout.
 */
export function isBillingConfigured(): boolean {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) return false;
  return PAID_TIERS.some(
    (tier) => priceIdFor(tier, "month") || priceIdFor(tier, "year"),
  );
}

/** Presentational metadata for /pricing. Prices are display-only strings — the
 * charged amount is whatever the Stripe price says, never derived from here. */
export const PLAN_META: Record<
  PaidTier,
  { name: string; blurb: string }
> = {
  premium: {
    name: "Premium",
    blurb: "Every cabin, the full year, and email alerts on your routes.",
  },
  pro: {
    name: "Pro",
    blurb: "Unlimited routes and priority alerts that check twice as often.",
  },
};
