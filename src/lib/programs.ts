export type ProgramSlug = "qantas" | "velocity" | "everyday" | "flybuys";

export type ProgramMeta = {
  slug: ProgramSlug;
  name: string;
  shortCode: string;
  description: string;
  /** Brand colour. Seeded into Neon — see `prisma/seed.ts`. */
  color: string;
  /**
   * Wash behind the program card. Must be translucent: these composite over
   * the panel, and the opaque near-whites they replaced glowed on obsidian.
   */
  accent: string;
};

export const PROGRAMS: ProgramMeta[] = [
  {
    slug: "qantas",
    name: "Qantas Points",
    shortCode: "QF",
    description:
      "Track and maximise Qantas Frequent Flyer earn across flights, retail and marketplace.",
    color: "#E40000",
    accent: "rgba(228, 0, 0, 0.14)",
  },
  {
    slug: "velocity",
    name: "Velocity",
    shortCode: "VA",
    description:
      "Never miss a Virgin Australia Velocity bonus on flights and partners.",
    color: "#C8102E",
    accent: "rgba(200, 16, 46, 0.14)",
  },
  {
    slug: "everyday",
    name: "Everyday Rewards",
    shortCode: "ER",
    description:
      "Stack more Everyday Rewards points on shopping and partner boosts.",
    color: "#D50032",
    accent: "rgba(213, 0, 50, 0.14)",
  },
  {
    slug: "flybuys",
    name: "Flybuys",
    shortCode: "FB",
    description: "Earn Flybuys at Coles and partners — sorted by real value.",
    color: "#00A9E0",
    accent: "rgba(0, 169, 224, 0.14)",
  },
];

export function programBySlug(slug: string): ProgramMeta | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}
