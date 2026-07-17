import type { AwardResult } from "./seats-aero";

/**
 * Pure alert logic — no I/O, no database, no framework imports. Kept apart from
 * the orchestrator (alerts.ts) so it can be unit-tested on its own and so the
 * detection rules read in one place.
 */

/**
 * One key per bookable seat: `cabin|date|source`. Only cabins in `allowed`
 * (the watch's requested set already intersected with its owner's tier) count.
 * A cabin offer's `available` is already `flag && mileageCost > 0`.
 */
export function availabilityKeys(
  results: AwardResult[],
  allowed: Set<string>,
): string[] {
  const keys = new Set<string>();
  for (const row of results) {
    for (const offer of row.cabins) {
      if (offer.available && allowed.has(offer.cabin)) {
        keys.add(`${offer.cabin}|${row.date}|${row.source}`);
      }
    }
  }
  return [...keys].sort();
}

/** Keys present now that weren't in the last-seen set. */
export function newlyAvailable(
  currentKeys: string[],
  lastSeenJson: string | null,
): string[] {
  let seen: string[] = [];
  if (lastSeenJson) {
    try {
      const parsed = JSON.parse(lastSeenJson);
      if (Array.isArray(parsed)) seen = parsed.map(String);
    } catch {
      // Corrupt state → treat everything as new rather than crashing.
    }
  }
  const seenSet = new Set(seen);
  return currentKeys.filter((key) => !seenSet.has(key));
}

/** A short human line from the cheapest new hit, for in-app + email subject. */
export function summarise(
  results: AwardResult[],
  newKeys: string[],
): string | null {
  if (!newKeys.length) return null;
  const wanted = new Set(newKeys);
  let best: {
    cabin: string;
    from: string;
    to: string;
    miles: number;
    seats: number | null;
  } | null = null;

  for (const row of results) {
    for (const offer of row.cabins) {
      const key = `${offer.cabin}|${row.date}|${row.source}`;
      if (!wanted.has(key) || offer.mileageCost === null) continue;
      if (!best || offer.mileageCost < best.miles) {
        best = {
          cabin: offer.label,
          from: row.from,
          to: row.to,
          miles: offer.mileageCost,
          seats: offer.remainingSeats,
        };
      }
    }
  }

  if (!best) return `${newKeys.length} new award seat(s)`;
  const pts = `${Math.round(best.miles / 1000)}k pts`;
  const seats = best.seats
    ? ` · ${best.seats} seat${best.seats > 1 ? "s" : ""}`
    : "";
  const more = newKeys.length > 1 ? ` (+${newKeys.length - 1} more)` : "";
  return `${best.cabin} ${best.from}→${best.to} · ${pts}${seats}${more}`;
}
