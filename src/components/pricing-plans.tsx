"use client";

import Link from "next/link";
import { useState } from "react";
import { startCheckout } from "@/lib/actions/billing";
import type { Dictionary } from "@/lib/i18n";

type Plan = Dictionary["plans"][keyof Dictionary["plans"]];
type PricingLabels = Dictionary["pricing"];
type Interval = "month" | "year";

/** Formatted price strings per paid tier, per interval — computed on the server
 * from live Stripe prices, or null when that price isn't configured. */
export type PriceLabels = Record<string, Record<Interval, string | null>>;

/**
 * The interactive pricing grid: a monthly/annual toggle over three plan cards.
 * Paid cards post to the `startCheckout` server action, which resolves the
 * (tier, interval) to a Stripe price and redirects to Checkout — the client
 * never handles a price ID or a card number.
 *
 * All copy comes from `labels` (the pricing dictionary slice) so the grid
 * follows the viewer's language; only the plan tier drives layout emphasis.
 */
export function PricingPlans({
  plans,
  priceLabels,
  signedIn,
  labels,
}: {
  plans: Plan[];
  priceLabels: PriceLabels;
  signedIn: boolean;
  labels: PricingLabels;
}) {
  const [interval, setInterval] = useState<Interval>("month");

  return (
    <div>
      <div className="mx-auto mb-8 flex w-fit items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--soft)] p-1 text-sm">
        {(["month", "year"] as const).map((value) => (
          <button
            aria-pressed={interval === value}
            className={`rounded-full px-4 py-1.5 font-semibold transition ${
              interval === value
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            key={value}
            onClick={() => setInterval(value)}
            type="button"
          >
            {value === "month" ? labels.monthly : labels.annual}
          </button>
        ))}
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            interval={interval}
            key={plan.tier}
            labels={labels}
            plan={plan}
            priceLabel={priceLabels[plan.tier]?.[interval] ?? null}
            signedIn={signedIn}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  interval,
  priceLabel,
  signedIn,
  labels,
}: {
  plan: Plan;
  interval: Interval;
  priceLabel: string | null;
  signedIn: boolean;
  labels: PricingLabels;
}) {
  const isFree = plan.tier === "free";
  const highlighted = plan.tier === "premium";
  const perLabel = interval === "month" ? labels.perMonth : labels.perYear;

  return (
    <article
      className={`card relative flex flex-col overflow-hidden p-6 sm:p-7 ${
        highlighted ? "border-[var(--accent)]/45 shadow-[var(--shadow)]" : ""
      }`}
    >
      {highlighted ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background:
              "linear-gradient(180deg, rgba(79, 70, 229, 0.08), transparent 100%)",
          }}
        />
      ) : null}

      <p className="relative text-sm font-semibold text-[var(--accent)]">
        {plan.name}
      </p>

      <p className="relative mt-2 font-display text-4xl font-semibold tracking-tight">
        {isFree ? "$0" : (priceLabel ?? "—")}
        {!isFree && priceLabel ? (
          <span className="text-base font-medium text-[var(--muted)]">
            /{perLabel}
          </span>
        ) : null}
      </p>
      <p className="relative mt-1 text-sm text-[var(--muted)]">
        {isFree
          ? plan.periodHint
          : priceLabel
            ? interval === "month"
              ? labels.billedMonthly
              : labels.billedYearly
            : plan.periodHint}
      </p>

      <p className="relative mt-6 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
        {labels.whatYouGet}
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
            {labels.upgradeUnlocks}
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

      <div className="relative mt-8 pt-2">
        <CardCta
          available={Boolean(priceLabel)}
          highlighted={highlighted}
          interval={interval}
          isFree={isFree}
          labels={labels}
          planName={plan.name}
          signedIn={signedIn}
          tier={plan.tier}
        />
      </div>
    </article>
  );
}

function CardCta({
  isFree,
  tier,
  planName,
  interval,
  available,
  highlighted,
  signedIn,
  labels,
}: {
  isFree: boolean;
  tier: string;
  planName: string;
  interval: Interval;
  available: boolean;
  highlighted: boolean;
  signedIn: boolean;
  labels: PricingLabels;
}) {
  if (isFree) {
    return (
      <Link
        className="btn btn-secondary w-full"
        href={signedIn ? "/flights" : "/register"}
      >
        {signedIn ? labels.goToSearch : labels.startFree}
      </Link>
    );
  }

  if (!available) {
    return (
      <button className="btn btn-secondary w-full" disabled type="button">
        {labels.unavailable}
      </button>
    );
  }

  // Signed-out users can still click buy — startCheckout requires a user and
  // bounces to /login?next=/pricing — but a clear "create account" reads better.
  if (!signedIn) {
    return (
      <Link
        className={`btn w-full ${highlighted ? "btn-accent" : "btn-secondary"}`}
        href="/register?next=/pricing"
      >
        {labels.createAccountToUpgrade}
      </Link>
    );
  }

  return (
    <form action={startCheckout}>
      <input name="tier" type="hidden" value={tier} />
      <input name="interval" type="hidden" value={interval} />
      <button
        className={`btn w-full ${highlighted ? "btn-accent" : "btn-secondary"}`}
        type="submit"
      >
        {labels.upgradeTo} {planName}
      </button>
    </form>
  );
}
