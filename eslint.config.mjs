import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The Seats.aero client talks to the Partner API with whatever params it is
    // handed. Reaching it directly skips the Neon day-cache (burning quota) and,
    // from Phase 4 on, skips Free/Premium clamping. `lib/seats-aero/with-cache`
    // is the only sanctioned door.
    files: ["src/app/**", "src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/seats-aero/client",
              message:
                "Import from '@/lib/seats-aero' instead — the raw client bypasses the Neon cache and tier clamping.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
