import "server-only";

import {
  type BillingInterval,
  type PaidTier,
  PAID_TIERS,
  priceIdFor,
} from "./plans";
import { getStripe } from "./stripe";

/**
 * The live price of each sellable plan, read from Stripe at render time.
 *
 * /pricing shows these rather than any hard-coded number so the page can never
 * quote an amount the checkout won't charge — change a price in the Stripe
 * dashboard and the site follows on the next request. A price that isn't
 * configured, or that Stripe can't return, comes back null and the card degrades
 * to "contact"/hidden rather than lying about a figure.
 */

export type PriceInfo = { amount: number; currency: string } | null;
export type PlanPrices = Record<
  PaidTier,
  Record<BillingInterval, PriceInfo>
>;

async function fetchOne(priceId: string | undefined): Promise<PriceInfo> {
  if (!priceId) return null;
  try {
    const price = await getStripe().prices.retrieve(priceId);
    if (price.unit_amount == null) return null;
    return { amount: price.unit_amount, currency: price.currency };
  } catch (error) {
    console.error("[stripe] price lookup failed", priceId, error);
    return null;
  }
}

export async function getPlanPrices(): Promise<PlanPrices> {
  const intervals: BillingInterval[] = ["month", "year"];

  const entries = await Promise.all(
    PAID_TIERS.map(async (tier) => {
      const byInterval = {} as Record<BillingInterval, PriceInfo>;
      await Promise.all(
        intervals.map(async (interval) => {
          byInterval[interval] = await fetchOne(priceIdFor(tier, interval));
        }),
      );
      return [tier, byInterval] as const;
    }),
  );

  return Object.fromEntries(entries) as PlanPrices;
}

/** Formats a Stripe unit_amount (minor units) as a display string, e.g. $9.00. */
export function formatPrice(info: PriceInfo): string | null {
  if (!info) return null;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: info.currency.toUpperCase(),
  }).format(info.amount / 100);
}
