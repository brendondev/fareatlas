import { NextRequest, NextResponse } from "next/server";
import {
  awardCacheDayKey,
  pruneAwardCacheOlderThan,
  purgeAwardCache,
} from "@/lib/seats-aero";
import { isDatabaseConfigured } from "@/lib/db";

/**
 * Daily maintenance for Seats.aero response cache.
 *
 * Default: delete rows from previous Sydney days (keep today).
 * `?mode=purge` wipes both cache tables entirely.
 *
 * Protect with CRON_SECRET:
 *   Authorization: Bearer <CRON_SECRET>
 *   or ?secret=<CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const querySecret = request.nextUrl.searchParams.get("secret") ?? "";

  if (secret) {
    if (bearer !== secret && querySecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "DATABASE_URL not configured",
    });
  }

  const mode = request.nextUrl.searchParams.get("mode") ?? "prune";
  const dayKey = awardCacheDayKey();

  try {
    if (mode === "purge") {
      const result = await purgeAwardCache();
      return NextResponse.json({
        ok: true,
        mode: "purge",
        dayKey: result.dayKey,
        searchesDeleted: result.searchesDeleted,
        tripsDeleted: result.tripsDeleted,
      });
    }

    const result = await pruneAwardCacheOlderThan(dayKey);
    return NextResponse.json({
      ok: true,
      mode: "prune",
      keptDayKey: dayKey,
      searchesDeleted: result.searchesDeleted,
      tripsDeleted: result.tripsDeleted,
    });
  } catch (error) {
    console.error("[cron/award-cache]", error);
    return NextResponse.json(
      { error: "Cache cleanup failed." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
