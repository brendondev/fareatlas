import type { Metadata } from "next";
import {
  money,
  money2,
  points,
  ProgramBadge,
  VerticalShell,
} from "@/components/vertical-shell";
import { getCardOffers } from "@/lib/verticals";

export const metadata: Metadata = {
  title: "Card sign-up bonuses",
  description:
    "Australian credit-card sign-up bonuses, with first-year fee shown as a cost per 1,000 bonus points — the same axis as wine, so you can compare them directly.",
};

export default async function CardsPage() {
  const { items, source } = await getCardOffers();

  return (
    <VerticalShell
      eyebrow="Cards & perks"
      lead="Sign-up bonuses are the single biggest points haul most people can get. We put the first-year fee against the bonus as a cost per 1,000 points — the same number we rank wine on, so the two are directly comparable."
      source={source}
      title="Card sign-up bonuses"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((card) => (
          <article className="card p-6" key={card.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <ProgramBadge color={card.programColor} name={card.programName} />
                <h2 className="mt-3 font-display text-xl font-semibold">
                  {card.cardName}
                </h2>
                <p className="text-sm text-[var(--muted)]">{card.issuer}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-semibold text-[var(--accent)] tabular">
                  {points.format(card.bonusPoints)}
                </p>
                <p className="text-xs text-[var(--muted)]">bonus points</p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Cell label="Min spend">
                {card.minSpendAud ? money.format(card.minSpendAud) : "—"}
                {card.spendWindowDays ? (
                  <span className="text-xs text-[var(--muted)]">
                    {" "}
                    in {card.spendWindowDays} days
                  </span>
                ) : null}
              </Cell>
              <Cell label="First-year fee">
                {card.feeFirstYearAud === null
                  ? "—"
                  : card.feeFirstYearAud === 0
                    ? "Waived"
                    : money.format(card.feeFirstYearAud)}
              </Cell>
              <Cell label="Ongoing fee">
                {card.annualFeeAud ? money.format(card.annualFeeAud) : "—"}
              </Cell>
              <Cell highlight label="Fee / 1,000 pts">
                {card.feePer1000Bonus === null
                  ? "—"
                  : money2.format(card.feePer1000Bonus)}
              </Cell>
            </dl>

            {card.eligibility ? (
              <p className="mt-4 text-xs text-[var(--muted)]">
                {card.eligibility}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
        Card details change often and eligibility rules vary — always confirm
        the current offer with the issuer before applying. Nothing here is
        financial advice.
      </p>
    </VerticalShell>
  );
}

function Cell({
  label,
  highlight,
  children,
}: {
  label: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        highlight ? "bg-[var(--accent-soft)]" : "bg-[var(--soft)]"
      }`}
    >
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd
        className={`mt-0.5 font-semibold tabular ${
          highlight ? "text-[var(--accent)]" : ""
        }`}
      >
        {children}
      </dd>
    </div>
  );
}
