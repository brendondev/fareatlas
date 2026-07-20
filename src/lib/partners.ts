import type { ProgramSlug } from "./programs";

/**
 * Publicly-known partner brands for each AU loyalty program.
 *
 * NOT a claim of FareAtlas partnership — the site footer disclaims any
 * affiliation with the four programs, and the /partners page repeats that
 * disclaimer up top. This is an educational directory of "where each program
 * earns points" so a new member can see the breadth before joining.
 *
 * Curated from each program's public partner lists as of mid-2026. Kept
 * intentionally short (a dozen or so per program) rather than exhaustive:
 * the exhaustive list is the program's own site, which we link out to. The
 * goal here is recognition, not enumeration.
 *
 * Verticals collapse into five buckets so the UI can render a consistent
 * shape across programs — the source lists are much messier.
 */

export type PartnerVertical =
  | "Retail"
  | "Dining"
  | "Fuel"
  | "Travel"
  | "Financial";

export type PartnerBrand = {
  name: string;
  vertical: PartnerVertical;
};

export type ProgramPartners = {
  programSlug: ProgramSlug;
  partnersUrl: string;
  brands: PartnerBrand[];
};

export const PARTNERS: ProgramPartners[] = [
  {
    programSlug: "qantas",
    partnersUrl: "https://www.qantas.com/au/en/frequent-flyer/earn-points.html",
    brands: [
      { name: "David Jones", vertical: "Retail" },
      { name: "Bloom", vertical: "Retail" },
      { name: "Officeworks", vertical: "Retail" },
      { name: "BP", vertical: "Fuel" },
      { name: "Ampol AmpolCard", vertical: "Fuel" },
      { name: "Uber", vertical: "Travel" },
      { name: "Hertz", vertical: "Travel" },
      { name: "Airbnb", vertical: "Travel" },
      { name: "Accor Hotels", vertical: "Travel" },
      { name: "OpenTable", vertical: "Dining" },
      { name: "Qantas Wine", vertical: "Dining" },
      { name: "AMEX / NAB / ANZ Qantas cards", vertical: "Financial" },
      { name: "Qantas Insurance", vertical: "Financial" },
    ],
  },
  {
    programSlug: "velocity",
    partnersUrl:
      "https://experience.velocityfrequentflyer.com/earn-points/partners",
    brands: [
      { name: "Coles Supermarkets", vertical: "Retail" },
      { name: "myer", vertical: "Retail" },
      { name: "Boost Juice", vertical: "Dining" },
      { name: "Deliveroo", vertical: "Dining" },
      { name: "Virgin Wines", vertical: "Dining" },
      { name: "BP (via Coles Express)", vertical: "Fuel" },
      { name: "Hertz", vertical: "Travel" },
      { name: "Europcar", vertical: "Travel" },
      { name: "Marriott Bonvoy", vertical: "Travel" },
      { name: "Booking.com", vertical: "Travel" },
      { name: "AMEX / Westpac / ANZ Velocity cards", vertical: "Financial" },
      { name: "Virgin Money", vertical: "Financial" },
    ],
  },
  {
    programSlug: "everyday",
    partnersUrl: "https://www.everyday.com.au/",
    brands: [
      { name: "Woolworths", vertical: "Retail" },
      { name: "BWS", vertical: "Retail" },
      { name: "Big W", vertical: "Retail" },
      { name: "Dan Murphy's", vertical: "Retail" },
      { name: "Healthy Life", vertical: "Retail" },
      { name: "Ampol", vertical: "Fuel" },
      { name: "EG Ampol", vertical: "Fuel" },
      { name: "Everyday Insurance", vertical: "Financial" },
      { name: "Everyday Extra membership", vertical: "Financial" },
      { name: "Qantas Frequent Flyer (points conversion)", vertical: "Travel" },
    ],
  },
  {
    programSlug: "flybuys",
    partnersUrl: "https://www.flybuys.com.au/collect-points",
    brands: [
      { name: "Coles", vertical: "Retail" },
      { name: "Kmart", vertical: "Retail" },
      { name: "Target", vertical: "Retail" },
      { name: "Officeworks", vertical: "Retail" },
      { name: "Liquorland", vertical: "Retail" },
      { name: "First Choice Liquor", vertical: "Retail" },
      { name: "Shell Coles Express", vertical: "Fuel" },
      { name: "Bunnings (via Flybuys Rewards catalogue)", vertical: "Retail" },
      { name: "Coles Insurance", vertical: "Financial" },
      { name: "Velocity Frequent Flyer (points conversion)", vertical: "Travel" },
    ],
  },
];

export const PARTNER_VERTICALS: PartnerVertical[] = [
  "Retail",
  "Dining",
  "Fuel",
  "Travel",
  "Financial",
];
