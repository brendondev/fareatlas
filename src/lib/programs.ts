export type ProgramSlug = "qantas" | "velocity" | "everyday" | "flybuys";

export type ProgramMeta = {
  slug: ProgramSlug;
  name: string;
  shortCode: string;
  description: string;
  color: string;
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
    accent: "#fff1f1",
  },
  {
    slug: "velocity",
    name: "Velocity",
    shortCode: "VA",
    description:
      "Never miss a Virgin Australia Velocity bonus on flights and partners.",
    color: "#C8102E",
    accent: "#fff0f2",
  },
  {
    slug: "everyday",
    name: "Everyday Rewards",
    shortCode: "ER",
    description:
      "Stack more Everyday Rewards points on shopping and partner boosts.",
    color: "#D50032",
    accent: "#fff1f4",
  },
  {
    slug: "flybuys",
    name: "Flybuys",
    shortCode: "FB",
    description: "Earn Flybuys at Coles and partners — sorted by real value.",
    color: "#00A9E0",
    accent: "#eef9ff",
  },
];

export function programBySlug(slug: string): ProgramMeta | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}
