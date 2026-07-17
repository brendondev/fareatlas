import type { Metadata } from "next";
import { OffersBrowser } from "@/components/offers-browser";
import { getOffers } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Points offers",
  description:
    "Browse Qantas, Velocity, Everyday Rewards and Flybuys earn opportunities in one place.",
};

export default async function OffersPage() {
  const { offers, source } = await getOffers({ take: 48 });

  return (
    <main className="container-wide py-10 sm:py-14">
      <div className="max-w-2xl">
        <span className="pill bg-white text-[var(--accent)] ring-1 ring-[var(--line)]">
          Daily earn watch
        </span>
        <h1 className="section-title mt-4">Points opportunities</h1>
        <p className="section-lead">
          Marketplace boosts, grocery doubles, flight bonuses and gift-card rates
          across Australia&apos;s big four — updated as we curate them in Neon.
        </p>
      </div>

      <div className="mt-10">
        <OffersBrowser offers={offers} source={source} />
      </div>
    </main>
  );
}
