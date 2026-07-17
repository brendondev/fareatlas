import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const programs = [
  {
    slug: "qantas",
    name: "Qantas Points",
    shortCode: "QF",
    description:
      "Track and maximise Qantas Frequent Flyer earn opportunities across flights, retail and marketplace.",
    color: "#E40000",
    sortOrder: 1,
  },
  {
    slug: "velocity",
    name: "Velocity",
    shortCode: "VA",
    description:
      "Never miss a Virgin Australia Velocity bonus on flights, partners and status offers.",
    color: "#E10A17",
    sortOrder: 2,
  },
  {
    slug: "everyday",
    name: "Everyday Rewards",
    shortCode: "ER",
    description:
      "Stack more Everyday Rewards points on everyday shopping and partner boosts.",
    color: "#E31837",
    sortOrder: 3,
  },
  {
    slug: "flybuys",
    name: "Flybuys",
    shortCode: "FB",
    description:
      "Earn Flybuys on Coles, partners and boost weeks — sorted by value.",
    color: "#00A9E0",
    sortOrder: 4,
  },
] as const;

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
