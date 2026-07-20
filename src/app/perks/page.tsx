import type { Metadata } from "next";
import Link from "next/link";
import { PRICING } from "@/lib/content";
import { getViewer } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Premium perks",
  description:
    "What FareAtlas Premium unlocks — every cabin from Economy through First, the full 12-month award window, alerts on every route and priority for new tools.",
};

export const dynamic = "force-dynamic";

/** Three anchoring value props above the fold; the full list comes from
 *  PRICING.premium.includes so /pricing and /perks stay in sync. */
const HERO_PERKS = [
  {
    icon: "cabins",
    title: "Every cabin, not just Economy",
    body: "Premium Economy, Business and First award search across every mileage program Seats.aero exposes — the routes Free only teases.",
  },
  {
    icon: "window",
    title: "The full 12-month award window",
    body: "Search a year out instead of 90 days, so you catch premium inventory the moment it opens instead of missing the sweet spot.",
  },
  {
    icon: "alerts",
    title: "Alerts on every route you want",
    body: "Drop the three-alert cap. Watch as many city pairs and date ranges as you actually fly, in every cabin your points can reach.",
  },
] as const;

export default async function PerksPage() {
  const viewer = await getViewer();
  const isPremium = viewer.tier === "premium";

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <span className="pill text-[var(--accent)]">Premium perks</span>
        <h1 className="section-title mt-4">
          What Premium unlocks
        </h1>
        <p className="section-lead">
          Free covers Economy and the offers side of FareAtlas forever.
          Premium is for the flights you actually want — the ones near the
          front of the plane.
        </p>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {HERO_PERKS.map((perk) => (
          <article className="card p-6" key={perk.title}>
            <div className="grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <PerkIcon name={perk.icon} />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-[var(--ink)]">
              {perk.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {perk.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Everything Premium unlocks
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
            {PRICING.premium.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {PRICING.premium.period}
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {PRICING.premium.includes.map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <span
                  aria-hidden
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
                >
                  ✓
                </span>
                <span className="text-[var(--ink-soft)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="card p-6 sm:p-8">
          {isPremium ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--good)]">
                Your account
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
                You&apos;re on Premium
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                Every cabin, the full year, unlimited alerts. Search away —
                Seats.aero calls are on us.
              </p>
              <Link className="btn btn-accent mt-6 w-full" href="/flights">
                Open award search
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Get started
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
                Premium is on the waitlist
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                Billing isn&apos;t live yet — we&apos;re prioritising the seat
                data pipeline before we start charging. Join the waitlist and
                you&apos;ll be first in when it opens.
              </p>
              <Link className="btn btn-accent mt-6 w-full" href="/pricing">
                Join the waitlist
              </Link>
              <p className="mt-4 text-center text-xs text-[var(--muted)]">
                No card required.
              </p>
            </>
          )}
        </aside>
      </section>

      <section className="mt-14">
        <h2 className="section-title text-2xl">Why upgrade at all?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <UseCase
            title="You're planning a Business-class trip in ~9 months"
            body="Free stops at 90 days and Economy only. Premium sees J inventory the day it opens across the full year, so you actually catch the good release windows."
          />
          <UseCase
            title="You fly the same city pair often"
            body="Free lets you alert on three routes. If you're a Melbourne-Perth commuter with a Bali holiday and a Tokyo trip in mind, that's already gone."
          />
          <UseCase
            title="You transfer to a partner program"
            body="Aeroplan, Virgin Atlantic and Singapore KrisFlyer often price the same seat differently. Premium shows all of them so you route through the cheapest."
          />
          <UseCase
            title="You want the offers side for free"
            body="Offers, wine, gift cards, cards and cash-fare snapshots stay free forever. Premium is about the flight search — nothing on the earn side moves behind a paywall."
          />
        </div>
      </section>

      <p className="mt-12 text-xs leading-relaxed text-[var(--muted)]">
        Premium pricing and availability are subject to change while billing
        is being built. Nothing on this page is a subscription offer — the
        waitlist captures interest and does not charge.
      </p>
    </main>
  );
}

function UseCase({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-5">
      <h3 className="font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
    </article>
  );
}

function PerkIcon({ name }: { name: string }) {
  const common = "size-5";
  switch (name) {
    case "cabins":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M3 12l18-8-6 18-3-7-9-3z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "window":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <rect
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
            width="18"
            x="3"
            y="4"
          />
          <path d="M3 9h18M8 4v3M16 4v3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "alerts":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M6 9a6 6 0 1112 0c0 4 2 5 2 5H4s2-1 2-5zM10 19a2 2 0 004 0"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    default:
      return null;
  }
}
