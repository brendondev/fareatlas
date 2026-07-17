import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Award data has exactly one sanctioned door: `lib/awards.ts`, which clamps
    // the query to the viewer's tier before it can reach the Partner API or the
    // cache key. Everything banned here is a way around that clamp:
    //   - `seats-aero/client` calls the API with whatever it is handed
    //   - `searchAwardsCached`/`getTripsCached` cache, but do not gate
    // Without this rule the clamp is a convention someone forgets; with it,
    // there is no unclamped path to forget.
    files: ["src/app/**", "src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/seats-aero/client",
              message:
                "Use '@/lib/awards' — the raw client skips the Neon cache and tier clamping.",
            },
            {
              name: "@/lib/seats-aero",
              importNames: ["searchAwardsCached", "getTripsCached"],
              message:
                "Use searchAwardsForViewer/getTripsForViewer from '@/lib/awards' — these skip Free/Premium clamping.",
            },
            {
              name: "@/lib/api",
              importNames: ["searchAwardsCached", "getTripsCached"],
              message:
                "Use searchAwardsForViewer/getTripsForViewer from '@/lib/awards' — these skip Free/Premium clamping.",
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
