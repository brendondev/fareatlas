export const SITE = {
  name: "FareAtlas",
  tagline: "Points and cash. One clear decision.",
  description:
    "Track Australian loyalty offers, award seat availability, and cash fares — so you know when to burn points and when to pay dollars.",
  locale: "en-AU",
} as const;

/**
 * TODO(brendon): every value here is a placeholder and must be replaced with
 * real business details before launch. `contactEmail` is rendered on /contact
 * and in the legal pages — if it does not resolve to a real inbox, enquiries
 * bounce silently and the privacy policy names a channel that does not exist.
 */
export const LEGAL = {
  contactEmail: "hello@fareatlas.example",
  entity: "FareAtlas",
  lastUpdated: "17 July 2026",
} as const;

export const FEATURES = [
  {
    title: "Points earn opportunities",
    body: "Curated Qantas, Velocity, Everyday Rewards and Flybuys boosts — updated daily so you stop missing the good ones.",
    icon: "spark",
  },
  {
    title: "Award seat search",
    body: "Search Economy through First across major mileage programs powered by Seats.aero — with booking links when seats open.",
    icon: "plane",
  },
  {
    title: "Cash fare watch",
    body: "See paid fares next to points costs. FareAtlas is built for Australians who want both options — not points-only FOMO.",
    icon: "cash",
  },
  {
    title: "Alerts you control",
    body: "Pick routes, cabins and date windows. Get notified when award inventory or a hot offer appears — without refreshing five tabs.",
    icon: "bell",
  },
  {
    title: "Four programs, one panel",
    body: "Stop hopping between Qantas, Velocity, Everyday and Flybuys. One dashboard for earn and burn.",
    icon: "grid",
  },
  {
    title: "Value, not vanity points",
    body: "Compare cents-per-point style decisions against cash prices so every redemption actually makes sense.",
    icon: "chart",
  },
] as const;

export const CABINS = [
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
    body: "The dream cabin. We watch 24/7 so you don’t miss the seats that disappear first.",
  },
  {
    code: "F",
    name: "First",
    body: "Rare inventory, high stakes. Premium members get the full search window and alerts.",
  },
] as const;

export const STEPS = [
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
] as const;

export const PRICING = {
  free: {
    name: "Free",
    price: "$0",
    period: "Forever free — no card",
    cta: "Start free",
    href: "/offers",
    includes: [
      "All Qantas, Velocity, Everyday & Flybuys offers",
      "Marketplace, wine and gift-card style boosts",
      "Award seat search in Economy (next 90 days)",
      "Cash fare watchlist samples",
      "Starter points guides",
    ],
    locked: [
      "Premium Economy, Business & First award search",
      "Full 12-month award window",
      "Unlimited custom flight alerts (email)",
      "Expert guides & priority routes",
    ],
  },
  premium: {
    name: "Premium",
    price: "Coming soon",
    period: "Every seat, every alert, every guide",
    cta: "Join waitlist",
    href: "/pricing#waitlist",
    includes: [
      "Everything in Free",
      "All cabins — Economy through First",
      "Full 12-month award search window",
      "Unlimited route & cabin alerts",
      "Cash vs points decision helpers",
      "Priority for new programs and tools",
    ],
    locked: [] as string[],
  },
} as const;

export const RECENT_AWARDS = [
  {
    from: "SYD",
    to: "SCL",
    cabin: "Business",
    program: "Qantas",
    seats: 2,
    points: "108,000",
    ago: "Just now",
  },
  {
    from: "MEL",
    to: "SCL",
    cabin: "Prem. Economy",
    program: "Qantas",
    seats: 4,
    points: "82,000",
    ago: "5 min ago",
  },
  {
    from: "SYD",
    to: "LAX",
    cabin: "Economy",
    program: "Qantas",
    seats: 8,
    points: "45,000",
    ago: "12 min ago",
  },
] as const;
