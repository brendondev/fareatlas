import { isDatabaseConfigured, prisma } from "@/lib/db";
import { PROGRAMS, type ProgramSlug } from "@/lib/programs";

export type OfferView = {
  id: string;
  programSlug: ProgramSlug | string;
  programName: string;
  programColor: string;
  shortCode: string;
  title: string;
  summary: string;
  category: string;
  estimate: string | null;
  url: string | null;
  featured: boolean;
  expiresAt: Date | null;
  expiresLabel: string;
};

export type CashFareView = {
  id: string;
  origin: string;
  destination: string;
  routeLabel: string;
  airline: string;
  travelWindow: string;
  priceAud: number;
  note: string | null;
};

function daysFromNow(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function expiresLabel(date: Date | null): string {
  if (!date) return "Ongoing";
  const ms = date.getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expired";
  if (days <= 7) return "Expires soon";
  return `Expires ${date.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`;
}

/** Fallback content when Neon is not connected yet. */
const FALLBACK_OFFERS: OfferView[] = [
  {
    id: "mock-1",
    programSlug: "qantas",
    programName: "Qantas Points",
    programColor: "#E40000",
    shortCode: "QF",
    title: "10x Apple Gift Card on Qantas Marketplace",
    summary:
      "Boosted marketplace earn on selected Apple gift cards — strong value if you already shop there.",
    category: "marketplace",
    estimate: "Up to 10x points",
    url: null,
    featured: true,
    expiresAt: daysFromNow(12),
    expiresLabel: "Expires soon",
  },
  {
    id: "mock-2",
    programSlug: "velocity",
    programName: "Velocity",
    programColor: "#C8102E",
    shortCode: "VA",
    title: "Bonus Velocity Points on Virgin flights",
    summary:
      "Limited-time flight bonus for Velocity members on selected routes.",
    category: "travel",
    estimate: "2,000+ bonus points",
    url: null,
    featured: true,
    expiresAt: daysFromNow(30),
    expiresLabel: expiresLabel(daysFromNow(30)),
  },
  {
    id: "mock-3",
    programSlug: "everyday",
    programName: "Everyday Rewards",
    programColor: "#D50032",
    shortCode: "ER",
    title: "2,000 Everyday Rewards on a $50 shop",
    summary: "Weekly grocery boost — compare effective points per dollar.",
    category: "groceries",
    estimate: "2,000 points",
    url: null,
    featured: false,
    expiresAt: daysFromNow(8),
    expiresLabel: "Expires soon",
  },
  {
    id: "mock-4",
    programSlug: "flybuys",
    programName: "Flybuys",
    programColor: "#00A9E0",
    shortCode: "FB",
    title: "5,000 Flybuys points at Coles",
    summary: "Coles boost week with a spend threshold.",
    category: "groceries",
    estimate: "5,000 points",
    url: null,
    featured: true,
    expiresAt: daysFromNow(6),
    expiresLabel: "Expires soon",
  },
  {
    id: "mock-5",
    programSlug: "qantas",
    programName: "Qantas Points",
    programColor: "#E40000",
    shortCode: "QF",
    title: "Wine club bonus points",
    summary: "Qantas Wine ranked by cost per 1,000 bonus points.",
    category: "wine",
    estimate: "Best value wine earn",
    url: null,
    featured: false,
    expiresAt: daysFromNow(45),
    expiresLabel: expiresLabel(daysFromNow(45)),
  },
  {
    id: "mock-6",
    programSlug: "velocity",
    programName: "Velocity",
    programColor: "#C8102E",
    shortCode: "VA",
    title: "Gift card rate of the week",
    summary: "Highest points-per-dollar gift cards this week.",
    category: "shopping",
    estimate: "Top gift card rate",
    url: null,
    featured: false,
    expiresAt: daysFromNow(14),
    expiresLabel: expiresLabel(daysFromNow(14)),
  },
];

const FALLBACK_CASH: CashFareView[] = [
  {
    id: "cash-1",
    origin: "SYD",
    destination: "HND",
    routeLabel: "Sydney to Tokyo",
    airline: "ANA",
    travelWindow: "Sep–Oct",
    priceAud: 914,
    note: "22% below tracked average — strong cash alternative to premium awards.",
  },
  {
    id: "cash-2",
    origin: "MEL",
    destination: "SIN",
    routeLabel: "Melbourne to Singapore",
    airline: "Singapore Airlines",
    travelWindow: "Aug–Nov",
    priceAud: 788,
    note: "Good cash alternative when award taxes are high.",
  },
  {
    id: "cash-3",
    origin: "BNE",
    destination: "LAX",
    routeLabel: "Brisbane to Los Angeles",
    airline: "Fiji Airways",
    travelWindow: "Oct",
    priceAud: 1096,
    note: "Watchlist threshold reached for cash travellers.",
  },
];

export async function getOffers(options?: {
  program?: string;
  category?: string;
  featuredOnly?: boolean;
  take?: number;
}): Promise<{ offers: OfferView[]; source: "neon" | "fallback" }> {
  const take = options?.take ?? 24;

  if (!isDatabaseConfigured()) {
    let offers = FALLBACK_OFFERS;
    if (options?.program && options.program !== "all") {
      offers = offers.filter((o) => o.programSlug === options.program);
    }
    if (options?.category) {
      offers = offers.filter((o) => o.category === options.category);
    }
    if (options?.featuredOnly) {
      offers = offers.filter((o) => o.featured);
    }
    return { offers: offers.slice(0, take), source: "fallback" };
  }

  try {
    const rows = await prisma.offer.findMany({
      where: {
        status: "published",
        ...(options?.featuredOnly ? { featured: true } : {}),
        ...(options?.category ? { category: options.category } : {}),
        ...(options?.program && options.program !== "all"
          ? { program: { slug: options.program } }
          : {}),
      },
      include: { program: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take,
    });

    if (!rows.length) {
      return { offers: FALLBACK_OFFERS.slice(0, take), source: "fallback" };
    }

    return {
      source: "neon",
      offers: rows.map((row) => ({
        id: row.id,
        programSlug: row.program.slug,
        programName: row.program.name,
        programColor: row.program.color,
        shortCode: row.program.shortCode,
        title: row.title,
        summary: row.summary,
        category: row.category,
        estimate: row.estimate,
        url: row.url,
        featured: row.featured,
        expiresAt: row.expiresAt,
        expiresLabel: expiresLabel(row.expiresAt),
      })),
    };
  } catch (error) {
    console.error("[offers] Neon query failed", error);
    return { offers: FALLBACK_OFFERS.slice(0, take), source: "fallback" };
  }
}

export async function getCashFares(take = 6): Promise<{
  fares: CashFareView[];
  source: "neon" | "fallback";
}> {
  if (!isDatabaseConfigured()) {
    return { fares: FALLBACK_CASH.slice(0, take), source: "fallback" };
  }

  try {
    const rows = await prisma.cashFare.findMany({
      where: { active: true },
      orderBy: { capturedAt: "desc" },
      take,
    });
    if (!rows.length) {
      return { fares: FALLBACK_CASH.slice(0, take), source: "fallback" };
    }
    return {
      source: "neon",
      fares: rows.map((row) => ({
        id: row.id,
        origin: row.origin,
        destination: row.destination,
        routeLabel: row.routeLabel,
        airline: row.airline,
        travelWindow: row.travelWindow,
        priceAud: row.priceAud,
        note: row.note,
      })),
    };
  } catch (error) {
    console.error("[cash] Neon query failed", error);
    return { fares: FALLBACK_CASH.slice(0, take), source: "fallback" };
  }
}

export async function getProgramsFromDb() {
  if (!isDatabaseConfigured()) return PROGRAMS;

  try {
    const rows = await prisma.loyaltyProgram.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (!rows.length) return PROGRAMS;
    return rows.map((row) => {
      const meta = PROGRAMS.find((p) => p.slug === row.slug);
      return {
        slug: row.slug as ProgramSlug,
        name: row.name,
        shortCode: row.shortCode,
        description: row.description,
        color: row.color,
        accent: meta?.accent ?? "#f5f7fb",
      };
    });
  } catch {
    return PROGRAMS;
  }
}
