import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const placeholder = "postgresql://user:pass@localhost:5432/fareatlas?sslmode=require";

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL?.trim() || placeholder,
  DIRECT_URL:
    process.env.DIRECT_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    placeholder,
};

const result = spawnSync("npx", ["prisma", "generate"], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
