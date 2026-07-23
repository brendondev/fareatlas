import Link from "next/link";
import { SITE } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  const f = dict.footer;
  return (
    // Footer recedes to a slightly cooler shade than the page (--background-deep
    // is a hair darker than --base) so it reads as an anchor without stealing
    // attention from the last content section above it.
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--background-deep)] text-[var(--ink)]">
      <div className="container-wide grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-semibold">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            {dict.common.siteDescription}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">{f.product}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link className="hover:text-[var(--ink)]" href="/offers">
              {f.offers}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/flights">
              {f.flights}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/marketplace">
              {f.marketplace}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/partners">
              {f.partners}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/wine">
              {f.wine}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/gift-cards">
              {f.giftCards}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/cards">
              {f.cards}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/guides">
              {f.guides}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/perks">
              {f.premiumPerks}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/pricing">
              {f.pricing}
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">{f.company}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link className="hover:text-[var(--ink)]" href="/contact">
              {f.contact}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/privacy">
              {f.privacy}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/terms">
              {f.terms}
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">
            {f.auFirstHeading}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {f.auFirstBody}
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="container-wide space-y-3 py-5 text-xs text-[var(--muted)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {SITE.name}. {f.rights}
            </p>
            <p>{f.dataLine}</p>
          </div>
          <p className="max-w-3xl leading-relaxed">{f.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
