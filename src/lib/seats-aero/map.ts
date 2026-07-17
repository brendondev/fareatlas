import { programLabel } from "./programs";
import type {
  AwardCabinOffer,
  AwardResult,
  CabinCode,
  SeatsAvailability,
} from "./types";

function parseMileage(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function cabinOffer(
  code: CabinCode,
  label: string,
  available: boolean | null | undefined,
  mileage: string | number | null | undefined,
  seats: number | null | undefined,
  airlines: string | null | undefined,
  direct: boolean | null | undefined,
): AwardCabinOffer {
  const mileageCost = parseMileage(mileage);
  const isAvailable = Boolean(available) && mileageCost !== null;
  return {
    cabin: code,
    label,
    available: isAvailable,
    mileageCost: isAvailable ? mileageCost : null,
    remainingSeats:
      seats === null || seats === undefined ? null : Number(seats) || 0,
    airlines: airlines || null,
    direct: direct ?? null,
  };
}

function pickBestCabin(cabins: AwardCabinOffer[]): AwardCabinOffer | null {
  const open = cabins.filter((c) => c.available && c.mileageCost !== null);
  if (!open.length) return null;

  // Prefer premium cabins when mileage is competitive; otherwise lowest mileage.
  const rank: Record<CabinCode, number> = {
    business: 4,
    first: 3,
    premium: 2,
    economy: 1,
  };

  return [...open].sort((a, b) => {
    const milesA = a.mileageCost ?? Number.POSITIVE_INFINITY;
    const milesB = b.mileageCost ?? Number.POSITIVE_INFINITY;
    if (milesA !== milesB) return milesA - milesB;
    return rank[b.cabin] - rank[a.cabin];
  })[0];
}

export function mapAvailability(item: SeatsAvailability): AwardResult {
  const cabins: AwardCabinOffer[] = [
    cabinOffer(
      "economy",
      "Economy",
      item.YAvailable,
      item.YMileageCost,
      item.YRemainingSeats,
      item.YAirlines,
      item.YDirect,
    ),
    cabinOffer(
      "premium",
      "Premium Economy",
      item.WAvailable,
      item.WMileageCost,
      item.WRemainingSeats,
      item.WAirlines,
      item.WDirect,
    ),
    cabinOffer(
      "business",
      "Business",
      item.JAvailable,
      item.JMileageCost,
      item.JRemainingSeats,
      item.JAirlines,
      item.JDirect,
    ),
    cabinOffer(
      "first",
      "First",
      item.FAvailable,
      item.FMileageCost,
      item.FRemainingSeats,
      item.FAirlines,
      item.FDirect,
    ),
  ];

  return {
    id: item.ID,
    date: item.Date,
    from: item.Route?.OriginAirport ?? "",
    to: item.Route?.DestinationAirport ?? "",
    program: programLabel(item.Source ?? item.Route?.Source),
    source: item.Source ?? item.Route?.Source ?? "unknown",
    regionFrom: item.Route?.OriginRegion,
    regionTo: item.Route?.DestinationRegion,
    distance: item.Route?.Distance,
    cabins,
    bestCabin: pickBestCabin(cabins),
    updatedAt: item.UpdatedAt,
  };
}

export function mapSearchResults(data: SeatsAvailability[]): AwardResult[] {
  return data
    .map(mapAvailability)
    .filter((row) => row.bestCabin !== null)
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      const milesA = a.bestCabin?.mileageCost ?? Number.POSITIVE_INFINITY;
      const milesB = b.bestCabin?.mileageCost ?? Number.POSITIVE_INFINITY;
      return milesA - milesB;
    });
}

export function formatPoints(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-AU").format(value);
}
