"use client";

import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { UpgradePanel } from "@/components/upgrade-panel";
import type { AwardResult } from "@/lib/seats-aero";

type SearchResponse = {
  results: AwardResult[];
  count: number;
  error?: string;
  cache?: {
    enabled?: boolean;
    source?: "cache" | "api";
    dayKey?: string | null;
    hitCount?: number;
  };
  entitlements?: {
    tier?: "free" | "premium";
    clamped?: { cabins: boolean; startDate: boolean; endDate: boolean };
    clampedAtAll?: boolean;
  };
  query?: {
    startDate?: string;
    endDate?: string;
    cabins?: string | null;
  };
};

const CABIN_OPTIONS = [
  { value: "economy", label: "Economy", code: "Y" },
  { value: "premium", label: "Premium Eco.", code: "W" },
  { value: "business", label: "Business", code: "J" },
  { value: "first", label: "First", code: "F" },
] as const;

function isoDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

function formatPoints(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-AU").format(value);
}

/** Says exactly what was trimmed, rather than a vague "upgrade for more". */
function buildClampMessage(
  clamped: { cabins: boolean; startDate: boolean; endDate: boolean } | undefined,
  window: string | null,
): string {
  const parts: string[] = [];
  if (clamped?.cabins) {
    parts.push("Free covers Economy, so premium cabins were left out");
  }
  if (clamped?.endDate) {
    parts.push(
      window
        ? `the search window was trimmed to ${window}`
        : "the search window was trimmed to 90 days",
    );
  }
  if (!parts.length) return "Premium opens every cabin and the full year.";

  const joined =
    parts.length === 1 ? parts[0]! : `${parts[0]} and ${parts[1]}`;
  return `${joined.charAt(0).toUpperCase()}${joined.slice(1)}. Premium opens Premium Economy, Business and First across the full 12 months.`;
}

export function AwardSearch({
  configured,
  tier,
  signedIn,
}: {
  configured: boolean;
  tier: "free" | "premium";
  signedIn: boolean;
}) {
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
  const [cabins, setCabins] = useState<string[]>(["economy"]);
  const [directOnly, setDirectOnly] = useState(false);
  const [clamped, setClamped] = useState<SearchResponse["entitlements"] | null>(
    null,
  );
  const [searchedWindow, setSearchedWindow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AwardResult[] | null>(null);
  const [cacheLabel, setCacheLabel] = useState<string | null>(null);
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
        if (cabins.length) params.set("cabins", cabins.join(","));
        if (directOnly) params.set("only_direct", "true");

        const res = await fetch(`/api/awards/search?${params.toString()}`);
        const data = (await res.json()) as SearchResponse & { detail?: string };

        if (!res.ok) {
          setResults(null);
          setCacheLabel(null);
          setClamped(null);
          setError(data.error ?? data.detail ?? "Search failed.");
          return;
        }

        setResults(data.results ?? []);
        setClamped(data.entitlements ?? null);
        // Report the window that was actually searched, which after clamping
        // may not be the one in the date inputs.
        setSearchedWindow(
          data.query?.startDate && data.query?.endDate
            ? `${data.query.startDate} → ${data.query.endDate}`
            : null,
        );
        if (data.cache?.source === "cache") {
          setCacheLabel(
            `served from Neon cache${
              data.cache.hitCount ? ` (hit #${data.cache.hitCount})` : ""
            }`,
          );
        } else if (data.cache?.source === "api") {
          setCacheLabel(
            data.cache.enabled
              ? "fresh from Seats.aero · saved to cache"
              : "from Seats.aero (DB cache offline)",
          );
        } else {
          setCacheLabel(null);
        }
      } catch {
        setResults(null);
        setCacheLabel(null);
        setError("Network error while searching awards.");
      } finally {
        setLoading(false);
      }
    },
    [cabins, configured, destination, directOnly, endDate, origin, startDate],
  );

  const loadTrips = useCallback(
    async (availabilityId: string) => {
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
    },
    [tripsById],
  );

  if (!configured) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft)] p-5 text-sm text-[var(--muted)]">
        Set{" "}
        <code className="rounded bg-[var(--soft)] px-1.5 py-0.5 text-[var(--ink)]">
          AWARD_AVAILABILITY_API_KEY
        </code>{" "}
        in Vercel or{" "}
        <code className="rounded bg-[var(--soft)] px-1.5 py-0.5 text-[var(--ink)]">
          .env.local
        </code>{" "}
        to enable live Seats.aero search. Demo award cards still appear above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[var(--shadow-sm)] md:grid-cols-2 xl:grid-cols-6"
        onSubmit={onSearch}
      >
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
          From
          <input
            className="h-11 rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm uppercase text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            maxLength={15}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            placeholder="SYD"
            value={origin}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
          To
          <input
            className="h-11 rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm uppercase text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            maxLength={15}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            placeholder="HND"
            value={destination}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
          Start
          <input
            className="h-11 rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            onChange={(e) => setStartDate(e.target.value)}
            type="date"
            value={startDate}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
          End
          <input
            className="h-11 rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            onChange={(e) => setEndDate(e.target.value)}
            type="date"
            value={endDate}
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm font-medium text-[var(--ink)]">
          <input
            checked={directOnly}
            className="size-4 accent-[var(--accent)]"
            onChange={(e) => setDirectOnly(e.target.checked)}
            type="checkbox"
          />
          Direct only
        </label>
        <div className="flex items-end">
          <button
            className="btn btn-accent h-11 w-full"
            disabled={loading}
            type="submit"
          >
            {loading ? "Searching…" : "Search awards"}
          </button>
        </div>

        <div className="md:col-span-2 xl:col-span-6">
          <p className="text-xs font-semibold text-[var(--muted)]">Cabins</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CABIN_OPTIONS.map((option) => {
              const locked = tier === "free" && option.value !== "economy";
              const active = cabins.includes(option.value);
              return (
                <button
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : locked
                        ? "border-dashed border-[var(--accent)]/40 text-[var(--muted)]"
                        : "border-[var(--line)] bg-[var(--soft)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]"
                  }`}
                  key={option.value}
                  onClick={() =>
                    setCabins((current) =>
                      current.includes(option.value)
                        ? current.filter((c) => c !== option.value)
                        : [...current, option.value],
                    )
                  }
                  type="button"
                >
                  <span className="font-display">{option.code}</span>
                  {option.label}
                  {/* Locked cabins stay clickable on purpose: the server
                      clamps and answers with the upsell, which teaches more
                      than a dead control does. */}
                  {locked ? <span aria-label="Premium">🔒</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      {error ? (
        <p className="rounded-2xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/25">
          {error}
        </p>
      ) : null}

      {clamped?.clampedAtAll ? (
        <UpgradePanel
          body={buildClampMessage(clamped.clamped, searchedWindow)}
          signedIn={signedIn}
          title="Showing what your plan covers"
        />
      ) : null}

      {results ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow-sm)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-[var(--soft)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Route</th>
                  <th className="px-4 py-3 font-semibold">Program</th>
                  <th className="px-4 py-3 font-semibold">Cabin</th>
                  <th className="px-4 py-3 font-semibold">Points</th>
                  <th className="px-4 py-3 font-semibold">Seats</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-[var(--muted)]" colSpan={7}>
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
                          <td className="px-4 py-3 font-semibold">
                            {row.from} → {row.to}
                          </td>
                          <td className="px-4 py-3">{row.program}</td>
                          <td className="px-4 py-3">{best?.label ?? "—"}</td>
                          <td className="px-4 py-3 font-bold text-[var(--accent)]">
                            {formatPoints(best?.mileageCost)}
                          </td>
                          <td className="px-4 py-3">
                            {best?.remainingSeats ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--soft)]"
                              onClick={() => loadTrips(row.id)}
                              type="button"
                            >
                              {open ? "Hide" : "Flights"}
                            </button>
                          </td>
                        </tr>
                        {open ? (
                          <tr className="border-t border-[var(--line)] bg-[var(--soft)]/70">
                            <td className="px-4 py-4" colSpan={7}>
                              {tripsLoading && !detail ? (
                                <p className="text-sm text-[var(--muted)]">
                                  Loading flight options…
                                </p>
                              ) : detail ? (
                                <div className="space-y-3">
                                  {detail.trips.slice(0, 8).map((trip) => (
                                    <div
                                      className="rounded-xl bg-[var(--soft)] p-3 ring-1 ring-[var(--line)]"
                                      key={trip.id}
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-semibold">
                                          {trip.flightNumbers ?? "Itinerary"} ·{" "}
                                          {trip.cabin ?? "cabin"}
                                        </p>
                                        <p className="text-sm font-bold text-[var(--accent)]">
                                          {formatPoints(trip.mileageCost)} pts
                                          {trip.totalTaxes
                                            ? ` + taxes ${trip.totalTaxes}`
                                            : ""}
                                        </p>
                                      </div>
                                      <p className="mt-1 text-xs text-[var(--muted)]">
                                        {trip.departsAt
                                          ? new Date(
                                              trip.departsAt,
                                            ).toLocaleString("en-AU")
                                          : "—"}{" "}
                                        →{" "}
                                        {trip.arrivesAt
                                          ? new Date(
                                              trip.arrivesAt,
                                            ).toLocaleString("en-AU")
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
                                          className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-strong)]"
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
          </div>
          {results.length > 0 ? (
            <p className="border-t border-[var(--line)] px-4 py-3 text-xs text-[var(--muted)]">
              Showing {results.length} rows
              {cacheLabel ? ` · ${cacheLabel}` : ""}. FareAtlas does not ticket
              awards — book on the airline program. Duplicate searches today
              are served from Neon cache to save Seats.aero quota.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Search live award seats across Qantas, Velocity and partner programs —
          then compare with cash fares on the side panel.
        </p>
      )}
    </div>
  );
}
