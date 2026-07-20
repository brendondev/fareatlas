import type { Metadata } from "next";
import Link from "next/link";
import { OfferCard } from "@/components/offer-card";
import { MARKETPLACES, type Marketplace } from "@/lib/marketplaces";
import { getOffers } from "@/lib/offers";
import { programBySlug } from "@/lib/programs";

export const metadata: Metadata = {
  title: "Marketplaces",
  description:
    "The four AU loyalty program shopping portals in one view — Qantas Marketplace, Velocity Store, Everyday Rewards Shopping and Flybuys Marketplace.",
};

/** Ordered to match nav conventions: airline programs first, then grocery. */
const ORDER = ["qantas", "velocity", "everyday", "flybuys"] as const;

export default async function MarketplacePage() {
  // Marketplace offers pulled fresh: this hub is where a user goes to *find*
  // active boosts, so showing stale featured ones would defeat the purpose.
  const { offers, source } = await getOffers({
    category: "marketplace",
    take: 6,
  });

  const sorted = [...MARKETPLACES].sort(
    (a, b) => ORDER.indexOf(a.programSlug as (typeof ORDER)[number]) -
      ORDER.indexOf(b.programSlug as (typeof ORDER)[number]),
  );

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <span className="pill text-[var(--accent)]">Points shopping</span>
        <h1 className="section-title mt-4">Loyalty marketplaces</h1>
        <p className="section-lead">
          Every AU program runs a shopping portal where each dollar earns
          points, often stacked with a rotating multi-x rate. This is the
          shortest path to all four — plus the boosts we&apos;re tracking right
          now.
        </p>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {sorted.map((mp) => (
          <MarketplaceCard key={mp.programSlug} marketplace={mp} />
        ))}
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="section-title text-2xl">Live marketplace boosts</h2>
            <p className="section-lead">
              Curated bonus offers across the four marketplaces. Full list on
              the offers page.
            </p>
          </div>
          <Link className="btn btn-secondary" href="/offers">
            All offers
          </Link>
        </div>

        {offers.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-[var(--line-strong)] p-8 text-center text-sm text-[var(--muted)]">
            {source === "fallback"
              ? "Connect the database to show live marketplace boosts."
              : "No marketplace boosts are being tracked right now — check back soon."}
          </p>
        )}
      </section>

      <p className="mt-10 text-xs leading-relaxed text-[var(--muted)]">
        Marketplace names and links belong to their respective programs.
        FareAtlas is not affiliated with Qantas, Virgin Australia, Everyday
        Rewards or Flybuys. Baseline earn rates change without notice —
        always confirm on the program&apos;s own site before you shop.
      </p>
    </main>
  );
}

function MarketplaceCard({ marketplace }: { marketplace: Marketplace }) {
  const program = programBySlug(marketplace.programSlug);
  if (!program) return null;

  return (
    <article className="card relative overflow-hidden p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background: `linear-gradient(180deg, ${program.accent}, transparent 100%)`,
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div
          className="grid size-11 place-items-center rounded-2xl text-sm font-bold text-white"
          style={{ background: program.color }}
        >
          {program.shortCode}
        </div>
        <a
          className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
          href={marketplace.url}
          rel="noreferrer nofollow noopener"
          target="_blank"
        >
          Visit ↗
        </a>
      </div>
      <h2 className="relative mt-4 font-display text-xl font-semibold text-[var(--ink)]">
        {marketplace.name}
      </h2>
      <p className="relative mt-2 text-sm leading-relaxed text-[var(--muted)]">
        {marketplace.tagline}
      </p>
      <p className="relative mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        Earn rate
      </p>
      <p className="relative mt-1 text-sm text-[var(--ink)]">
        {marketplace.baseEarn}
      </p>
      <p className="relative mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        Categories
      </p>
      <div className="relative mt-2 flex flex-wrap gap-1.5">
        {marketplace.categories.map((cat) => (
          <span
            className="rounded-full border border-[var(--line)] bg-[var(--soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-soft)]"
            key={cat}
          >
            {cat}
          </span>
        ))}
      </div>
    </article>
  );
}
