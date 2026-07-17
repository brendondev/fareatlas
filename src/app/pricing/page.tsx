import type { Metadata } from "next";
import Link from "next/link";
import { AwardWatchForm } from "@/components/award-watch-form";
import { PRICING } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free with offers and Economy awards. Premium unlocks every cabin, longer windows and unlimited alerts.",
};

export default function PricingPage() {
  return (
    <main className="container-wide py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="pill bg-white text-[var(--accent)] ring-1 ring-[var(--line)]">
          Simple plans
        </span>
        <h1 className="section-title mt-4">Start free. Go Premium when you want every seat.</h1>
        <p className="section-lead mx-auto">
          Browse every offer and search Economy awards for nothing, forever.
          Premium opens every cabin and the full 12-month window — and both
          plans show you the cash fare beside the points, so you always know
          which one is actually the better deal.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        <PlanCard plan={PRICING.free} highlighted={false} />
        <PlanCard plan={PRICING.premium} highlighted />
      </div>

      <section className="mx-auto mt-14 max-w-2xl" id="waitlist">
        <AwardWatchForm />
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Premium billing (Stripe) and email alerts (Resend) are next. For now,
          leave a route watch with your email.
        </p>
      </section>
    </main>
  );
}

function PlanCard({
  plan,
  highlighted,
}: {
  plan: (typeof PRICING)[keyof typeof PRICING];
  highlighted: boolean;
}) {
  return (
    <article
      className={`rounded-[1.5rem] p-6 sm:p-7 ${
        highlighted
          ? "bg-[var(--ink)] text-white shadow-[var(--shadow)]"
          : "card"
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          highlighted ? "text-teal-200" : "text-[var(--accent)]"
        }`}
      >
        {plan.name}
      </p>
      <p className="mt-2 text-4xl font-bold tracking-tight">{plan.price}</p>
      <p
        className={`mt-1 text-sm ${
          highlighted ? "text-white/65" : "text-[var(--muted)]"
        }`}
      >
        {plan.period}
      </p>

      <p
        className={`mt-6 text-xs font-bold uppercase tracking-wide ${
          highlighted ? "text-white/50" : "text-[var(--muted)]"
        }`}
      >
        What you get
      </p>
      <ul className="mt-3 space-y-2.5 text-sm">
        {plan.includes.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className={highlighted ? "text-teal-300" : "text-[var(--good)]"}>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {plan.locked.length ? (
        <>
          <p
            className={`mt-6 text-xs font-bold uppercase tracking-wide ${
              highlighted ? "text-white/50" : "text-[var(--muted)]"
            }`}
          >
            Upgrade unlocks
          </p>
          <ul className="mt-3 space-y-2.5 text-sm opacity-70">
            {plan.locked.map((item) => (
              <li className="flex gap-2" key={item}>
                <span>○</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Link
        className={`btn mt-8 w-full ${highlighted ? "btn-coral" : "btn-primary"}`}
        href={plan.href}
      >
        {plan.cta}
      </Link>
    </article>
  );
}
