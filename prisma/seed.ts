import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PROGRAMS } from "../src/lib/programs";

const prisma = new PrismaClient();

/**
 * Derived from `src/lib/programs.ts` — the single source of truth for program
 * identity. That const doubles as the no-DB fallback, so seeding from anything
 * else lets Neon and the fallback drift apart (they already had, on colour).
 * `accent` stays out: it is presentation, and only the const needs it.
 */
const programs = PROGRAMS.map((program, index) => ({
  slug: program.slug,
  name: program.name,
  shortCode: program.shortCode,
  description: program.description,
  color: program.color,
  sortOrder: index + 1,
}));

function daysFromNow(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

async function main() {
  for (const program of programs) {
    await prisma.loyaltyProgram.upsert({
      where: { slug: program.slug },
      create: program,
      update: {
        name: program.name,
        shortCode: program.shortCode,
        description: program.description,
        color: program.color,
        sortOrder: program.sortOrder,
        active: true,
      },
    });
  }

  const bySlug = Object.fromEntries(
    (
      await prisma.loyaltyProgram.findMany({
        where: { slug: { in: programs.map((p) => p.slug) } },
      })
    ).map((p) => [p.slug, p.id]),
  );

  const offerCount = await prisma.offer.count();
  if (offerCount === 0) {
    await prisma.offer.createMany({
      data: [
        {
          programId: bySlug.qantas,
          title: "10x Apple Gift Card on Qantas Marketplace",
          summary:
            "Boosted marketplace earn on selected Apple gift cards — strong cpp if you already shop there.",
          category: "marketplace",
          estimate: "Up to 10x points",
          featured: true,
          expiresAt: daysFromNow(12),
          url: "https://www.qantas.com/au/en/frequent-flyer.html",
        },
        {
          programId: bySlug.velocity,
          title: "Bonus Velocity Points on Virgin flights",
          summary:
            "Limited-time flight bonus for Velocity members on selected domestic and international routes.",
          category: "travel",
          estimate: "2,000+ bonus points",
          featured: true,
          expiresAt: daysFromNow(30),
          url: "https://www.velocityfrequentflyer.com/",
        },
        {
          programId: bySlug.everyday,
          title: "2,000 Everyday Rewards on a $50 shop",
          summary:
            "Weekly grocery boost — compare effective points per dollar before you shop.",
          category: "groceries",
          estimate: "2,000 points",
          featured: false,
          expiresAt: daysFromNow(8),
        },
        {
          programId: bySlug.flybuys,
          title: "5,000 Flybuys points at Coles",
          summary:
            "Coles boost week with a spend threshold. Best for planned grocery runs.",
          category: "groceries",
          estimate: "5,000 points",
          featured: true,
          expiresAt: daysFromNow(6),
        },
        {
          programId: bySlug.qantas,
          title: "Wine club bonus points",
          summary:
            "Qantas Wine promotions ranked by cost per 1,000 bonus points.",
          category: "wine",
          estimate: "Best value wine earn",
          featured: false,
          expiresAt: daysFromNow(45),
        },
        {
          programId: bySlug.velocity,
          title: "Gift card rate of the week",
          summary:
            "Highest points-per-dollar gift cards across Velocity partners this week.",
          category: "shopping",
          estimate: "Top gift card rate",
          featured: false,
          expiresAt: daysFromNow(14),
        },
        {
          programId: bySlug.everyday,
          title: "Fuel & partner double points",
          summary:
            "Stack fuel and partner offers for Everyday Rewards members.",
          category: "shopping",
          estimate: "2x points",
          featured: false,
          expiresAt: daysFromNow(20),
        },
        {
          programId: bySlug.flybuys,
          title: "Coles Financial Services bonus",
          summary:
            "Selected insurance and financial products with Flybuys earn boosts.",
          category: "cards",
          estimate: "Bonus points",
          featured: false,
          expiresAt: daysFromNow(40),
        },
      ],
    });
  }

  const cashCount = await prisma.cashFare.count();
  if (cashCount === 0) {
    await prisma.cashFare.createMany({
      data: [
        {
          origin: "SYD",
          destination: "HND",
          routeLabel: "Sydney to Tokyo",
          airline: "ANA",
          travelWindow: "Sep–Oct",
          priceAud: 914,
          note: "22% below tracked average — strong cash alternative to premium awards.",
        },
        {
          origin: "MEL",
          destination: "SIN",
          routeLabel: "Melbourne to Singapore",
          airline: "Singapore Airlines",
          travelWindow: "Aug–Nov",
          priceAud: 788,
          note: "Good cash alternative when award taxes are high.",
        },
        {
          origin: "BNE",
          destination: "LAX",
          routeLabel: "Brisbane to Los Angeles",
          airline: "Fiji Airways",
          travelWindow: "Oct",
          priceAud: 1096,
          note: "Watchlist threshold reached for cash travellers.",
        },
        {
          origin: "SYD",
          destination: "LHR",
          routeLabel: "Sydney to London",
          airline: "Qantas",
          travelWindow: "Nov–Feb",
          priceAud: 1680,
          note: "Compare against business award cpp before burning points.",
        },
      ],
    });
  }

  // Verticals — curated editorial data. There is no public feed for these, so
  // hand-curation is the point. Seeded only when empty, matching offers/cash.
  if ((await prisma.wineDeal.count()) === 0) {
    await prisma.wineDeal.createMany({
      data: [
        {
          programId: bySlug.qantas!,
          title: "Mixed dozen with bonus points",
          vendor: "Qantas Wine",
          bonusPoints: 6000,
          priceAud: 189,
          bottles: 12,
        },
        {
          programId: bySlug.velocity!,
          title: "Premium reds six-pack",
          vendor: "Virgin Wine",
          bonusPoints: 4000,
          priceAud: 149,
          bottles: 6,
        },
        {
          programId: bySlug.qantas!,
          title: "Champagne case bonus offer",
          vendor: "Qantas Wine",
          bonusPoints: 15000,
          priceAud: 499,
          bottles: 12,
        },
      ],
    });
  }

  if ((await prisma.giftCardRate.count()) === 0) {
    await prisma.giftCardRate.createMany({
      data: [
        {
          programId: bySlug.qantas!,
          retailer: "Woolworths",
          channel: "Qantas Marketplace",
          pointsPerDollar: 3,
        },
        {
          programId: bySlug.velocity!,
          retailer: "Coles Group & Myer",
          channel: "Velocity Store",
          pointsPerDollar: 2.5,
          capAud: 5000,
        },
        {
          programId: bySlug.qantas!,
          retailer: "JB Hi-Fi",
          channel: "Qantas Marketplace",
          pointsPerDollar: 2,
          minSpendAud: 50,
        },
      ],
    });
  }

  if ((await prisma.cardOffer.count()) === 0) {
    await prisma.cardOffer.createMany({
      data: [
        {
          programId: bySlug.qantas!,
          issuer: "Major Bank",
          cardName: "Qantas Premier Platinum",
          bonusPoints: 90000,
          minSpendAud: 4500,
          spendWindowDays: 90,
          annualFeeAud: 349,
          feeFirstYearAud: 175,
          eligibility: "New cardholders only",
        },
        {
          programId: bySlug.velocity!,
          issuer: "Major Bank",
          cardName: "Velocity Rewards Signature",
          bonusPoints: 60000,
          minSpendAud: 3000,
          spendWindowDays: 90,
          annualFeeAud: 289,
          feeFirstYearAud: 0,
          eligibility: "No cards from this issuer in 18 months",
        },
      ],
    });
  }

  await prisma.appSetting.upsert({
    where: { key: "seeded_at" },
    create: { key: "seeded_at", value: new Date().toISOString() },
    update: { value: new Date().toISOString() },
  });

  console.log("FareAtlas seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
