/**
 * Vercel / local DB bootstrap for Neon + Prisma.
 * - Resolves DIRECT_URL from common Neon env names
 * - prisma db push
 * - seeds when empty (or FORCE_SEED=1)
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, args, env = process.env) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.log("[db-setup] DATABASE_URL not set — skipping Prisma push/seed.");
  process.exit(0);
}

const direct =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL_UNPOOLED?.trim() ||
  databaseUrl;

const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  DIRECT_URL: direct,
};

console.log("[db-setup] Running prisma generate…");
run("npx", ["prisma", "generate"], env);

console.log("[db-setup] Running prisma db push…");
run("npx", ["prisma", "db", "push", "--skip-generate"], env);

const force = process.env.FORCE_SEED === "1" || process.env.FORCE_SEED === "true";
const seedPath = join(root, "prisma", "seed.ts");
if (existsSync(seedPath)) {
  console.log(`[db-setup] Seeding${force ? " (forced)" : ""}…`);
  run("npx", ["tsx", "prisma/seed.ts"], env);
}

console.log("[db-setup] Done.");
