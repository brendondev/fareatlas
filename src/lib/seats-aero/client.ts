import type {
  CachedSearchParams,
  SeatsSearchResponse,
  SeatsTripsResponse,
} from "./types";

const BASE_URL = "https://seats.aero/partnerapi";

export class SeatsAeroError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "SeatsAeroError";
    this.status = status;
    this.body = body;
  }
}

export function getSeatsAeroApiKey(): string | undefined {
  const key =
    process.env.AWARD_AVAILABILITY_API_KEY?.trim() ||
    process.env.SEATS_AERO_API_KEY?.trim();
  return key || undefined;
}

export function isSeatsAeroConfigured(): boolean {
  return Boolean(getSeatsAeroApiKey());
}

/**
 * Build Partner-Authorization value.
 * - OAuth tokens (`seats:…`) use Bearer prefix
 * - Commercial / Pro keys are sent as provided
 */
function authorizationHeader(apiKey: string): string {
  if (apiKey.startsWith("Bearer ")) return apiKey;
  if (apiKey.startsWith("seats:")) return `Bearer ${apiKey}`;
  return apiKey;
}

async function seatsFetch<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const apiKey = getSeatsAeroApiKey();
  if (!apiKey) {
    throw new SeatsAeroError(
      "Seats.aero API key is not configured (AWARD_AVAILABILITY_API_KEY).",
      503,
      "",
    );
  }

  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Partner-Authorization": authorizationHeader(apiKey),
    },
    // Always fresh for availability-sensitive data.
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new SeatsAeroError(
      `Seats.aero request failed (${response.status})`,
      response.status,
      text.slice(0, 2000),
    );
  }

  if (!text) {
    return { data: [] } as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SeatsAeroError(
      "Seats.aero returned non-JSON response",
      502,
      text.slice(0, 500),
    );
  }
}

function normalizeAirports(value: string): string {
  return value
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)
    .join(",");
}

/**
 * Cached Search — availability between airports / date range across programs.
 * @see https://developers.seats.aero/reference/cached-search
 */
export async function cachedSearch(
  params: CachedSearchParams,
): Promise<SeatsSearchResponse> {
  const origin = normalizeAirports(params.originAirport);
  const destination = normalizeAirports(params.destinationAirport);

  if (!origin || !destination) {
    throw new SeatsAeroError(
      "originAirport and destinationAirport are required",
      400,
      "",
    );
  }

  const take = Math.min(1000, Math.max(10, params.take ?? 100));

  return seatsFetch<SeatsSearchResponse>("/search", {
    origin_airport: origin,
    destination_airport: destination,
    start_date: params.startDate,
    end_date: params.endDate,
    sources: params.sources,
    cabins: params.cabins,
    carriers: params.carriers,
    only_direct_flights: params.onlyDirectFlights,
    include_trips: params.includeTrips,
    minify_trips: params.minifyTrips,
    order_by: params.orderBy,
    take,
    skip: params.skip,
    cursor: params.cursor,
    include_filtered: params.includeFiltered,
  });
}

/**
 * Get Trips — flight-level detail for one Availability ID.
 * @see https://developers.seats.aero/reference/get-trips
 */
export async function getTrips(
  availabilityId: string,
  options?: { includeFiltered?: boolean },
): Promise<SeatsTripsResponse> {
  if (!availabilityId?.trim()) {
    throw new SeatsAeroError("availability id is required", 400, "");
  }

  return seatsFetch<SeatsTripsResponse>(
    `/trips/${encodeURIComponent(availabilityId.trim())}`,
    {
      include_filtered: options?.includeFiltered,
    },
  );
}
