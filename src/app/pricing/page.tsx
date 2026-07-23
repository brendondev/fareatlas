import type { Metadata } from "next";
import { PricingPlans, type PriceLabels } from "@/components/pricing-plans";
import { WaitlistForm } from "@/components/waitlist-form";
import { isBillingConfigured, PAID_TIERS } from "@/lib/billing/plans";
import { formatPrice, getPlanPrices } from "@/lib/billing/prices";
import { getViewer } from "@/lib/dal";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free with offers and Economy awards. Premium unlocks every cabin and the full year; Pro adds unlimited routes and priority alerts.",
};

// Live Stripe prices are runtime data — never prerender this page.
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [viewer, dict] = await Promise.all([getViewer(), getDictionary()]);
  const t = dict.pricing;
  const plans = [dict.plans.free, dict.plans.premium, dict.plans.pro];
  const billingLive = isBillingConfigured();

  return (
    <main className="container-wide py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="pill text-[var(--accent)]">{t.eyebrow}</span>
        <h1 className="section-title mt-4">{t.title}</h1>
        <p className="section-lead mx-auto">{t.lead}</p>
      </div>

      <div className="mt-12">
        {billingLive ? (
          <PricingPlans
            labels={t}
            plans={plans}
            priceLabels={await priceLabels()}
            signedIn={Boolean(viewer.user)}
          />
        ) : (
          <div>
            <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
              {plans.map((plan) => (
                <article
                  className={`card relative overflow-hidden p-6 sm:p-7 ${
                    plan.tier === "premium"
                      ? "border-[var(--accent)]/45 shadow-[var(--shadow)]"
                      : ""
                  }`}
                  key={plan.tier}
                >
                  <p className="text-sm font-semibold text-[var(--accent)]">
                    {plan.name}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
                    {plan.tier === "free" ? "$0" : t.comingSoon}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {plan.periodHint}
                  </p>
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
              <WaitlistForm defaultEmail={viewer.user?.email} />
              <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
                {t.waitlistNote}
              </p>
            </section>
          </div>
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
