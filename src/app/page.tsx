import Link from "next/link";
import { OfferCard } from "@/components/offer-card";
import { CABINS, FEATURES, PRICING, SITE, STEPS } from "@/lib/content";
import { getCashFares, getOffers } from "@/lib/offers";
import { PROGRAMS } from "@/lib/programs";

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export default async function HomePage() {
  const [{ offers }, { fares }] = await Promise.all([
    getOffers({ take: 4 }),
    getCashFares(3),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="hero-grid relative overflow-hidden border-b border-[var(--line)]">
        <div className="container-wide grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <span className="pill text-[var(--accent)]">
              Australia-first · Points + cash
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
              Points and reward flights —{" "}
              <span className="gradient-text">all in one place.</span>
            </h1>
            <p className="section-lead mt-5">
              {SITE.description} Unlike points-only apps, FareAtlas also tracks{" "}
              <strong className="font-semibold text-[var(--ink)]">
                cash fares
              </strong>{" "}
              so you know when dollars beat points.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-accent" href="/offers">
                Start earning smarter
              </Link>
              <Link className="btn btn-secondary" href="/flights">
                Search award seats
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
              <span>✓ Free to start</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 4 AU programs, one app</span>
            </div>
          </div>

          <div className="relative">
            <div className="card overflow-hidden p-0 shadow-[var(--shadow)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--soft)] px-4 py-3">
                <div className="flex gap-2">
                  <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[#0b0d10]">
                    Offers
                  </span>
                  <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    Flights
                  </span>
                </div>
                <span className="text-xs text-[var(--muted)]">Live preview</span>
              </div>
              <div className="space-y-3 p-4">
                {offers.slice(0, 3).map((offer) => (
                  <div
                    className="rounded-xl border border-[var(--line)] bg-[var(--soft)] p-3"
                    key={offer.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: offer.programColor }}
                      >
                        {offer.programName}
                      </span>
                      {offer.featured ? (
                        <span className="text-[10px] font-bold text-[var(--accent)]">
                          ★ Featured
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-snug">
                      {offer.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {offer.category} · {offer.expiresLabel}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 shadow-[var(--shadow)] sm:block">
              <p className="text-xs text-[var(--muted)]">Cash alternative</p>
              <p className="mt-0.5 text-sm font-semibold tabular">
                {fares[0]
                  ? `${fares[0].routeLabel} · ${money.format(fares[0].priceAud)}`
                  : "SYD → HND from $914"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="container-wide py-14">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Australia&apos;s core loyalty programs
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {PROGRAMS.map((program) => (
            <span className="program-chip" key={program.slug}>
              <span className="dot" style={{ background: program.color }} />
              {program.name}
            </span>
          ))}
        </div>
      </section>

      {/* Program panels */}
      <section className="container-wide pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">All your programs, one dashboard</h2>
          <p className="section-lead mx-auto">
            Stop checking four sites. Follow the programs you use and act when
            value appears — earn boosts or award seats.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((program) => (
            <article
              className="card relative overflow-hidden p-5"
              key={program.slug}
            >
              {/* Translucent brand wash over the panel — an opaque stop here
                  would punch a bright hole in the page. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-32"
                style={{
                  background: `linear-gradient(180deg, ${program.accent}, transparent 100%)`,
                }}
              />
              <div
                className="relative grid size-11 place-items-center rounded-2xl text-sm font-bold text-white"
                style={{ background: program.color }}
              >
                {program.shortCode}
              </div>
              <h3 className="relative mt-4 font-display text-lg font-semibold">
                {program.name}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {program.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        className="border-y border-[var(--line)] bg-[var(--panel)]/60 py-16"
        id="how-it-works"
      >
        <div className="container-wide">
          <div className="max-w-2xl">
            <h2 className="section-title">
              Everything you need to maximise points and flights
            </h2>
            <p className="section-lead">
              One membership path for offers, award alerts tuned to your travel
              windows, and cash comparisons when points are not the win.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature) => (
              <article className="card p-5" key={feature.title}>
                <div className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <FeatureIcon name={feature.icon} />
                </div>
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Offers strip */}
      <section className="container-wide py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">Today&apos;s points opportunities</h2>
            <p className="section-lead">
              Fresh earn boosts across Qantas, Velocity, Everyday Rewards and
              Flybuys.
            </p>
          </div>
          <Link className="btn btn-secondary" href="/offers">
            View all offers
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      {/* Award + cash */}
      <section className="container-wide pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card overflow-hidden p-0">
            <div className="border-b border-[var(--line)] bg-[var(--soft)] px-5 py-5">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Never miss an award seat
              </h2>
              <p className="mt-2 max-w-lg text-sm text-[var(--muted)]">
                Monitor Economy through First. FareAtlas pairs award inventory
                with cash alternatives so you redeem with intent.
              </p>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {CABINS.map((cabin) => (
                <div
                  className="rounded-2xl bg-[var(--soft)] p-4"
                  key={cabin.code}
                >
                  <span className="grid size-9 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] font-display text-sm font-bold text-[var(--accent)]">
                    {cabin.code}
                  </span>
                  <h3 className="mt-3 font-bold">{cabin.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                    {cabin.body}
                  </p>
                </div>
              ))}
            </div>
            {/* A list of fabricated "Recent award signals" sat here — see the
                note in lib/content.ts. Replaced with the real cabin ladder,
                which is honest and does the upsell better anyway. */}
            <div className="border-t border-[var(--line)] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Search live Seats.aero inventory
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                Economy is free forever. Premium Economy, Business and First
                come with Premium.
              </p>
              <Link className="btn btn-accent mt-4" href="/flights">
                Open award search
              </Link>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <span className="pill text-[var(--accent)]">FareAtlas edge</span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              Buy with $$ when it&apos;s smarter
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Offer and seat tracking, plus a cash fare watch — so you never
              burn points on a route where the paid ticket was the better buy.
            </p>
            <div className="mt-5 space-y-3">
              {fares.map((fare) => (
                <div
                  className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4"
                  key={fare.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{fare.routeLabel}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {fare.airline} · {fare.travelWindow}
                      </p>
                    </div>
                    <p className="text-lg font-bold">
                      {money.format(fare.priceAud)}
                    </p>
                  </div>
                  {fare.note ? (
                    <p className="mt-2 text-sm text-[var(--good)]">{fare.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-[var(--line)] bg-[var(--panel)]/60 py-16">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">Start in about three minutes</h2>
            <p className="section-lead mx-auto">
              Set up once. Let FareAtlas watch offers and seats for you.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <article className="card p-5" key={step.n}>
                <span className="grid size-10 place-items-center rounded-full bg-[var(--accent)] font-display text-sm font-bold text-[#0b0d10]">
                  {step.n}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="container-wide py-16" id="pricing">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Start free. Go Premium when ready.</h2>
          <p className="section-lead mx-auto">
            Browse offers free forever. Upgrade later for every cabin, longer
            award windows and unlimited alerts.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          <PricingCard plan={PRICING.free} highlighted={false} />
          <PricingCard plan={PRICING.premium} highlighted />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-wide pb-20">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--line-strong)] bg-[var(--panel)] px-6 py-12 text-center shadow-[var(--shadow)] sm:px-10">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48"
            style={{
              background:
                "radial-gradient(620px 180px at 50% 0%, rgba(201, 169, 97, 0.18), transparent 70%)",
            }}
          />
          <h2 className="relative font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop leaving points on the table
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Join FareAtlas free — track boosts, hunt award seats, and compare
            cash so every trip decision is sharper.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link className="btn btn-accent" href="/offers">
              Start free
            </Link>
            <Link className="btn btn-secondary" href="/flights">
              Search flights
            </Link>
          </div>
          <p className="relative mt-4 text-xs text-[var(--muted)]">
            Free to start. No credit card. Premium waitlist open.
          </p>
        </div>
      </section>
    </main>
  );
}

function PricingCard({
  plan,
  highlighted,
}: {
  plan: (typeof PRICING)[keyof typeof PRICING];
  highlighted: boolean;
}) {
  return (
    // The highlighted plan used to invert to a dark slab on a light page. That
    // trick has nowhere to go on obsidian, so emphasis comes from a champagne
    // hairline and wash instead — and every text colour stays a single token.
    <article
      className={`card relative overflow-hidden p-6 ${
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
      <p className="relative mt-2 font-display text-3xl font-semibold tracking-tight">
        {plan.price}
      </p>
      <p className="relative mt-1 text-sm text-[var(--muted)]">{plan.period}</p>
      <ul className="relative mt-6 space-y-2.5 text-sm">
        {plan.includes.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="text-[var(--good)]">✓</span>
            <span className="text-[var(--ink-soft)]">{item}</span>
          </li>
        ))}
        {"locked" in plan
          ? plan.locked.map((item) => (
              <li className="flex gap-2 text-[var(--muted)]" key={item}>
                <span>○</span>
                <span>{item}</span>
              </li>
            ))
          : null}
      </ul>
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

function FeatureIcon({ name }: { name: string }) {
  const common = "size-5";
  switch (name) {
    case "plane":
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
    case "cash":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <rect
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
            width="18"
            x="3"
            y="5"
          />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "bell":
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
    case "grid":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "chart":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    default:
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path
            d="M12 3l2.2 6.6H21l-5.4 3.9 2.1 6.5L12 16.8 6.3 20l2.1-6.5L3 9.6h6.8L12 3z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      );
  }
}
