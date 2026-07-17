import type { Metadata } from "next";
import {
  money,
  ProgramBadge,
  VerticalShell,
} from "@/components/vertical-shell";
import { getGiftCardRates } from "@/lib/verticals";

export const metadata: Metadata = {
  title: "Gift card earn rates",
  description:
    "Which gift cards earn the most points per dollar across Qantas Marketplace and the Velocity Store.",
};

export default async function GiftCardsPage() {
  const { items, source } = await getGiftCardRates();

  return (
    <VerticalShell
      eyebrow="Gift cards"
      lead="Buying gift cards through a program's store is one of the fastest ways to earn on spending you'd do anyway. Ranked by points per dollar."
      source={source}
      title="Gift card earn rates"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((rate, i) => (
          <article className="card p-5" key={rate.id}>
            <div className="flex items-center justify-between gap-2">
              <ProgramBadge color={rate.programColor} name={rate.channel} />
              {i === 0 ? (
                <span className="text-[10px] font-bold text-[var(--accent)]">
                  ★ Top rate
                </span>
              ) : null}
            </div>

            <h2 className="mt-4 font-display text-lg font-semibold">
              {rate.retailer}
            </h2>

            <p className="mt-3 tabular">
              <span className="font-display text-3xl font-semibold text-[var(--accent)]">
                {rate.pointsPerDollar}
              </span>
              <span className="ml-1.5 text-sm text-[var(--muted)]">
                pts / $1
              </span>
            </p>

            <dl className="mt-4 space-y-1 text-xs text-[var(--muted)]">
              {rate.minSpendAud ? (
                <div className="flex justify-between">
                  <dt>Min spend</dt>
                  <dd className="tabular">{money.format(rate.minSpendAud)}</dd>
                </div>
              ) : null}
              {rate.capAud ? (
                <div className="flex justify-between">
                  <dt>Cap</dt>
                  <dd className="tabular">{money.format(rate.capAud)}</dd>
                </div>
              ) : null}
            </dl>
          </article>
        ))}
      </div>
    </VerticalShell>
  );
}
