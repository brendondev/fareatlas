import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/dal";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Premium perks",
  description:
    "What FareAtlas Premium unlocks — every cabin from Economy through First, the full 12-month award window, alerts on every route and priority for new tools.",
};

export const dynamic = "force-dynamic";

// Icons for the three hero perks, in the order the dictionary lists them.
const HERO_ICONS = ["cabins", "window", "alerts"] as const;

export default async function PerksPage() {
  const [viewer, dict] = await Promise.all([getViewer(), getDictionary()]);
  const t = dict.perks;
  const premium = dict.plans.premium;
  const isPaid = viewer.tier !== "free";
  const planLabel = viewer.tier === "pro" ? "Pro" : "Premium";

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <span className="pill text-[var(--accent)]">{t.pill}</span>
        <h1 className="section-title mt-4">{t.title}</h1>
        <p className="section-lead">{t.lead}</p>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {t.heroPerks.map((perk, i) => (
          <article className="card p-6" key={perk.title}>
            <div className="grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <PerkIcon name={HERO_ICONS[i]!} />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-[var(--ink)]">
              {perk.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {perk.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {t.everythingHeading}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
            {premium.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{premium.periodHint}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {premium.includes.map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <span
                  aria-hidden
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
                >
                  ✓
                </span>
                <span className="text-[var(--ink-soft)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="card p-6 sm:p-8">
          {isPaid ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--good)]">
                {t.yourAccount}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
                {t.youreOnTemplate.replace("{plan}", planLabel)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {viewer.tier === "pro" ? t.activePro : t.activePremium}
              </p>
              <Link className="btn btn-accent mt-6 w-full" href="/flights">
                {t.openSearch}
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                {t.getStarted}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
                {t.pickPlan}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {t.pickPlanBody}
              </p>
              <Link className="btn btn-accent mt-6 w-full" href="/pricing">
                {t.seePlans}
              </Link>
              <p className="mt-4 text-center text-xs text-[var(--muted)]">
                {t.startFreeNote}
              </p>
            </>
          )}
        </aside>
      </section>

      <section className="mt-14">
        <h2 className="section-title text-2xl">{t.whyUpgrade}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {t.useCases.map((useCase) => (
            <UseCase body={useCase.body} key={useCase.title} title={useCase.title} />
          ))}
        </div>
      </section>

      <p className="mt-12 text-xs leading-relaxed text-[var(--muted)]">
        {t.footerNote}
      </p>
    </main>
  );
}

function UseCase({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-5">
      <h3 className="font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
    </article>
  );
}

function PerkIcon({ name }: { name: string }) {
  const common = "size-5";
  switch (name) {
    case "cabins":
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
    case "window":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <rect
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
            width="18"
            x="3"
            y="4"
          />
          <path d="M3 9h18M8 4v3M16 4v3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "alerts":
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
    default:
      return null;
  }
}
