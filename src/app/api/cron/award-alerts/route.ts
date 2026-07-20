import { NextRequest, NextResponse } from "next/server";
import { runAwardAlerts } from "@/lib/alerts";
import { isDatabaseConfigured } from "@/lib/db";

/**
 * Award-seat alerting. Reads due watches, searches Seats.aero, detects newly
 * available seats and emails the owner.
 *
 * Trigger: an external scheduler (cron-job.org / GitHub Actions) hitting this
 * every ~15-30 min — Vercel Hobby crons only fire daily, and per-route
 * throttling inside runAwardAlerts decouples scheduler frequency from API
 * calls, so hitting it often is safe for quota.
 *
 * Protect with CRON_SECRET (same pattern as award-cache):
 *   Authorization: Bearer <CRON_SECRET>   or   ?secret=<CRON_SECRET>
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

  const limitParam = Number(request.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
  const force = request.nextUrl.searchParams.get("force") === "true";

  try {
    const summary = await runAwardAlerts({ limit, force });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[cron/award-alerts]", error);
    return NextResponse.json({ error: "Alert run failed." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
