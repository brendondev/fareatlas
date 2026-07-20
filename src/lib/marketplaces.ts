import type { ProgramSlug } from "./programs";

/**
 * The four official points-earning marketplaces run by each AU loyalty
 * program. Distinct from `/offers` (curated bonuses) and `/cards` (sign-up
 * bonuses) — these are ongoing shopping portals where every purchase earns
 * baseline points, plus periodic multipliers.
 *
 * Kept as a pure data module rather than a Prisma model: these four are
 * effectively immutable (they don't churn like offers do), and hard-coding
 * makes the /marketplace page render synchronously without a DB round-trip.
 */

export type Marketplace = {
  programSlug: ProgramSlug;
  name: string;
  url: string;
  tagline: string;
  /** Categories where the marketplace earns points beyond the flat rate. */
  categories: string[];
  /** Baseline earn rate for context, "per $1 spent". Copy, not maths. */
  baseEarn: string;
};

export const MARKETPLACES: Marketplace[] = [
  {
    programSlug: "qantas",
    name: "Qantas Marketplace",
    url: "https://marketplace.qantas.com",
    tagline:
      "Shop major retailers via Qantas and earn Qantas Points on every dollar — often stacked with a bonus rate.",
    categories: [
      "Electronics",
      "Fashion",
      "Homewares",
      "Wine",
      "Gift cards",
      "Travel & hotels",
    ],
    baseEarn: "1 pt / $1 baseline · frequent 5x–20x bonuses",
  },
  {
    programSlug: "velocity",
    name: "Velocity Store",
    url: "https://store.velocityfrequentflyer.com",
    tagline:
      "Velocity's shopping and rewards portal — earn Velocity Points on brand-name goods without a Virgin flight in sight.",
    categories: [
      "Homewares",
      "Fashion",
      "Beauty",
      "Toys",
      "Gift cards",
      "Wine",
    ],
    baseEarn: "1 pt / $1 baseline · rotating category bonuses",
  },
  {
    programSlug: "everyday",
    name: "Everyday Rewards Shopping",
    url: "https://everyday.com.au/rewards",
    tagline:
      "Woolworths, BWS, Big W and partner brands. Boosters trigger 10x–20x rates on nominated items each week.",
    categories: [
      "Groceries",
      "Liquor",
      "Big W",
      "Ampol fuel",
      "Selected partners",
    ],
    baseEarn: "1 pt / $1 baseline · weekly Boosters up to 20x",
  },
  {
    programSlug: "flybuys",
    name: "Flybuys Marketplace",
    url: "https://www.flybuys.com.au",
    tagline:
      "Coles Group's shopping portal. Regular multi-thousand-point offers on target categories at Coles, Liquorland and First Choice.",
    categories: [
      "Groceries",
      "Liquor",
      "Kmart",
      "Target",
      "Officeworks",
      "Insurance",
    ],
    baseEarn: "1 pt / $2 baseline · targeted bonus offers weekly",
  },
];
