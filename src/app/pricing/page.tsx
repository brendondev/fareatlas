import type { Metadata } from "next";
import { PricingPlans, type PriceLabels } from "@/components/pricing-plans";
import { WaitlistForm } from "@/components/waitlist-form";
import { isBillingConfigured, PAID_TIERS } from "@/lib/billing/plans";
import { formatPrice, getPlanPrices } from "@/lib/billing/prices";
import { PRICING } from "@/lib/content";
import { getViewer } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free with offers and Economy awards. Premium unlocks every cabin and the full year; Pro adds unlimited routes and priority alerts.",
};

// Live Stripe prices are runtime data — never prerender this page.
export const dynamic = "force-dynamic";

const PLANS = [PRICING.free, PRICING.premium, PRICING.pro];

export default async function PricingPage() {
  const viewer = await getViewer();
  const billingLive = isBillingConfigured();

  return (
    <main className="container-wide py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="pill text-[var(--accent)]">Simple plans</span>
        <h1 className="section-title mt-4">
          Start free. Upgrade when you want every seat.
        </h1>
        <p className="section-lead mx-auto">
          Browse every offer and search Economy awards for nothing, forever.
          Premium opens every cabin and the full 12-month window with email
          alerts; Pro adds unlimited routes and alerts that check twice as
          often — and every plan shows the cash fare beside the points.
        </p>
      </div>

      <div className="mt-12">
        {billingLive ? (
          <PricingPlans
            plans={PLANS}
            priceLabels={await priceLabels()}
            signedIn={Boolean(viewer.user)}
          />
        ) : (
          <BillingComingSoon signedInEmail={viewer.user?.email} />
        )}
      </div>
    </main>
  );
}

/** Live prices, formatted per (tier, interval), for the interactive grid. */
async function priceLabels(): Promise<PriceLabels> {
  const prices = await getPlanPrices();
  const labels: PriceLabels = {};
  for (const tier of PAID_TIERS) {
    labels[tier] = {
      month: formatPrice(prices[tier].month),
      year: formatPrice(prices[tier].year),
    };
  }
  return labels;
}

/**
 * Fallback when Stripe isn't configured on this deploy: the plans are shown as
 * feature lists (no invented price), and the waitlist captures interest — the
 * same honest degradation used before billing existed.
 */
function BillingComingSoon({ signedInEmail }: { signedInEmail?: string }) {
  return (
    <>
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            className={`card relative overflow-hidden p-6 sm:p-7 ${
              plan.highlighted ? "border-[var(--accent)]/45 shadow-[var(--shadow)]" : ""
            }`}
            key={plan.tier}
          >
            <p className="text-sm font-semibold text-[var(--accent)]">
              {plan.name}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {plan.tier === "free" ? "$0" : "Coming soon"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{plan.periodHint}</p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {plan.includes.map((item) => (
                <li className="flex gap-2" key={item}>
                  <span className="text-[var(--good)]">✓</span>
                  <span className="text-[var(--ink-soft)]">{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="mx-auto mt-14 max-w-2xl" id="waitlist">
        <WaitlistForm defaultEmail={signedInEmail} />
        <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
          Billing isn&apos;t switched on for this deployment yet. Route alerts
          already work — we watch your routes and flag seats as they open. Join
          the list and we&apos;ll email you the moment paid plans open.
        </p>
      </section>
    </>
  );
}
