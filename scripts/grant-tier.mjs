/**
 * Grants or revokes Premium for an existing account.
 *
 *   node scripts/grant-tier.mjs <email> <free|premium> ["why"]
 *
 * There is no billing, so tier is set by hand — but not with ad-hoc SQL pasted
 * into a console. This exists so the operation is repeatable, records why, and
 * cannot do the two things a loose UPDATE quietly gets wrong:
 *
 *   1. It refuses to create an account. `UPDATE ... WHERE email = '...'` on a
 *      typo touches zero rows and reports success, and you spend an hour
 *      wondering why the app still says free. This prints the addresses that
 *      do exist instead.
 *   2. It normalises case and rejects tiers that aren't real. The DAL fails
 *      closed to free on anything it doesn't recognise, so a stray 'Premium'
 *      or 'admin' written straight to the column looks applied and silently
 *      does nothing.
 *
 * Needs DATABASE_URL — from .env.local, or inline:
 *   DATABASE_URL="postgres://..." node scripts/grant-tier.mjs a@b.c premium
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const envFile = [".env.local", ".env"]
  .map((name) => join(root, name))
  .find((path) => existsSync(path));

if (envFile) {
  const { config } = await import("dotenv");
  config({ path: envFile });
}

const VALID_TIERS = ["free", "premium"];

const [, , emailArg, tierArg, ...noteParts] = process.argv;
const email = emailArg?.trim().toLowerCase();
const tier = tierArg?.trim().toLowerCase();
const note = noteParts.join(" ").trim() || null;

function fail(message) {
  console.error(`\n  ${message}\n`);
  console.error("  Usage: node scripts/grant-tier.mjs <email> <free|premium> [\"why\"]\n");
  process.exit(1);
}

if (!email || !tier) fail("Both an email and a tier are required.");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(`"${email}" is not an email address.`);
if (!VALID_TIERS.includes(tier)) {
  fail(`Tier must be one of: ${VALID_TIERS.join(", ")} (got "${tierArg}").`);
}
if (!process.env.DATABASE_URL?.trim()) {
  fail("DATABASE_URL is not set. Pull it from Neon, or pass it inline.");
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, tier: true },
  });

  // The whole reason this file exists rather than a raw UPDATE.
  if (!user) {
    const known = await prisma.user.findMany({
      select: { email: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    console.error(`\n  No account with the email "${email}".`);
    console.error("  Nothing was changed — this script will not create one.");
    if (known.length) {
      console.error("\n  Registered accounts (most recent first):");
      for (const row of known) console.error(`    - ${row.email}`);
    } else {
      console.error("\n  There are no accounts at all yet. Register first.");
    }
    console.error("");
    process.exit(1);
  }

  if (user.tier === tier) {
    console.log(`\n  ${user.email} is already "${tier}". Nothing to do.\n`);
    process.exit(0);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      tier,
      tierNote: note,
      tierSince: tier === "premium" ? new Date() : null,
    },
    select: { email: true, tier: true, tierSince: true },
  });

  console.log(`\n  ${updated.email}: ${user.tier} -> ${updated.tier}`);
  if (note) console.log(`  Reason: ${note}`);
  console.log(
    "\n  Live immediately — the session token carries no tier, so there is no",
  );
  console.log("  need to sign out and back in.\n");
} catch (error) {
  console.error("\n  Failed:", error.message, "\n");
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
