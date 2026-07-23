import "server-only";

import Stripe from "stripe";

/**
 * The Stripe client, as a lazily-created singleton.
 *
 * Lazy on purpose: STRIPE_SECRET_KEY is optional (a deploy without billing is
 * valid — see isBillingConfigured), so constructing the client at module load
 * would throw on those deploys the moment anything imported this file. Instead
 * getStripe() throws only if actually called without a key, which by
 * construction only happens behind an isBillingConfigured() gate.
 *
 * The apiVersion is pinned to the one this SDK build ships (stripe@22), so a
 * later `npm update` can't silently change response shapes under us — bump it
 * deliberately when upgrading.
 */
const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Billing calls must be gated on isBillingConfigured().",
    );
  }

  if (!globalForStripe.stripe) {
    globalForStripe.stripe = new Stripe(key, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }
  return globalForStripe.stripe;
}
