import { createHash } from "node:crypto";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import type { CachedSearchParams, SeatsSearchResponse, SeatsTripsResponse } from "./types";

/** Calendar day in Australia (product market). */
export function awardCacheDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function stablePart(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "boolean") return value ? "1" : "0";
  return String(value).trim();
}

function normalizeAirportList(value: string): string {
  return value
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(",");
}

function normalizeCsv(value: string | undefined): string {
  if (!value) return "";
  return value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(",");
}

export function buildSearchCacheKey(
  params: CachedSearchParams,
  dayKey = awardCacheDayKey(),
): {
  queryKey: string;
  dayKey: string;
  origin: string;
  destination: string;
  fingerprint: Record<string, string | number | boolean>;
} {
  const origin = normalizeAirportList(params.originAirport);
  const destination = normalizeAirportList(params.destinationAirport);
  const take = Math.min(1000, Math.max(10, params.take ?? 100));

  const fingerprint = {
    dayKey,
    origin,
    destination,
    startDate: stablePart(params.startDate),
    endDate: stablePart(params.endDate),
    sources: normalizeCsv(params.sources),
    cabins: normalizeCsv(params.cabins),
    carriers: normalizeCsv(params.carriers)?.toUpperCase() ?? "",
    onlyDirect: Boolean(params.onlyDirectFlights),
    includeTrips: Boolean(params.includeTrips),
    minifyTrips: Boolean(params.minifyTrips),
    includeFiltered: Boolean(params.includeFiltered),
    orderBy: stablePart(params.orderBy).toLowerCase(),
    take,
    skip: Number(params.skip ?? 0) || 0,
    cursor: Number(params.cursor ?? 0) || 0,
  };

  const material = JSON.stringify(fingerprint);
  const queryKey = createHash("sha256").update(material).digest("hex");

  return {
    queryKey,
    dayKey,
    origin,
    destination,
    fingerprint,
  };
}

export function buildTripCacheKey(
  availabilityId: string,
  includeFiltered: boolean,
  dayKey = awardCacheDayKey(),
): { queryKey: string; dayKey: string; availabilityId: string } {
  const id = availabilityId.trim();
  const material = JSON.stringify({
    dayKey,
    availabilityId: id,
    includeFiltered: Boolean(includeFiltered),
  });
  return {
    queryKey: createHash("sha256").update(material).digest("hex"),
    dayKey,
    availabilityId: id,
  };
}

export type SearchCacheResult = {
  response: SeatsSearchResponse;
  source: "cache" | "api";
  dayKey: string;
  hitCount: number;
};

export type TripCacheResult = {
  response: SeatsTripsResponse;
  source: "cache" | "api";
  dayKey: string;
  hitCount: number;
};

/**
 * Read today's search cache. Returns null on miss / no DB / errors.
 */
export async function getCachedSearch(
  params: CachedSearchParams,
): Promise<SearchCacheResult | null> {
  if (!isDatabaseConfigured()) return null;

  const meta = buildSearchCacheKey(params);

  try {
    const row = await prisma.awardSearchCache.findUnique({
      where: { queryKey: meta.queryKey },
    });
    if (!row || row.dayKey !== meta.dayKey) return null;

    const response = JSON.parse(row.responseJson) as SeatsSearchResponse;
    const updated = await prisma.awardSearchCache.update({
      where: { queryKey: meta.queryKey },
      data: { hitCount: { increment: 1 } },
    });

    return {
      response,
      source: "cache",
      dayKey: row.dayKey,
      hitCount: updated.hitCount,
    };
  } catch (error) {
    console.warn("[award-cache] search read failed", error);
    return null;
  }
}

export async function setCachedSearch(
  params: CachedSearchParams,
  response: SeatsSearchResponse,
): Promise<void> {
  if (!isDatabaseConfigured()) return;

  const meta = buildSearchCacheKey(params);

  try {
    await prisma.awardSearchCache.upsert({
      where: { queryKey: meta.queryKey },
      create: {
        queryKey: meta.queryKey,
        dayKey: meta.dayKey,
        origin: meta.origin,
        destination: meta.destination,
        startDate: params.startDate ?? null,
        endDate: params.endDate ?? null,
        paramsJson: JSON.stringify(meta.fingerprint),
        responseJson: JSON.stringify(response),
        hitCount: 0,
      },
      update: {
        dayKey: meta.dayKey,
        origin: meta.origin,
        destination: meta.destination,
        startDate: params.startDate ?? null,
        endDate: params.endDate ?? null,
        paramsJson: JSON.stringify(meta.fingerprint),
        responseJson: JSON.stringify(response),
      },
    });

    // Lazy prune so stale days don't linger if cron is late.
    await pruneAwardCacheOlderThan(meta.dayKey).catch(() => undefined);
  } catch (error) {
    console.warn("[award-cache] search write failed", error);
  }
}

export async function getCachedTrips(
  availabilityId: string,
  includeFiltered = false,
): Promise<TripCacheResult | null> {
  if (!isDatabaseConfigured()) return null;

  const meta = buildTripCacheKey(availabilityId, includeFiltered);

  try {
    const row = await prisma.awardTripCache.findUnique({
      where: { queryKey: meta.queryKey },
    });
    if (!row || row.dayKey !== meta.dayKey) return null;

    const response = JSON.parse(row.responseJson) as SeatsTripsResponse;
    const updated = await prisma.awardTripCache.update({
      where: { queryKey: meta.queryKey },
      data: { hitCount: { increment: 1 } },
    });

    return {
      response,
      source: "cache",
      dayKey: row.dayKey,
      hitCount: updated.hitCount,
    };
  } catch (error) {
    console.warn("[award-cache] trips read failed", error);
    return null;
  }
}

export async function setCachedTrips(
  availabilityId: string,
  includeFiltered: boolean,
  response: SeatsTripsResponse,
): Promise<void> {
  if (!isDatabaseConfigured()) return;

  const meta = buildTripCacheKey(availabilityId, includeFiltered);

  try {
    await prisma.awardTripCache.upsert({
      where: { queryKey: meta.queryKey },
      create: {
        queryKey: meta.queryKey,
        dayKey: meta.dayKey,
        availabilityId: meta.availabilityId,
        includeFiltered: Boolean(includeFiltered),
        responseJson: JSON.stringify(response),
        hitCount: 0,
      },
      update: {
        dayKey: meta.dayKey,
        availabilityId: meta.availabilityId,
        includeFiltered: Boolean(includeFiltered),
        responseJson: JSON.stringify(response),
      },
    });

    await pruneAwardCacheOlderThan(meta.dayKey).catch(() => undefined);
  } catch (error) {
    console.warn("[award-cache] trips write failed", error);
  }
}

/**
 * Delete cache rows from previous days (keeps only `keepDayKey`).
 * If `purgeAll` is true, truncates both cache tables.
 */
export async function pruneAwardCacheOlderThan(keepDayKey: string): Promise<{
  searchesDeleted: number;
  tripsDeleted: number;
}> {
  if (!isDatabaseConfigured()) {
    return { searchesDeleted: 0, tripsDeleted: 0 };
  }

  const [searches, trips] = await Promise.all([
    prisma.awardSearchCache.deleteMany({
      where: { dayKey: { not: keepDayKey } },
    }),
    prisma.awardTripCache.deleteMany({
      where: { dayKey: { not: keepDayKey } },
    }),
  ]);

  return {
    searchesDeleted: searches.count,
    tripsDeleted: trips.count,
  };
}

/** Wipe entire award cache tables (daily maintenance). */
export async function purgeAwardCache(): Promise<{
  searchesDeleted: number;
  tripsDeleted: number;
  dayKey: string;
}> {
  if (!isDatabaseConfigured()) {
    return {
      searchesDeleted: 0,
      tripsDeleted: 0,
      dayKey: awardCacheDayKey(),
    };
  }

  const dayKey = awardCacheDayKey();
  const [searches, trips] = await Promise.all([
    prisma.awardSearchCache.deleteMany({}),
    prisma.awardTripCache.deleteMany({}),
  ]);

  return {
    searchesDeleted: searches.count,
    tripsDeleted: trips.count,
    dayKey,
  };
}
