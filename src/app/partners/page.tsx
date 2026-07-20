import type { Metadata } from "next";
import {
  PARTNER_VERTICALS,
  PARTNERS,
  type PartnerBrand,
  type PartnerVertical,
} from "@/lib/partners";
import { programBySlug } from "@/lib/programs";

export const metadata: Metadata = {
  title: "Program partners",
  description:
    "Where each Australian loyalty program earns points — a curated directory of the retail, dining, fuel, travel and financial partners for Qantas, Velocity, Everyday Rewards and Flybuys.",
};

const ORDER = ["qantas", "velocity", "everyday", "flybuys"] as const;

const VERTICAL_ICON: Record<PartnerVertical, string> = {
  Retail: "🛍",
  Dining: "🍴",
  Fuel: "⛽",
  Travel: "✈",
  Financial: "💳",
};

export default function PartnersPage() {
  const sorted = [...PARTNERS].sort(
    (a, b) => ORDER.indexOf(a.programSlug as (typeof ORDER)[number]) -
      ORDER.indexOf(b.programSlug as (typeof ORDER)[number]),
  );

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <span className="pill text-[var(--accent)]">Where points earn</span>
        <h1 className="section-title mt-4">Program partners</h1>
        <p className="section-lead">
          A curated directory of the brands each AU program earns points at.
          Retail, dining, fuel, travel and financial — grouped so you can see
          the shape of a program before you join.
        </p>
      </div>

      <p className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 text-xs leading-relaxed text-[var(--muted)]">
        <strong className="font-semibold text-[var(--ink)]">Educational
        directory, not a FareAtlas partnership.</strong>{" "}
        FareAtlas has no commercial relationship with the programs or the
        brands listed here. Partner rosters change frequently — the
        program&apos;s own site is authoritative. Links below go to each
        program&apos;s official earn-points page.
      </p>

      <div className="mt-10 space-y-10">
        {sorted.map((entry) => {
          const program = programBySlug(entry.programSlug);
          if (!program) return null;

          const grouped = groupByVertical(entry.brands);

          return (
            <section
              className="card overflow-hidden p-0"
              key={entry.programSlug}
            >
              <header
                className="relative flex flex-wrap items-center justify-between gap-3 p-5"
                style={{ background: program.accent }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-11 place-items-center rounded-2xl text-sm font-bold text-white"
                    style={{ background: program.color }}
                  >
                    {program.shortCode}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
                      {program.name}
                    </h2>
                    <p className="text-xs text-[var(--muted)]">
                      {entry.brands.length} tracked partners across{" "}
                      {Object.keys(grouped).length} categories
                    </p>
                  </div>
                </div>
                <a
                  className="btn btn-secondary h-10"
                  href={entry.partnersUrl}
                  rel="noreferrer nofollow noopener"
                  target="_blank"
                >
                  Official partner list ↗
                </a>
              </header>

              <div className="grid gap-0 border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
                {PARTNER_VERTICALS.map((vertical) => {
                  const brands = grouped[vertical];
                  if (!brands?.length) return null;
                  return (
                    <div
                      className="border-b border-[var(--line)] p-5 sm:border-r last:sm:border-r-0"
                      key={vertical}
                    >
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                        <span aria-hidden>{VERTICAL_ICON[vertical]}</span>
                        {vertical}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {brands.map((brand) => (
                          <li
                            className="text-sm text-[var(--ink-soft)]"
                            key={brand.name}
                          >
                            {brand.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-[var(--muted)]">
        Trade marks belong to their respective owners. Not affiliated with or
        endorsed by any airline or loyalty program. Partner participation and
        earn rates change — verify on the program&apos;s own site before you
        rely on them.
      </p>
    </main>
  );
}

function groupByVertical(brands: PartnerBrand[]) {
  const grouped: Partial<Record<PartnerVertical, PartnerBrand[]>> = {};
  for (const brand of brands) {
    (grouped[brand.vertical] ??= []).push(brand);
  }
  return grouped;
}
