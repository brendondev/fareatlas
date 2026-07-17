"use client";

import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { AwardResult } from "@/lib/seats-aero";

type SearchResponse = {
  results: AwardResult[];
  count: number;
  error?: string;
  query?: {
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
  };
};

function isoDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

function formatPoints(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-AU").format(value);
}

export function AwardSearch({ configured }: { configured: boolean }) {
  const defaults = useMemo(
    () => ({
      origin: "SYD",
      destination: "HND",
      startDate: isoDate(21),
      endDate: isoDate(75),
    }),
    [],
  );

  const [origin, setOrigin] = useState(defaults.origin);
  const [destination, setDestination] = useState(defaults.destination);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [directOnly, setDirectOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AwardResult[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsById, setTripsById] = useState<
    Record<
      string,
      {
        trips: Array<{
          id: string;
          cabin: string | null;
          mileageCost: number | null;
          remainingSeats: number | null;
          stops: number | null;
          flightNumbers: string | null;
          departsAt: string | null;
          arrivesAt: string | null;
          totalTaxes: number | null;
        }>;
        bookingLinks: Array<{ label: string; link: string; primary?: boolean }>;
      }
    >
  >({});

  const onSearch = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!configured) return;

      setLoading(true);
      setError(null);
      setExpandedId(null);

      try {
        const params = new URLSearchParams({
          origin: origin.trim().toUpperCase(),
          destination: destination.trim().toUpperCase(),
          start_date: startDate,
          end_date: endDate,
          take: "80",
          order_by: "lowest_mileage",
        });
        if (directOnly) params.set("only_direct", "true");

        const res = await fetch(`/api/awards/search?${params.toString()}`);
        const data = (await res.json()) as SearchResponse & {
          detail?: string;
        };

        if (!res.ok) {
          setResults(null);
          setError(data.error ?? data.detail ?? "Search failed.");
          return;
        }

        setResults(data.results ?? []);
      } catch {
        setResults(null);
        setError("Network error while searching awards.");
      } finally {
        setLoading(false);
      }
    },
    [configured, destination, directOnly, endDate, origin, startDate],
  );

  const loadTrips = useCallback(async (availabilityId: string) => {
    if (tripsById[availabilityId]) {
      setExpandedId((current) =>
        current === availabilityId ? null : availabilityId,
      );
      return;
    }

    setExpandedId(availabilityId);
    setTripsLoading(true);
    try {
      const res = await fetch(`/api/awards/${availabilityId}/trips`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load flight details.");
        return;
      }
      setTripsById((prev) => ({
        ...prev,
        [availabilityId]: {
          trips: data.trips ?? [],
          bookingLinks: data.bookingLinks ?? [],
        },
      }));
    } catch {
      setError("Network error while loading trips.");
    } finally {
      setTripsLoading(false);
    }
  }, [tripsById]);

  if (!configured) {
    return (
      <div className="mt-5 rounded-xl bg-[var(--soft)] p-4 text-sm text-[var(--muted)]">
        Set <code className="text-[var(--ink)]">AWARD_AVAILABILITY_API_KEY</code>{" "}
        in <code className="text-[var(--ink)]">.env.local</code> or Vercel to
        enable live Seats.aero search.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      <form
        className="grid gap-3 rounded-xl bg-[var(--soft)] p-4 md:grid-cols-2 xl:grid-cols-6"
        onSubmit={onSearch}
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
          From
          <input
            className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)] uppercase"
            maxLength={15}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            placeholder="SYD"
            value={origin}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
          To
          <input
            className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)] uppercase"
            maxLength={15}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            placeholder="HND"
            value={destination}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
          Start
          <input
            className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]"
            onChange={(e) => setStartDate(e.target.value)}
            type="date"
            value={startDate}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
          End
          <input
            className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]"
            onChange={(e) => setEndDate(e.target.value)}
            type="date"
            value={endDate}
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-[var(--ink)]">
          <input
            checked={directOnly}
            className="size-4"
            onChange={(e) => setDirectOnly(e.target.checked)}
            type="checkbox"
          />
          Direct only
        </label>
        <div className="flex items-end">
          <button
            className="h-10 w-full rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-strong)] disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Searching…" : "Search awards"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      ) : null}

      {results ? (
        <div className="overflow-hidden rounded-xl ring-1 ring-[var(--line)]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[var(--soft)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Best cabin</th>
                <th className="px-4 py-3 font-medium">Points</th>
                <th className="px-4 py-3 font-medium">Seats</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-[var(--muted)]"
                    colSpan={7}
                  >
                    No award availability in this window. Try wider dates or
                    nearby airports.
                  </td>
                </tr>
              ) : (
                results.map((row) => {
                  const best = row.bestCabin;
                  const open = expandedId === row.id;
                  const detail = tripsById[row.id];
                  return (
                    <Fragment key={row.id}>
                      <tr className="border-t border-[var(--line)]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {row.from} → {row.to}
                        </td>
                        <td className="px-4 py-3">{row.program}</td>
                        <td className="px-4 py-3">{best?.label ?? "—"}</td>
                        <td className="px-4 py-3 font-semibold text-[var(--good)]">
                          {formatPoints(best?.mileageCost)}
                        </td>
                        <td className="px-4 py-3">
                          {best?.remainingSeats ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--soft)]"
                            onClick={() => loadTrips(row.id)}
                            type="button"
                          >
                            {open ? "Hide" : "Flights"}
                          </button>
                        </td>
                      </tr>
                      {open ? (
                        <tr className="border-t border-[var(--line)] bg-[var(--soft)]/60">
                          <td className="px-4 py-4" colSpan={7}>
                            {tripsLoading && !detail ? (
                              <p className="text-sm text-[var(--muted)]">
                                Loading flight options…
                              </p>
                            ) : detail ? (
                              <div className="space-y-3">
                                {detail.trips.slice(0, 8).map((trip) => (
                                  <div
                                    className="rounded-lg bg-white p-3 ring-1 ring-[var(--line)]"
                                    key={trip.id}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <p className="font-medium">
                                        {trip.flightNumbers ?? "Itinerary"} ·{" "}
                                        {trip.cabin ?? "cabin"}
                                      </p>
                                      <p className="text-sm font-semibold text-[var(--good)]">
                                        {formatPoints(trip.mileageCost)} pts
                                        {trip.totalTaxes
                                          ? ` + taxes ${trip.totalTaxes}`
                                          : ""}
                                      </p>
                                    </div>
                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                      {trip.departsAt
                                        ? new Date(trip.departsAt).toLocaleString(
                                            "en-AU",
                                          )
                                        : "—"}{" "}
                                      →{" "}
                                      {trip.arrivesAt
                                        ? new Date(trip.arrivesAt).toLocaleString(
                                            "en-AU",
                                          )
                                        : "—"}
                                      {trip.stops !== null
                                        ? ` · ${trip.stops} stop${trip.stops === 1 ? "" : "s"}`
                                        : ""}
                                      {trip.remainingSeats !== null
                                        ? ` · ${trip.remainingSeats} seats`
                                        : ""}
                                    </p>
                                  </div>
                                ))}
                                {detail.bookingLinks.length ? (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {detail.bookingLinks.map((link) => (
                                      <a
                                        className="rounded-lg bg-[var(--ink)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                                        href={link.link}
                                        key={link.link}
                                        rel="noreferrer"
                                        target="_blank"
                                      >
                                        {link.label}
                                      </a>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <p className="text-sm text-[var(--muted)]">
                                No trip details returned.
                              </p>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
          {results.length > 0 ? (
            <p className="border-t border-[var(--line)] px-4 py-3 text-xs text-[var(--muted)]">
              Showing {results.length} availability rows via Seats.aero cached
              search. Book on the airline program — FareAtlas does not ticket
              awards.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Search live award seats across Qantas, Velocity and partner programs.
        </p>
      )}
    </div>
  );
}
