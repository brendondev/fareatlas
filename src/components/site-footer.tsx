import Link from "next/link";
import { SITE } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";

export function SiteFooter({ dict }: { dict: Dictionary["footer"] }) {
  return (
    // Footer recedes to a slightly cooler shade than the page (--background-deep
    // is a hair darker than --base) so it reads as an anchor without stealing
    // attention from the last content section above it.
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--background-deep)] text-[var(--ink)]">
      <div className="container-wide grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-semibold">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            {SITE.description}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">{dict.product}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link className="hover:text-[var(--ink)]" href="/offers">
              {dict.offers}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/flights">
              {dict.flights}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/marketplace">
              {dict.marketplace}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/partners">
              {dict.partners}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/wine">
              {dict.wine}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/gift-cards">
              {dict.giftCards}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/cards">
              {dict.cards}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/guides">
              {dict.guides}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/perks">
              {dict.premiumPerks}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/pricing">
              {dict.pricing}
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">{dict.company}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link className="hover:text-[var(--ink)]" href="/contact">
              {dict.contact}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/privacy">
              {dict.privacy}
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/terms">
              {dict.terms}
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">
            {dict.auFirstHeading}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {dict.auFirstBody}
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="container-wide space-y-3 py-5 text-xs text-[var(--muted)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {SITE.name}. {dict.rights}
            </p>
            <p>{dict.dataLine}</p>
          </div>
          <p className="max-w-3xl leading-relaxed">{dict.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
