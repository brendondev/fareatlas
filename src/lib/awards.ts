import "server-only";

import { getViewer, type Tier } from "./dal";
import {
  type Clamp,
  clampSearch,
  isClamped,
  normalizeCabin,
  cabinAllowed,
} from "./entitlements";
import {
  awardCacheDayKey,
  getTripsCached,
  mapSearchResults,
  searchAwardsCached,
} from "./seats-aero";
import type { AwardResult, CachedSearchParams } from "./seats-aero";

/**
 * The only sanctioned door to award data.
 *
 * `cachedSearch`/`getTrips` are not exported from `lib/seats-aero` or
 * `lib/api`, and an ESLint rule bans reaching into `seats-aero/client` from
 * `src/app` and `src/components`. So there is no code path that can honour a
 * hand-crafted `?cabins=business&end_date=+11mo` — the clamp is not a check
 * that callers remember to run, it is the only way through.
 */

/**
 * Strips cabins the viewer's plan doesn't cover out of each row.
 *
 * Clamping the query is not enough on its own. Seats.aero's `cabins` filter
 * decides which availabilities come back, but every row it returns carries all
 * four cabins inline (JMileageCost, FAvailable, and so on). Ask for Economy
 * and you still receive Business mileage costs. Serialising the row as-is
 * leaks exactly the data Premium sells, even though `bestCabin` — and so the
 * UI — looks correct. That is the hide-it-in-CSS paywall, one layer down.
 *
 * The cached payload deliberately keeps every cabin: it is shared across
 * tiers. Filtering belongs here, on the way out, per viewer.
 */
function filterResultsForTier(results: AwardResult[], tier: Tier): AwardResult[] {
  return results
    .map((row) => {
      const cabins = row.cabins.filter((offer) => cabinAllowed(offer.cabin, tier));
      const best = cabins
        .filter((offer) => offer.available && offer.mileageCost !== null)
        .sort((a, b) => (a.mileageCost ?? Infinity) - (b.mileageCost ?? Infinity))[0];

      return { ...row, cabins, bestCabin: best ?? null };
    })
    // A row whose only availability was in a cabin this plan can't see has
    // nothing left to show.
    .filter((row) => row.bestCabin !== null);
}

export type GatedSearch = Awaited<ReturnType<typeof searchAwardsCached>> & {
  tier: Tier;
  clamped: Clamp;
  clampedAtAll: boolean;
  /** What was actually asked of Seats.aero, after clamping. */
  params: CachedSearchParams;
  /** Mapped and tier-filtered. Callers must serialise these, not response.data. */
  results: AwardResult[];
};

export async function searchAwardsForViewer(
  raw: CachedSearchParams,
): Promise<GatedSearch> {
  const { tier } = await getViewer();

  // Sydney's calendar day, matching the cache's own rollover, so that every
  // free user searching the same route on the same day clamps to identical
  // params — and therefore to one cache entry.
  const today = awardCacheDayKey();
  const { params, clamped } = clampSearch(raw, tier, today);

  // Clamping BEFORE this call is load-bearing twice over: the cache key is
  // built from these params, so free traffic collapses onto a shared entry and
  // costs almost no Partner API quota. Clamp after the lookup instead and you
  // would both burn quota per user and write premium payloads into the entry
  // free users read.
  const result = await searchAwardsCached(params);

  // Mapping happens in here rather than in the route so that filtering cannot
  // be forgotten at the call site.
  const results = filterResultsForTier(
    mapSearchResults(result.response.data ?? []),
    tier,
  );

  return {
    ...result,
    tier,
    clamped,
    clampedAtAll: isClamped(clamped),
    params,
    results,
  };
}

export type GatedTrips = Awaited<ReturnType<typeof getTripsCached>> & {
  tier: Tier;
  filteredCount: number;
};

/**
 * Trip detail for a Business availability is premium data in its own right, so
 * the cabins a viewer may not see are dropped from the response rather than
 * merely hidden in the UI.
 *
 * The upstream call is deliberately NOT clamped: an availability id is already
 * a specific row, and its cached payload is shared across tiers. Filtering
 * happens on the way out.
 */
export async function getTripsForViewer(
  availabilityId: string,
  options?: { includeFiltered?: boolean; refresh?: boolean },
): Promise<GatedTrips> {
  const { tier } = await getViewer();
  const result = await getTripsCached(availabilityId, options);

  const all = result.response.data ?? [];
  const visible = all.filter((trip) =>
    trip.Cabin ? cabinAllowed(normalizeCabin(trip.Cabin), tier) : true,
  );

  return {
    ...result,
    response: { ...result.response, data: visible },
    tier,
    filteredCount: all.length - visible.length,
  };
}
