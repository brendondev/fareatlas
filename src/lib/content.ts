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

/**
 * The three plans, as feature lists. Prices are NOT here on purpose: the amount
 * charged is whatever the Stripe price says, and /pricing renders it live from
 * Stripe so the page can never advertise a number the checkout won't honour.
 * `periodHint` is display copy only. `tier` ties a card to lib/entitlements and
 * (for paid tiers) to the Stripe price env vars via lib/billing/plans.
 */
export const PRICING = {
  free: {
    tier: "free",
    name: "Free",
    periodHint: "Forever free — no card",
    highlighted: false,
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
    highlighted: true,
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
    highlighted: false,
    includes: [
      "Everything in Premium",
      "Unlimited watched routes",
      "Priority alerts — routes re-checked every 15 min",
      "Shorter alert cooldown, so you hear sooner",
      "First access to new programs and tools",
    ],
    locked: [] as string[],
  },
} as const;

/*
 * RECENT_AWARDS used to live here: three hardcoded routes rendered on /flights
 * with "Just now" / "5 min ago" timestamps.
 *
 * That was not a mock — it was a claim about the product's activity, shown to
 * users as real. FareAtlas is Australia-first, so the ACCC is the regulator and
 * ACL s.18 (misleading or deceptive conduct) is live exposure. For a product
 * whose whole pitch is an honest points-vs-cash comparison it was also a
 * positioning own-goal.
 *
 * If social proof belongs on /flights, it should be built from real rows in
 * AwardSearchCache, which already stores payloads and a dayKey. Until then,
 * nothing.
 *
 * Note also what is NOT in the Premium list above: SMS alerts. There is no
 * Twilio account, no dependency and no plan for one. Email alerts sit under
 * free.locked because nothing reads AwardWatch and sends anything yet — which
 * is why Premium still says "Coming soon" rather than taking money.
 */
