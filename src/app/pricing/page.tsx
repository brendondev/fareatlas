import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { PRICING } from "@/lib/content";
import { getViewer } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free with offers and Economy awards. Premium unlocks every cabin, longer windows and unlimited alerts.",
};

export default async function PricingPage() {
  const viewer = await getViewer();

  return (
    <main className="container-wide py-10 sm:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="pill text-[var(--accent)]">Simple plans</span>
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
        <WaitlistForm defaultEmail={viewer.user?.email} />
        <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">
          Straight answer on what Premium isn&apos;t yet: there is no billing,
          and route alerts don&apos;t send. We save the routes you watch so
          they&apos;re ready the day alerting ships — nothing emails you before
          then.
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
      className={`card relative overflow-hidden p-6 sm:p-7 ${
        highlighted ? "border-[var(--accent)]/45 shadow-[var(--shadow)]" : ""
      }`}
    >
      {highlighted ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background:
              "linear-gradient(180deg, rgba(201, 169, 97, 0.12), transparent 100%)",
          }}
        />
      ) : null}
      <p className="relative text-sm font-semibold text-[var(--accent)]">
        {plan.name}
      </p>
      <p className="relative mt-2 font-display text-4xl font-semibold tracking-tight">
        {plan.price}
      </p>
      <p className="relative mt-1 text-sm text-[var(--muted)]">{plan.period}</p>

      <p className="relative mt-6 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
        What you get
      </p>
      <ul className="relative mt-3 space-y-2.5 text-sm">
        {plan.includes.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="text-[var(--good)]">✓</span>
            <span className="text-[var(--ink-soft)]">{item}</span>
          </li>
        ))}
      </ul>

      {plan.locked.length ? (
        <>
          <p className="relative mt-6 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Upgrade unlocks
          </p>
          <ul className="relative mt-3 space-y-2.5 text-sm">
            {plan.locked.map((item) => (
              <li className="flex gap-2 text-[var(--muted)]" key={item}>
                <span>○</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Link
        className={`btn relative mt-8 w-full ${
          highlighted ? "btn-accent" : "btn-secondary"
        }`}
        href={plan.href}
      >
        {plan.cta}
      </Link>
    </article>
  );
}
