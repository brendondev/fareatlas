import { AwardSearch } from "@/components/award-search";
import { getDashboardData } from "@/lib/api";
import { isSeatsAeroConfigured } from "@/lib/seats-aero";

const formatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export default async function Home() {
  const {
    awardSignals,
    cashFares,
    pointsOffers,
    integrationGaps,
    awardsLive,
    awardsError,
  } = await getDashboardData();
  const seatsConfigured = isSeatsAeroConfigured();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-56 shrink-0 rounded-2xl bg-[var(--panel)] p-5 ring-1 ring-[var(--line)] lg:flex lg:flex-col">
          <div>
            <p className="text-xl font-semibold tracking-tight">FareAtlas</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Points and fares for Australian travellers.
            </p>
          </div>

          <nav className="mt-8 flex flex-col gap-1 text-sm">
            {["Watchlist", "Award seats", "Cash fares", "Offers", "Alerts"].map(
              (item, index) => (
                <a
                  className={`rounded-xl px-3 py-2 ${
                    index === 0
                      ? "bg-[var(--ink)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--ink)]"
                  }`}
                  href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                  key={item}
                >
                  {item}
                </a>
              ),
            )}
          </nav>

          <div className="mt-auto rounded-xl bg-[var(--soft)] p-4 text-sm">
            <p className="font-medium">API mode</p>
            <p className="mt-1 text-[var(--muted)]">
              {seatsConfigured
                ? awardsLive
                  ? "Seats.aero live. Cash fares still mocked."
                  : "Seats.aero key set; feed may be partial."
                : "Mock awards. Add AWARD_AVAILABILITY_API_KEY for live seats."}
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-col gap-3 rounded-2xl bg-[var(--panel)] p-5 ring-1 ring-[var(--line)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--accent)]">
                Australia first travel intelligence
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                Decide when to use points and when to pay cash.
              </h1>
            </div>
            <a
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-strong)]"
              href="#award-seats"
            >
              Search award seats
            </a>
          </header>

          <section
            className="mt-6 grid gap-4 md:grid-cols-3"
            id="watchlist"
          >
            {[
              ["Routes watched", "4 sample", "SYD, MEL, BNE dashboard probes"],
              [
                "Award feed",
                seatsConfigured ? (awardsLive ? "Live" : "Partial") : "Mock",
                seatsConfigured
                  ? "Seats.aero Partner API"
                  : "Connect AWARD_AVAILABILITY_API_KEY",
              ],
              ["Cash alerts", "9", "Amadeus / cash API still pending"],
            ].map(([label, value, note]) => (
              <div
                className="rounded-2xl bg-[var(--panel)] p-5 ring-1 ring-[var(--line)]"
                key={label}
              >
                <p className="text-sm text-[var(--muted)]">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{note}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div
              className="rounded-2xl bg-[var(--panel)] p-5 ring-1 ring-[var(--line)]"
              id="award-seats"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Award seat signals</h2>
                  <p className="text-sm text-[var(--muted)]">
                    Live Seats.aero search for AU-focused programs.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    seatsConfigured
                      ? "bg-emerald-50 text-[var(--good)]"
                      : "bg-[var(--soft)] text-[var(--muted)]"
                  }`}
                >
                  {seatsConfigured ? "Seats.aero" : "API pending"}
                </span>
              </div>

              {awardsError ? (
                <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
                  {awardsError}
                </p>
              ) : null}

              <div className="mt-5 overflow-hidden rounded-xl ring-1 ring-[var(--line)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[var(--soft)] text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Cabin</th>
                      <th className="px-4 py-3 font-medium">Points</th>
                      <th className="px-4 py-3 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {awardSignals.map((signal) => (
                      <tr
                        className="border-t border-[var(--line)]"
                        key={`${signal.from}-${signal.to}-${signal.cabin}-${signal.program}-${signal.points}`}
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium">
                            {signal.from} to {signal.to}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {signal.program} · {signal.seats} seats
                          </p>
                        </td>
                        <td className="px-4 py-4">{signal.cabin}</td>
                        <td className="px-4 py-4">{signal.points}</td>
                        <td className="px-4 py-4 font-semibold text-[var(--good)]">
                          {signal.valueCentsPerPoint === "—"
                            ? "cpp pending"
                            : `${signal.valueCentsPerPoint} cpp`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 border-t border-[var(--line)] pt-5">
                <h3 className="text-lg font-semibold">Live award search</h3>
                <p className="text-sm text-[var(--muted)]">
                  Origin / destination IATA · date window · open flight detail +
                  booking links.
                </p>
                <AwardSearch configured={seatsConfigured} />
              </div>
            </div>

            <div
              className="rounded-2xl bg-[var(--panel)] p-5 ring-1 ring-[var(--line)]"
              id="cash-fares"
            >
              <h2 className="text-xl font-semibold">Cash fare watch</h2>
              <p className="text-sm text-[var(--muted)]">
                Intended for paid flight price APIs and affiliate links.
              </p>

              <div className="mt-5 space-y-3">
                {cashFares.map((fare) => (
                  <div
                    className="rounded-xl bg-[var(--soft)] p-4"
                    key={`${fare.route}-${fare.airline}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{fare.route}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {fare.airline} · {fare.travelWindow}
                        </p>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatter.format(fare.price)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-[var(--good)]">
                      {fare.delta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className="mt-6 rounded-2xl bg-[var(--panel)] p-5 ring-1 ring-[var(--line)]"
            id="offers"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Points earning offers</h2>
                <p className="text-sm text-[var(--muted)]">
                  Mocked source for Qantas, Velocity, Everyday Rewards and Flybuys.
                </p>
              </div>
              <button className="h-10 rounded-xl border border-[var(--line)] px-4 text-sm font-medium hover:bg-[var(--soft)]">
                Add offer source
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {pointsOffers.map((offer) => (
                <article
                  className="rounded-xl bg-[var(--soft)] p-4"
                  key={offer.title}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-[var(--line)]">
                      {offer.program}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {offer.expires}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{offer.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {offer.summary}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[var(--accent)]">
                    {offer.estimate}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            className="mt-6 rounded-2xl bg-[var(--ink)] p-5 text-white"
            id="api-gaps"
          >
            <h2 className="text-xl font-semibold">API work left open</h2>
            <p className="mt-1 text-sm text-white/70">
              Stage progress from GUIA-APIS.md. Award search is wired; remaining
              adapters still use placeholders.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {integrationGaps.map((gap) => (
                <div
                  className="rounded-xl bg-white/8 p-4 ring-1 ring-white/10"
                  key={gap.name}
                >
                  <p className="font-medium">{gap.name}</p>
                  <p className="mt-1 text-sm text-white/70">{gap.nextStep}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
