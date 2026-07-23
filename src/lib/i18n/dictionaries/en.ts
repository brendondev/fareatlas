import type { Dictionary } from "../index";

/** English — mirrors pt.ts exactly (enforced by `satisfies Dictionary`). */
export const en = {
  nav: {
    earn: "Earn",
    earnItems: {
      offers: { label: "Offers", hint: "Bonus point promotions" },
      wine: { label: "Wine", hint: "Ranked by cost per 1,000 points" },
      giftCards: { label: "Gift cards", hint: "Best points per dollar" },
      cards: { label: "Cards & perks", hint: "Sign-up bonuses" },
    },
    flights: "Flights",
    alerts: "Alerts",
    marketplace: "Marketplace",
    partners: "Partners",
    perks: "Perks",
    guides: "Guides",
    pricing: "Pricing",
  },
  header: {
    tagline: "Points · cash · awards",
    searchSeats: "Search seats",
    browseOffers: "Browse offers",
    account: "Account",
    signIn: "Sign in",
    getStarted: "Get started",
    searchAwardSeats: "Search award seats",
    menu: "Menu",
    language: "Language",
  },
  footer: {
    product: "Product",
    company: "Company",
    offers: "Offers",
    flights: "Flights",
    marketplace: "Marketplace",
    partners: "Partners",
    wine: "Wine",
    giftCards: "Gift cards",
    cards: "Cards & perks",
    guides: "Guides",
    premiumPerks: "Premium perks",
    pricing: "Pricing",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    auFirstHeading: "Australia-first",
    auFirstBody:
      "Built for Qantas, Velocity, Everyday Rewards and Flybuys — with cash fares so you never burn points when dollars are smarter.",
    rights: "All rights reserved.",
    dataLine: "Award data via Seats.aero · Cash comparison coming via Amadeus",
    disclaimer:
      "Not affiliated with or endorsed by Qantas, Virgin Australia, Everyday Rewards, Flybuys or any airline or loyalty program. Trade marks belong to their owners. Points prices and seat availability change without notice — always confirm with the program before you book or transfer.",
  },
} as const satisfies Dictionary;
