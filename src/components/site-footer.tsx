import Link from "next/link";
import { SITE } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[#171f2f] text-white">
      <div className="container-wide grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="text-lg font-bold">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
            {SITE.description}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">Product</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/65">
            <Link className="hover:text-white" href="/offers">
              Offers
            </Link>
            <Link className="hover:text-white" href="/flights">
              Flights
            </Link>
            <Link className="hover:text-white" href="/pricing">
              Pricing
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">Australia-first</p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Built for Qantas, Velocity, Everyday Rewards and Flybuys — with cash
            fares so you never burn points when dollars are smarter.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Award data via Seats.aero · Cash comparison coming via Amadeus</p>
        </div>
      </div>
    </footer>
  );
}
