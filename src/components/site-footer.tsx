import Link from "next/link";
import { SITE } from "@/lib/content";

export function SiteFooter() {
  return (
    // Was a navy slab on a cream page. On obsidian that reads as a *lighter*
    // block at the bottom, so the footer now recedes to the base colour and is
    // separated by a hairline instead of by contrast.
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--background-deep)] text-[var(--ink)]">
      <div className="container-wide grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-semibold">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            {SITE.description}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Product</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link className="hover:text-[var(--ink)]" href="/offers">
              Offers
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/flights">
              Flights
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/wine">
              Wine
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/gift-cards">
              Gift cards
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/cards">
              Cards &amp; perks
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/guides">
              Guides
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/pricing">
              Pricing
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Company</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link className="hover:text-[var(--ink)]" href="/contact">
              Contact
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-[var(--ink)]" href="/terms">
              Terms
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">
            Australia-first
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Built for Qantas, Velocity, Everyday Rewards and Flybuys — with cash
            fares so you never burn points when dollars are smarter.
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="container-wide space-y-3 py-5 text-xs text-[var(--muted)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
            <p>Award data via Seats.aero · Cash comparison coming via Amadeus</p>
          </div>
          <p className="max-w-3xl leading-relaxed">
            Not affiliated with or endorsed by Qantas, Virgin Australia,
            Everyday Rewards, Flybuys or any airline or loyalty program. Trade
            marks belong to their owners. Points prices and seat availability
            change without notice — always confirm with the program before you
            book or transfer.
          </p>
        </div>
      </div>
    </footer>
  );
}
