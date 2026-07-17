import type { Tier } from "./dal";
import type { CabinCode, CachedSearchParams } from "./seats-aero";

/**
 * What each plan may ask Seats.aero for.
 *
 * Pure and I/O-free on purpose: this is the rule everything else is measured
 * against, so it must be readable and testable on its own. `today` is passed
 * in rather than read here, both to keep that true and so the caller can use
 * the same Sydney calendar day the award cache keys on.
 */
export const ENTITLEMENTS = {
  free: {
    cabins: ["economy"] as CabinCode[],
    windowDays: 90,
    maxWatches: 3,
  },
  premium: {
    cabins: ["economy", "premium", "business", "first"] as CabinCode[],
    windowDays: 365,
    maxWatches: Number.POSITIVE_INFINITY,
  },
} as const satisfies Record<
  Tier,
  { cabins: CabinCode[]; windowDays: number; maxWatches: number }
>;

export const ALL_CABINS: CabinCode[] = [
  "economy",
  "premium",
  "business",
  "first",
];

export type Clamp = {
  cabins: boolean;
  startDate: boolean;
  endDate: boolean;
};

export const NO_CLAMP: Clamp = {
  cabins: false,
  startDate: false,
  endDate: false,
};

export function entitlementsFor(tier: Tier) {
  return ENTITLEMENTS[tier];
}

export function cabinAllowed(cabin: string, tier: Tier): boolean {
  return ENTITLEMENTS[tier].cabins.includes(normalizeCabin(cabin) as CabinCode);
}

/** Seats.aero labels cabins inconsistently across endpoints. */
export function normalizeCabin(value: string): string {
  const v = value.trim().toLowerCase();
  if (v === "y" || v === "coach") return "economy";
  if (v === "w" || v === "premiumeconomy" || v === "premium economy")
    return "premium";
  if (v === "j" || v === "biz") return "business";
  if (v === "f") return "first";
  return v;
}

function parseCabins(value: string | undefined): CabinCode[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => normalizeCabin(part))
    .filter((part): part is CabinCode =>
      (ALL_CABINS as string[]).includes(part),
    );
}

/** Adds days to a YYYY-MM-DD in UTC, sidestepping DST. */
function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/**
 * Cuts a search down to what `tier` is allowed to see.
 *
 * Clamp-and-upsell, never reject: a free user asking for Business gets Economy
 * back plus `clamped.cabins`, and the UI offers the upgrade. Returning zero
 * rows or a 403 teaches "this product is broken"; returning something teaches
 * "this product has more".
 *
 * MUST run before the cache key is built (see lib/awards.ts) — that ordering
 * is what makes every free user on a route share one cache entry.
 */
export function clampSearch(
  params: CachedSearchParams,
  tier: Tier,
  today: string,
): { params: CachedSearchParams; clamped: Clamp } {
  const allowed = ENTITLEMENTS[tier].cabins;
  const requested = parseCabins(params.cabins);

  // No cabin filter means "everything", which for free is only Economy.
  const effective = requested.length
    ? requested.filter((cabin) => allowed.includes(cabin))
    : [...allowed];

  // Asked for nothing they can have: substitute rather than return an empty set.
  const cabins = effective.length ? effective : [...allowed];
  const cabinsClamped = requested.length
    ? requested.some((cabin) => !allowed.includes(cabin))
    : allowed.length < ALL_CABINS.length;

  const windowEnd = addDays(today, ENTITLEMENTS[tier].windowDays);

  const startDate = params.startDate && params.startDate < today
    ? today
    : params.startDate;
  const startClamped = Boolean(params.startDate && params.startDate < today);

  const endDate = params.endDate && params.endDate > windowEnd
    ? windowEnd
    : params.endDate;
  const endClamped = Boolean(params.endDate && params.endDate > windowEnd);

  return {
    params: {
      ...params,
      cabins: cabins.join(","),
      startDate,
      endDate,
    },
    clamped: {
      cabins: cabinsClamped,
      startDate: startClamped,
      endDate: endClamped,
    },
  };
}

export function isClamped(clamp: Clamp): boolean {
  return clamp.cabins || clamp.startDate || clamp.endDate;
}
