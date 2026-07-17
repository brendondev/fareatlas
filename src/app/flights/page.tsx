import type { Metadata } from "next";
import { AwardSearch } from "@/components/award-search";
import { AwardWatchForm } from "@/components/award-watch-form";
import { CABINS, RECENT_AWARDS } from "@/lib/content";
import { getCashFares } from "@/lib/offers";
import { isSeatsAeroConfigured } from "@/lib/seats-aero";

export const metadata: Metadata = {
  title: "Award flights",
  description:
    "Search reward seat availability and compare with cash fares for Australian routes.",
};

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export default async function FlightsPage() {
  const configured = isSeatsAeroConfigured();
  const { fares, source } = await getCashFares(4);

  return (
    <main className="container-wide py-10 sm:py-14">
      <div className="max-w-3xl">
        <span className="pill text-[var(--accent)]">
          Award seats · cash compare
        </span>
        <h1 className="section-title mt-4">Find reward flights</h1>
        <p className="section-lead">
          Search Economy through First with Seats.aero, open flight-level detail,
          and weigh cash alternatives so you only burn points when it wins.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CABINS.map((cabin) => (
          <div className="card p-4" key={cabin.code}>
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
              {cabin.code}
            </span>
            <h2 className="mt-3 font-bold">{cabin.name}</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              {cabin.body}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-10 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Live award search</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                AU-focused programs by default (Qantas, Velocity + partners).
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                configured
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[var(--soft)] text-[var(--muted)]"
              }`}
            >
              {configured ? "Seats.aero live" : "API key needed"}
            </span>
          </div>
          <div className="mt-5">
            <AwardSearch configured={configured} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-bold">Cash fare watch</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Source: {source === "neon" ? "Neon" : "demo"} · Amadeus next
            </p>
            <div className="mt-4 space-y-3">
              {fares.map((fare) => (
                <div
                  className="rounded-xl bg-[var(--soft)] p-3"
                  key={fare.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{fare.routeLabel}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {fare.airline} · {fare.travelWindow}
                      </p>
                    </div>
                    <p className="font-bold">{money.format(fare.priceAud)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-bold">Recent signals</h2>
            <div className="mt-4 space-y-2">
              {RECENT_AWARDS.map((row) => (
                <div
                  className="rounded-xl bg-[var(--soft)] px-3 py-2.5 text-sm"
                  key={`${row.from}-${row.to}-${row.points}`}
                >
                  <div className="flex justify-between gap-2 font-semibold">
                    <span>
                      {row.from} → {row.to}
                    </span>
                    <span className="text-[var(--accent)]">{row.points}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {row.cabin} · {row.program} · {row.ago}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <AwardWatchForm />
        </div>
      </section>
    </main>
  );
}
