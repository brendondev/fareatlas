import { isDatabaseConfigured, prisma } from "./db";
import { programBySlug, type ProgramSlug } from "./programs";

/**
 * Wine, gift-card and card verticals. Mirrors offers.ts exactly: a
 * `source: "neon" | "fallback"` discriminator, in-memory fallbacks, and never
 * throws — falls back on missing DB, empty result, and thrown error alike.
 *
 * Ranking metrics are computed here, never stored. They're pure functions of
 * columns the editor already maintains; a persisted copy just drifts.
 */

type ProgramStamp = {
  programSlug: string;
  programName: string;
  programColor: string;
  shortCode: string;
};

export type WineDealView = ProgramStamp & {
  id: string;
  title: string;
  vendor: string;
  bonusPoints: number;
  priceAud: number;
  bottles: number | null;
  url: string | null;
  /** (priceAud / bonusPoints) × 1000. Lower is better. */
  costPer1000: number | null;
  /** priceAud / bottles, when bottle count is known. */
  pricePerBottle: number | null;
};

export type GiftCardRateView = ProgramStamp & {
  id: string;
  retailer: string;
  channel: string;
  pointsPerDollar: number;
  minSpendAud: number | null;
  capAud: number | null;
  url: string | null;
};

export type CardOfferView = {
  id: string;
  programSlug: string | null;
  programName: string | null;
  programColor: string | null;
  shortCode: string | null;
  issuer: string;
  cardName: string;
  bonusPoints: number;
  minSpendAud: number | null;
  spendWindowDays: number | null;
  annualFeeAud: number | null;
  feeFirstYearAud: number | null;
  eligibility: string | null;
  url: string | null;
  /** feeFirstYear / bonusPoints × 1000 — same axis as wine's costPer1000. */
  feePer1000Bonus: number | null;
};

// --- metrics (pure) ---

export function costPer1000(d: {
  priceAud: number;
  bonusPoints: number;
}): number | null {
  if (!d.bonusPoints || d.bonusPoints <= 0) return null;
  return (d.priceAud / d.bonusPoints) * 1000;
}

export function feePer1000Bonus(d: {
  feeFirstYearAud: number | null;
  bonusPoints: number;
}): number | null {
  if (d.feeFirstYearAud === null || !d.bonusPoints || d.bonusPoints <= 0) {
    return null;
  }
  return (d.feeFirstYearAud / d.bonusPoints) * 1000;
}

// --- fallbacks (used when Neon is absent or empty) ---

function stamp(slug: ProgramSlug): ProgramStamp {
  const meta = programBySlug(slug)!;
  return {
    programSlug: meta.slug,
    programName: meta.name,
    programColor: meta.color,
    shortCode: meta.shortCode,
  };
}

const FALLBACK_WINE: Array<Omit<WineDealView, "costPer1000" | "pricePerBottle">> =
  [
    {
      id: "wine-1",
      ...stamp("qantas"),
      title: "12-bottle mixed dozen + bonus points",
      vendor: "Qantas Wine",
      bonusPoints: 6000,
      priceAud: 189,
      bottles: 12,
      url: null,
    },
    {
      id: "wine-2",
      ...stamp("velocity"),
      title: "Premium reds six-pack",
      vendor: "Virgin Wine",
      bonusPoints: 4000,
      priceAud: 149,
      bottles: 6,
      url: null,
    },
    {
      id: "wine-3",
      ...stamp("qantas"),
      title: "Champagne case bonus offer",
      vendor: "Qantas Wine",
      bonusPoints: 15000,
      priceAud: 499,
      bottles: 12,
      url: null,
    },
  ];

const FALLBACK_GIFT_CARDS: GiftCardRateView[] = [
  {
    id: "gc-1",
    ...stamp("qantas"),
    retailer: "Woolworths",
    channel: "Qantas Marketplace",
    pointsPerDollar: 3,
    minSpendAud: null,
    capAud: null,
    url: null,
  },
  {
    id: "gc-2",
    ...stamp("velocity"),
    retailer: "Coles Group & Myer",
    channel: "Velocity Store",
    pointsPerDollar: 2.5,
    minSpendAud: null,
    capAud: 5000,
    url: null,
  },
  {
    id: "gc-3",
    ...stamp("qantas"),
    retailer: "JB Hi-Fi",
    channel: "Qantas Marketplace",
    pointsPerDollar: 2,
    minSpendAud: 50,
    capAud: null,
    url: null,
  },
];

const FALLBACK_CARDS: Array<Omit<CardOfferView, "feePer1000Bonus">> = [
  {
    id: "card-1",
    ...stamp("qantas"),
    issuer: "Major Bank",
    cardName: "Qantas Premier Platinum",
    bonusPoints: 90000,
    minSpendAud: 4500,
    spendWindowDays: 90,
    annualFeeAud: 349,
    feeFirstYearAud: 175,
    eligibility: "New cardholders only",
    url: null,
  },
  {
    id: "card-2",
    ...stamp("velocity"),
    issuer: "Major Bank",
    cardName: "Velocity Rewards Signature",
    bonusPoints: 60000,
    minSpendAud: 3000,
    spendWindowDays: 90,
    annualFeeAud: 289,
    feeFirstYearAud: 0,
    eligibility: "No cards from this issuer in 18 months",
    url: null,
  },
];

// --- readers ---

export async function getWineDeals(
  take = 24,
): Promise<{ items: WineDealView[]; source: "neon" | "fallback" }> {
  const withMetrics = (
    items: Array<Omit<WineDealView, "costPer1000" | "pricePerBottle">>,
  ): WineDealView[] =>
    items
      .map((d) => ({
        ...d,
        costPer1000: costPer1000(d),
        pricePerBottle: d.bottles && d.bottles > 0 ? d.priceAud / d.bottles : null,
      }))
      .sort(
        (a, b) =>
          (a.costPer1000 ?? Infinity) - (b.costPer1000 ?? Infinity),
      );

  if (!isDatabaseConfigured()) {
    return { items: withMetrics(FALLBACK_WINE).slice(0, take), source: "fallback" };
  }

  try {
    const rows = await prisma.wineDeal.findMany({
      where: { status: "published" },
      include: { program: true },
      orderBy: { publishedAt: "desc" },
      take,
    });

    if (!rows.length) {
      return { items: withMetrics(FALLBACK_WINE).slice(0, take), source: "fallback" };
    }

    return {
      source: "neon",
      items: withMetrics(
        rows.map((row) => ({
          id: row.id,
          programSlug: row.program.slug,
          programName: row.program.name,
          programColor: row.program.color,
          shortCode: row.program.shortCode,
          title: row.title,
          vendor: row.vendor,
          bonusPoints: row.bonusPoints,
          priceAud: row.priceAud,
          bottles: row.bottles,
          url: row.url,
        })),
      ),
    };
  } catch (error) {
    console.error("[verticals] wine query failed", error);
    return { items: withMetrics(FALLBACK_WINE).slice(0, take), source: "fallback" };
  }
}

export async function getGiftCardRates(
  take = 24,
): Promise<{ items: GiftCardRateView[]; source: "neon" | "fallback" }> {
  const sortByRate = (items: GiftCardRateView[]) =>
    [...items].sort((a, b) => b.pointsPerDollar - a.pointsPerDollar);

  if (!isDatabaseConfigured()) {
    return { items: sortByRate(FALLBACK_GIFT_CARDS).slice(0, take), source: "fallback" };
  }

  try {
    const rows = await prisma.giftCardRate.findMany({
      where: { status: "published" },
      include: { program: true },
      orderBy: { pointsPerDollar: "desc" },
      take,
    });

    if (!rows.length) {
      return {
        items: sortByRate(FALLBACK_GIFT_CARDS).slice(0, take),
        source: "fallback",
      };
    }

    return {
      source: "neon",
      items: rows.map((row) => ({
        id: row.id,
        programSlug: row.program.slug,
        programName: row.program.name,
        programColor: row.program.color,
        shortCode: row.program.shortCode,
        retailer: row.retailer,
        channel: row.channel,
        pointsPerDollar: row.pointsPerDollar,
        minSpendAud: row.minSpendAud,
        capAud: row.capAud,
        url: row.url,
      })),
    };
  } catch (error) {
    console.error("[verticals] gift-card query failed", error);
    return {
      items: sortByRate(FALLBACK_GIFT_CARDS).slice(0, take),
      source: "fallback",
    };
  }
}

export async function getCardOffers(
  take = 24,
): Promise<{ items: CardOfferView[]; source: "neon" | "fallback" }> {
  const withMetrics = (
    items: Array<Omit<CardOfferView, "feePer1000Bonus">>,
  ): CardOfferView[] =>
    items
      .map((c) => ({ ...c, feePer1000Bonus: feePer1000Bonus(c) }))
      .sort((a, b) => b.bonusPoints - a.bonusPoints);

  if (!isDatabaseConfigured()) {
    return { items: withMetrics(FALLBACK_CARDS).slice(0, take), source: "fallback" };
  }

  try {
    const rows = await prisma.cardOffer.findMany({
      where: { status: "published" },
      include: { program: true },
      orderBy: { bonusPoints: "desc" },
      take,
    });

    if (!rows.length) {
      return { items: withMetrics(FALLBACK_CARDS).slice(0, take), source: "fallback" };
    }

    return {
      source: "neon",
      items: withMetrics(
        rows.map((row) => ({
          id: row.id,
          programSlug: row.program?.slug ?? null,
          programName: row.program?.name ?? null,
          programColor: row.program?.color ?? null,
          shortCode: row.program?.shortCode ?? null,
          issuer: row.issuer,
          cardName: row.cardName,
          bonusPoints: row.bonusPoints,
          minSpendAud: row.minSpendAud,
          spendWindowDays: row.spendWindowDays,
          annualFeeAud: row.annualFeeAud,
          feeFirstYearAud: row.feeFirstYearAud,
          eligibility: row.eligibility,
          url: row.url,
        })),
      ),
    };
  } catch (error) {
    console.error("[verticals] card query failed", error);
    return { items: withMetrics(FALLBACK_CARDS).slice(0, take), source: "fallback" };
  }
}
