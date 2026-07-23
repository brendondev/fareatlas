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
  common: {
    siteDescription:
      "Track Australian loyalty offers, award seat availability, and cash fares — so you know when to burn points and when to pay dollars.",
  },
  plans: {
    free: {
      tier: "free",
      name: "Free",
      periodHint: "Forever free — no card",
      includes: [
        "All Qantas, Velocity, Everyday & Flybuys offers",
        "Marketplace, wine and gift-card style boosts",
        "Award seat search in Economy (next 90 days)",
        "Up to 3 watched routes, flagged in-app",
        "Cash fare comparison beside the points",
      ],
      locked: [
        "Premium Economy, Business & First award search",
        "Full 12-month award window",
        "Route alerts by email",
        "More watched routes",
      ],
    },
    premium: {
      tier: "premium",
      name: "Premium",
      periodHint: "Every cabin, the full year",
      includes: [
        "Everything in Free",
        "All cabins — Economy through First",
        "Full 12-month award search window",
        "Email alerts on up to 15 watched routes",
        "Cash vs points decision helpers",
      ],
      locked: [
        "Unlimited watched routes",
        "Priority alerts that check twice as often",
      ],
    },
    pro: {
      tier: "pro",
      name: "Pro",
      periodHint: "For the serious points chaser",
      includes: [
        "Everything in Premium",
        "Unlimited watched routes",
        "Priority alerts — routes re-checked every 15 min",
        "Shorter alert cooldown, so you hear sooner",
        "First access to new programs and tools",
      ],
      locked: [],
    },
  },
  home: {
    hero: {
      badge: "Australia-first · Points + cash",
      titleLead: "Points and reward flights —",
      titleAccent: "all in one place.",
      leadA: "Unlike points-only apps, FareAtlas also tracks",
      leadCash: "cash fares",
      leadB: "so you know when dollars beat points.",
      ctaPrimary: "Start earning smarter",
      ctaSecondary: "Search award seats",
      trust1: "Free to start",
      trust2: "Cancel anytime",
      trust3: "4 AU programs, one app",
      previewOffers: "Offers",
      previewFlights: "Flights",
      previewLive: "Live preview",
      featured: "Featured",
      cashAlternative: "Cash alternative",
    },
    programsEyebrow: "Australia's core loyalty programs",
    programsTitle: "All your programs, one dashboard",
    programsLead:
      "Stop checking four sites. Follow the programs you use and act when value appears — earn boosts or award seats.",
    featuresTitle: "Everything you need to maximise points and flights",
    featuresLead:
      "One membership path for offers, award alerts tuned to your travel windows, and cash comparisons when points are not the win.",
    features: [
      {
        icon: "spark",
        title: "Points earn opportunities",
        body: "Curated Qantas, Velocity, Everyday Rewards and Flybuys boosts — updated daily so you stop missing the good ones.",
      },
      {
        icon: "plane",
        title: "Award seat search",
        body: "Search Economy through First across major mileage programs powered by Seats.aero — with booking links when seats open.",
      },
      {
        icon: "cash",
        title: "Cash fare watch",
        body: "See paid fares next to points costs. FareAtlas is built for Australians who want both options — not points-only FOMO.",
      },
      {
        icon: "bell",
        title: "Alerts you control",
        body: "Pick routes, cabins and date windows. Get notified when award inventory or a hot offer appears — without refreshing five tabs.",
      },
      {
        icon: "grid",
        title: "Four programs, one panel",
        body: "Stop hopping between Qantas, Velocity, Everyday and Flybuys. One dashboard for earn and burn.",
      },
      {
        icon: "chart",
        title: "Value, not vanity points",
        body: "Compare cents-per-point style decisions against cash prices so every redemption actually makes sense.",
      },
    ],
    offersTitle: "Today's points opportunities",
    offersLead:
      "Fresh earn boosts across Qantas, Velocity, Everyday Rewards and Flybuys.",
    offersCta: "View all offers",
    awardTitle: "Never miss an award seat",
    awardLead:
      "Monitor Economy through First. FareAtlas pairs award inventory with cash alternatives so you redeem with intent.",
    cabinsSearchEyebrow: "Search live Seats.aero inventory",
    cabinsSearchBody:
      "Economy is free forever. Premium Economy, Business and First come with Premium.",
    awardCta: "Open award search",
    cabins: [
      {
        code: "Y",
        name: "Economy",
        body: "Smart alerts for the most available cabin — ideal for families and frequent short-haul trips.",
      },
      {
        code: "W",
        name: "Premium Economy",
        body: "The sweet spot between value and comfort. Catch upgrade-worthy inventory early.",
      },
      {
        code: "J",
        name: "Business",
        body: "The dream cabin. We watch 24/7 so you don't miss the seats that disappear first.",
      },
      {
        code: "F",
        name: "First",
        body: "Rare inventory, high stakes. Premium members get the full search window and alerts.",
      },
    ],
    edgeBadge: "FareAtlas edge",
    edgeTitle: "Buy with $$ when it's smarter",
    edgeLead:
      "Offer and seat tracking, plus a cash fare watch — so you never burn points on a route where the paid ticket was the better buy.",
    stepsTitle: "Start in about three minutes",
    stepsLead: "Set up once. Let FareAtlas watch offers and seats for you.",
    steps: [
      {
        n: "1",
        title: "Browse free",
        body: "Explore offers and Economy award windows immediately — no card required.",
      },
      {
        n: "2",
        title: "Follow programs & routes",
        body: "Pick the loyalty programs you use and the city pairs you actually fly.",
      },
      {
        n: "3",
        title: "Act on alerts",
        body: "We watch offers and award seats so you can redeem or buy cash with confidence.",
      },
    ],
    pricingTeaserTitle: "Start free. Upgrade when ready.",
    pricingTeaserLead:
      "Browse offers free forever. Premium opens every cabin, the full award window and email alerts; Pro adds unlimited routes and priority alerts.",
    pricingTeaserCta: "See full pricing",
    finalTitle: "Stop leaving points on the table",
    finalLead:
      "Join FareAtlas free — track boosts, hunt award seats, and compare cash so every trip decision is sharper.",
    finalCtaPrimary: "Start free",
    finalCtaSecondary: "Search flights",
    finalNote: "Free to start. No credit card.",
  },
} satisfies Dictionary;
