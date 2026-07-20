/**
 * Curated airport catalogue.
 *
 * The alert modal dropdowns are limited to this list, mirroring "options are
 * limited to routes monitored by the app" in the reference design. Keeping it
 * in a plain array (rather than a table) means Origin and Destination dropdowns
 * render synchronously without an extra DB round-trip on modal open.
 *
 * Order below is the render order — do not sort. AU capitals first (the pitch
 * is AU-first), then Asia/Pacific, then North America and Europe, then
 * Australian regional. Adding a new airport is cheap; removing one is a UX
 * regression for anyone who already has an active alert on it, so err on the
 * side of leaving retired rows in.
 */

export type Airport = {
  iata: string;
  city: string;
  country: string;
  region: "Oceania" | "Asia" | "Middle East" | "Americas" | "Europe";
};

export const AIRPORTS: Airport[] = [
  { iata: "SYD", city: "Sydney", country: "Australia", region: "Oceania" },
  { iata: "MEL", city: "Melbourne", country: "Australia", region: "Oceania" },
  { iata: "BNE", city: "Brisbane", country: "Australia", region: "Oceania" },
  { iata: "PER", city: "Perth", country: "Australia", region: "Oceania" },
  { iata: "ADL", city: "Adelaide", country: "Australia", region: "Oceania" },
  { iata: "CBR", city: "Canberra", country: "Australia", region: "Oceania" },
  { iata: "OOL", city: "Gold Coast", country: "Australia", region: "Oceania" },
  { iata: "CNS", city: "Cairns", country: "Australia", region: "Oceania" },
  { iata: "HBA", city: "Hobart", country: "Australia", region: "Oceania" },
  { iata: "DRW", city: "Darwin", country: "Australia", region: "Oceania" },
  { iata: "AKL", city: "Auckland", country: "New Zealand", region: "Oceania" },
  { iata: "WLG", city: "Wellington", country: "New Zealand", region: "Oceania" },
  { iata: "CHC", city: "Christchurch", country: "New Zealand", region: "Oceania" },
  { iata: "NAN", city: "Nadi", country: "Fiji", region: "Oceania" },

  { iata: "SIN", city: "Singapore", country: "Singapore", region: "Asia" },
  { iata: "HKG", city: "Hong Kong", country: "Hong Kong", region: "Asia" },
  { iata: "NRT", city: "Tokyo Narita", country: "Japan", region: "Asia" },
  { iata: "HND", city: "Tokyo Haneda", country: "Japan", region: "Asia" },
  { iata: "KIX", city: "Osaka", country: "Japan", region: "Asia" },
  { iata: "ICN", city: "Seoul", country: "South Korea", region: "Asia" },
  { iata: "BKK", city: "Bangkok", country: "Thailand", region: "Asia" },
  { iata: "KUL", city: "Kuala Lumpur", country: "Malaysia", region: "Asia" },
  { iata: "DPS", city: "Denpasar (Bali)", country: "Indonesia", region: "Asia" },
  { iata: "CGK", city: "Jakarta", country: "Indonesia", region: "Asia" },
  { iata: "MNL", city: "Manila", country: "Philippines", region: "Asia" },
  { iata: "SGN", city: "Ho Chi Minh City", country: "Vietnam", region: "Asia" },
  { iata: "TPE", city: "Taipei", country: "Taiwan", region: "Asia" },
  { iata: "PEK", city: "Beijing", country: "China", region: "Asia" },
  { iata: "PVG", city: "Shanghai", country: "China", region: "Asia" },
  { iata: "DEL", city: "Delhi", country: "India", region: "Asia" },
  { iata: "BOM", city: "Mumbai", country: "India", region: "Asia" },

  { iata: "DXB", city: "Dubai", country: "UAE", region: "Middle East" },
  { iata: "DOH", city: "Doha", country: "Qatar", region: "Middle East" },
  { iata: "AUH", city: "Abu Dhabi", country: "UAE", region: "Middle East" },

  { iata: "LAX", city: "Los Angeles", country: "United States", region: "Americas" },
  { iata: "SFO", city: "San Francisco", country: "United States", region: "Americas" },
  { iata: "JFK", city: "New York JFK", country: "United States", region: "Americas" },
  { iata: "DFW", city: "Dallas", country: "United States", region: "Americas" },
  { iata: "SEA", city: "Seattle", country: "United States", region: "Americas" },
  { iata: "HNL", city: "Honolulu", country: "United States", region: "Americas" },
  { iata: "YVR", city: "Vancouver", country: "Canada", region: "Americas" },
  { iata: "SCL", city: "Santiago", country: "Chile", region: "Americas" },

  { iata: "LHR", city: "London Heathrow", country: "United Kingdom", region: "Europe" },
  { iata: "CDG", city: "Paris", country: "France", region: "Europe" },
  { iata: "FRA", city: "Frankfurt", country: "Germany", region: "Europe" },
  { iata: "AMS", city: "Amsterdam", country: "Netherlands", region: "Europe" },
  { iata: "FCO", city: "Rome", country: "Italy", region: "Europe" },
  { iata: "MAD", city: "Madrid", country: "Spain", region: "Europe" },
  { iata: "IST", city: "Istanbul", country: "Türkiye", region: "Europe" },
  { iata: "ZRH", city: "Zurich", country: "Switzerland", region: "Europe" },
];

const BY_IATA = new Map(AIRPORTS.map((a) => [a.iata, a] as const));

export function airportByIata(iata: string): Airport | undefined {
  return BY_IATA.get(iata.toUpperCase());
}

export function isKnownIata(iata: string): boolean {
  return BY_IATA.has(iata.toUpperCase());
}

/** `SYD — Sydney` shape used in dropdowns and pill labels. */
export function formatAirport(airport: Airport): string {
  return `${airport.iata} — ${airport.city}`;
}
