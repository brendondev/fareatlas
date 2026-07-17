import { NextRequest, NextResponse } from "next/server";
import {
  AU_FOCUS_SOURCES,
  isSeatsAeroConfigured,
  SeatsAeroError,
} from "@/lib/seats-aero";
import { searchAwardsForViewer } from "@/lib/awards";
import { isAuthConfigured } from "@/lib/auth-config";
import { isDatabaseConfigured } from "@/lib/db";

const IATA = /^[A-Za-z]{3}(,[A-Za-z]{3})*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function defaultStartDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 14);
  return d.toISOString().slice(0, 10);
}

function defaultEndDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 74);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  if (!isSeatsAeroConfigured()) {
    return NextResponse.json(
      {
        error:
          "Award availability API is not configured. Set AWARD_AVAILABILITY_API_KEY.",
        configured: false,
      },
      { status: 503 },
    );
  }

  const sp = request.nextUrl.searchParams;
  const origin = (sp.get("origin") ?? sp.get("origin_airport") ?? "").trim();
  const destination = (
    sp.get("destination") ??
    sp.get("destination_airport") ??
    ""
  ).trim();

  if (!origin || !destination) {
    return NextResponse.json(
      {
        error:
          "Query params `origin` and `destination` are required (IATA codes, comma-separated allowed).",
      },
      { status: 400 },
    );
  }

  if (!IATA.test(origin) || !IATA.test(destination)) {
    return NextResponse.json(
      {
        error:
          "Invalid airport codes. Use 3-letter IATA codes, e.g. SYD or SYD,MEL.",
      },
      { status: 400 },
    );
  }

  const startDate = sp.get("start_date") ?? sp.get("startDate") ?? defaultStartDate();
  const endDate = sp.get("end_date") ?? sp.get("endDate") ?? defaultEndDate();

  if (!DATE.test(startDate) || !DATE.test(endDate)) {
    return NextResponse.json(
      { error: "Dates must be YYYY-MM-DD." },
      { status: 400 },
    );
  }

  if (startDate > endDate) {
    return NextResponse.json(
      { error: "`start_date` must be on or before `end_date`." },
      { status: 400 },
    );
  }

  const takeRaw = Number(sp.get("take") ?? "100");
  const take = Number.isFinite(takeRaw) ? takeRaw : 100;
  const skipRaw = Number(sp.get("skip") ?? "0");
  const skip = Number.isFinite(skipRaw) && skipRaw > 0 ? skipRaw : undefined;
  const cursorRaw = sp.get("cursor");
  const cursor =
    cursorRaw && Number.isFinite(Number(cursorRaw))
      ? Number(cursorRaw)
      : undefined;

  const sources = sp.get("sources") ?? AU_FOCUS_SOURCES;
  const cabins = sp.get("cabins") ?? undefined;
  const carriers = sp.get("carriers") ?? undefined;
  const orderBy = sp.get("order_by") ?? sp.get("orderBy") ?? undefined;
  const onlyDirect =
    sp.get("only_direct") === "true" || sp.get("onlyDirectFlights") === "true";
  const includeTrips =
    sp.get("include_trips") === "true" || sp.get("includeTrips") === "true";

  // Allow forced refresh for ops/debug: ?refresh=1 bypasses cache.
  const bypassCache = sp.get("refresh") === "1" || sp.get("refresh") === "true";

  const searchParams = {
    originAirport: origin,
    destinationAirport: destination,
    startDate,
    endDate,
    sources: sources || undefined,
    cabins,
    carriers,
    onlyDirectFlights: onlyDirect || undefined,
    includeTrips: includeTrips || undefined,
    orderBy,
    take,
    skip,
    cursor,
  };

  try {
    // The viewer's tier clamps these params before they reach the Partner API
    // or the cache key. `searchAwardsCached` is deliberately unreachable from
    // here — see lib/awards.ts.
    const gated = await searchAwardsForViewer(searchParams);
    const {
      response,
      source,
      dayKey,
      hitCount: cacheHits,
      tier,
      clamped,
      clampedAtAll,
      // Already mapped AND stripped of cabins this tier can't see. Do not map
      // `response.data` here — those rows carry every cabin inline.
      results,
    } = gated;

    return NextResponse.json({
      configured: true,
      cache: {
        enabled: isDatabaseConfigured(),
        source,
        dayKey,
        hitCount: cacheHits,
        bypassed: bypassCache,
      },
      auth: { configured: isAuthConfigured() },
      entitlements: { tier, clamped, clampedAtAll },
      query: {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        // Echo what was actually asked of the API, not what the caller typed —
        // otherwise a clamped search reports a window it never searched.
        startDate: gated.params.startDate ?? startDate,
        endDate: gated.params.endDate ?? endDate,
        requestedStartDate: startDate,
        requestedEndDate: endDate,
        sources,
        cabins: gated.params.cabins ?? null,
        requestedCabins: cabins ?? null,
        take,
        skip: skip ?? 0,
      },
      count: results.length,
      cursor: response.cursor ?? null,
      hasMore: Boolean(response.hasMore ?? response.moreResultsAvailable),
      results,
      rawCount: response.data?.length ?? 0,
    });
  } catch (error) {
    if (error instanceof SeatsAeroError) {
      return NextResponse.json(
        {
          error: error.message,
          status: error.status,
          detail: error.body || undefined,
        },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }

    console.error("[awards/search]", error);
    return NextResponse.json(
      { error: "Unexpected error while searching award availability." },
      { status: 500 },
    );
  }
}
