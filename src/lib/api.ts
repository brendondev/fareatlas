import {
  awardSignals as mockAwardSignals,
  cashFares,
  integrationGaps,
  pointsOffers,
  type AwardSignal,
} from "./data";
import {
  AU_FOCUS_SOURCES,
  cachedSearch,
  formatPoints,
  isSeatsAeroConfigured,
  mapSearchResults,
} from "./seats-aero";

export type DashboardData = {
  awardSignals: AwardSignal[];
  cashFares: typeof cashFares;
  pointsOffers: typeof pointsOffers;
  integrationGaps: typeof integrationGaps;
  awardsLive: boolean;
  awardsError: string | null;
};

/** Popular AU-outbound routes for the dashboard award strip. */
const DASHBOARD_ROUTES: Array<{ origin: string; destination: string }> = [
  { origin: "SYD", destination: "HND" },
  { origin: "MEL", destination: "LAX" },
  { origin: "BNE", destination: "SIN" },
  { origin: "SYD", destination: "LHR" },
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function toAwardSignal(
  result: ReturnType<typeof mapSearchResults>[number],
): AwardSignal | null {
  const cabin = result.bestCabin;
  if (!cabin || cabin.mileageCost === null) return null;

  return {
    from: result.from,
    to: result.to,
    cabin: cabin.label,
    program: result.program,
    seats: cabin.remainingSeats ?? 0,
    points: formatPoints(cabin.mileageCost),
    // Cash baseline (Amadeus) not wired yet — cpp filled when cash fares land.
    valueCentsPerPoint: "—",
  };
}

async function fetchLiveAwardSignals(): Promise<{
  signals: AwardSignal[];
  error: string | null;
}> {
  if (!isSeatsAeroConfigured()) {
    return { signals: mockAwardSignals, error: null };
  }

  const startDate = daysFromNow(21);
  const endDate = daysFromNow(90);
  const signals: AwardSignal[] = [];
  const seen = new Set<string>();

  try {
    await Promise.all(
      DASHBOARD_ROUTES.map(async ({ origin, destination }) => {
        try {
          const response = await cachedSearch({
            originAirport: origin,
            destinationAirport: destination,
            startDate,
            endDate,
            sources: AU_FOCUS_SOURCES,
            orderBy: "lowest_mileage",
            take: 20,
          });

          for (const row of mapSearchResults(response.data ?? [])) {
            const signal = toAwardSignal(row);
            if (!signal) continue;
            const key = `${signal.from}-${signal.to}-${signal.cabin}-${signal.program}`;
            if (seen.has(key)) continue;
            seen.add(key);
            signals.push(signal);
            if (signals.length >= 12) break;
          }
        } catch (routeError) {
          console.warn(
            `[awards] dashboard route ${origin}-${destination} failed`,
            routeError,
          );
        }
      }),
    );

    if (!signals.length) {
      return {
        signals: mockAwardSignals,
        error: "No live award seats found for sample routes; showing placeholders.",
      };
    }

    return { signals: signals.slice(0, 8), error: null };
  } catch (error) {
    console.error("[awards] dashboard live fetch failed", error);
    return {
      signals: mockAwardSignals,
      error: "Live award feed unavailable; showing mock data.",
    };
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const live = isSeatsAeroConfigured();
  const { signals, error } = await fetchLiveAwardSignals();

  return {
    awardSignals: signals,
    cashFares,
    pointsOffers,
    integrationGaps: integrationGaps.map((gap) =>
      gap.name === "Award availability" && live
        ? {
            name: gap.name,
            nextStep:
              "Seats.aero connected. Refine search UX, caching, and alerts next.",
          }
        : gap,
    ),
    awardsLive: live && !error,
    awardsError: error,
  };
}
