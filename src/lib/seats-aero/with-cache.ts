import {
  awardCacheDayKey,
  getCachedSearch,
  getCachedTrips,
  setCachedSearch,
  setCachedTrips,
  type SearchCacheResult,
  type TripCacheResult,
} from "./cache";
import { cachedSearch, getTrips } from "./client";
import type { CachedSearchParams } from "./types";

/**
 * Search awards with Neon day-cache. Identical queries within the Sydney
 * calendar day reuse the stored Seats.aero payload (no Partner API call).
 *
 * `refresh` skips the cache read and re-writes the entry from a live call.
 * Callers must never reach `./client` directly — this module is the only
 * path to the Partner API, so quota accounting and gating stay in one place.
 */
export async function searchAwardsCached(
  params: CachedSearchParams,
  options?: { refresh?: boolean },
): Promise<SearchCacheResult> {
  if (!options?.refresh) {
    const hit = await getCachedSearch(params);
    if (hit) return hit;
  }

  const response = await cachedSearch(params);
  await setCachedSearch(params, response);

  return {
    response,
    source: "api",
    dayKey: awardCacheDayKey(),
    hitCount: 0,
  };
}

export async function getTripsCached(
  availabilityId: string,
  options?: { includeFiltered?: boolean; refresh?: boolean },
): Promise<TripCacheResult> {
  const includeFiltered = Boolean(options?.includeFiltered);

  if (!options?.refresh) {
    const hit = await getCachedTrips(availabilityId, includeFiltered);
    if (hit) return hit;
  }

  const response = await getTrips(availabilityId, { includeFiltered });
  await setCachedTrips(availabilityId, includeFiltered, response);

  return {
    response,
    source: "api",
    dayKey: awardCacheDayKey(),
    hitCount: 0,
  };
}
