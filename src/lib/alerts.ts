import "server-only";

import { randomBytes } from "node:crypto";
import { availabilityKeys, newlyAvailable, summarise } from "./alerts-core";
import { filterResultsForTier } from "./awards";
import { type Tier } from "./dal";
import { prisma } from "./db";
import { isEmailConfigured, sendEmail } from "./email";
import {
  cabinAllowed,
  clampSearch,
  entitlementsFor,
  normalizeCabin,
} from "./entitlements";
import {
  awardCacheDayKey,
  mapSearchResults,
  searchAwardsCached,
} from "./seats-aero";
import type { AwardResult, CachedSearchParams } from "./seats-aero";
import { siteUrl } from "./site-url";

// The tightest cadence any tier buys (Pro = 15 min). The cron pulls everything
// due under this floor, then each watch is held to *its own* tier's threshold
// in code — so a Free route (60 min) fetched here is skipped until its time.
const MIN_CHECK_THRESHOLD_MIN = Math.min(
  ...(["free", "premium", "pro"] as const).map(
    (tier) => entitlementsFor(tier).checkThresholdMin,
  ),
);
const DEFAULT_BATCH = 60; // bound work per cron run

// --- orchestrator ---

type WatchRow = {
  id: string;
  email: string;
  userId: string | null;
  origin: string;
  destination: string;
  cabins: string;
  programs: string | null;
  startDate: Date | null;
  endDate: Date | null;
  lastCheckedAt: Date | null;
  lastSeenJson: string | null;
  lastNotifiedAt: Date | null;
  unsubToken: string | null;
  user: { tier: string; email: string } | null;
};

export type AlertsSummary = {
  ok: true;
  checked: number;
  hits: number;
  emailsSent: number;
  emailsSkipped: number;
  apiCalls: number;
};

function toTier(value: string | undefined): Tier {
  if (value === "pro") return "pro";
  if (value === "premium") return "premium";
  return "free";
}

/** The cabins a watch actually wants AND its owner's tier permits. */
function allowedCabins(cabinsCsv: string, tier: Tier): Set<string> {
  const set = new Set<string>();
  for (const raw of cabinsCsv.split(",")) {
    const cabin = normalizeCabin(raw);
    if (cabin && cabinAllowed(cabin, tier)) set.add(cabin);
  }
  // An empty request means "everything the tier allows".
  if (!set.size) {
    for (const cabin of ["economy", "premium", "business", "first"]) {
      if (cabinAllowed(cabin, tier)) set.add(cabin);
    }
  }
  return set;
}

function iso(date: Date | null): string | undefined {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

/** Groups collapse identical clamped searches so one route = one API call. */
function groupKey(p: CachedSearchParams): string {
  return [
    p.originAirport,
    p.destinationAirport,
    p.startDate ?? "",
    p.endDate ?? "",
    p.cabins ?? "",
    p.sources ?? "",
  ].join("::");
}

export async function runAwardAlerts(options?: {
  limit?: number;
  force?: boolean;
}): Promise<AlertsSummary> {
  const limit = options?.limit ?? DEFAULT_BATCH;
  const force = options?.force ?? false;
  const now = new Date();
  const dueBefore = new Date(
    now.getTime() - MIN_CHECK_THRESHOLD_MIN * 60 * 1000,
  );
  const today = awardCacheDayKey();

  // Signed-in, active watches that are due. Anonymous (userId null) watches are
  // recorded but never checked — they can't be emailed and shouldn't burn quota.
  const watches = (await prisma.awardWatch.findMany({
    where: {
      status: "active",
      userId: { not: null },
      ...(force ? {} : { OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: dueBefore } }] }),
    },
    orderBy: { lastCheckedAt: "asc" }, // nulls first in Postgres asc
    take: limit,
    select: {
      id: true,
      email: true,
      userId: true,
      origin: true,
      destination: true,
      cabins: true,
      programs: true,
      startDate: true,
      endDate: true,
      lastCheckedAt: true,
      lastSeenJson: true,
      lastNotifiedAt: true,
      unsubToken: true,
      user: { select: { tier: true, email: true } },
    },
  })) as WatchRow[];

  const summary: AlertsSummary = {
    ok: true,
    checked: 0,
    hits: 0,
    emailsSent: 0,
    emailsSkipped: 0,
    apiCalls: 0,
  };

  // Build each watch's clamped params and bucket by identical search.
  const perWatch = watches.map((watch) => {
    const tier = toTier(watch.user?.tier);
    const raw: CachedSearchParams = {
      originAirport: watch.origin,
      destinationAirport: watch.destination,
      startDate: iso(watch.startDate),
      endDate: iso(watch.endDate),
      cabins: watch.cabins,
      sources: watch.programs ?? undefined,
      take: 100,
      orderBy: "lowest_mileage",
    };
    const { params } = clampSearch(raw, tier, today);
    return { watch, tier, params };
  })
  // The query pulled everything due under the tightest cadence (Pro). Hold each
  // watch to its own tier's threshold so a Free route isn't re-searched every
  // 15 minutes just because a Pro route shares this batch.
  .filter(({ watch, tier }) => {
    if (!watch.lastCheckedAt) return true; // never checked → always due
    const dueAt =
      watch.lastCheckedAt.getTime() +
      entitlementsFor(tier).checkThresholdMin * 60 * 1000;
    return now.getTime() >= dueAt;
  });

  const groups = new Map<string, { params: CachedSearchParams; results: AwardResult[]; tier: Tier }>();

  for (const { params, tier } of perWatch) {
    const key = groupKey(params);
    if (!groups.has(key)) groups.set(key, { params, results: [], tier });
  }

  // One live search per group (refresh: fresh data + rewarms the day cache).
  // Falls back to cached payload if the live API call fails (e.g. key not set).
  for (const group of groups.values()) {
    try {
      const res = await searchAwardsCached(group.params, { refresh: true });
      summary.apiCalls += 1;
      group.results = filterResultsForTier(
        mapSearchResults(res.response.data ?? []),
        group.tier,
      );
    } catch (liveError) {
      console.error("[alerts] live search failed, falling back to cache", group.params, liveError);
      try {
        const cached = await searchAwardsCached(group.params);
        group.results = filterResultsForTier(
          mapSearchResults(cached.response.data ?? []),
          group.tier,
        );
      } catch (cacheError) {
        console.error("[alerts] cache also failed", group.params, cacheError);
        group.results = [];
      }
    }
  }

  // Diff each watch against its group's results and persist.
  for (const { watch, tier, params } of perWatch) {
    summary.checked += 1;
    const group = groups.get(groupKey(params));
    const results = group?.results ?? [];

    const allowed = allowedCabins(watch.cabins, tier);
    const currentKeys = availabilityKeys(results, allowed);
    const newKeys = newlyAvailable(currentKeys, watch.lastSeenJson);

    const data: Record<string, unknown> = {
      lastCheckedAt: now,
      lastSeenJson: JSON.stringify(currentKeys),
    };

    if (newKeys.length) {
      summary.hits += 1;
      const hitSummary = summarise(results, newKeys);
      data.lastHitAt = now;
      data.lastHitSummary = hitSummary;

      // Email is a paid lever: Free surfaces the hit in-app (lastHitAt above)
      // but is never emailed. Cooldown length is per-tier — Pro hears again
      // sooner if a seat keeps reappearing.
      const plan = entitlementsFor(tier);
      const cooldownOk =
        !watch.lastNotifiedAt ||
        watch.lastNotifiedAt.getTime() <
          now.getTime() - plan.cooldownHours * 3600 * 1000;
      const recipient = watch.user?.email ?? watch.email;

      if (plan.emailAlerts && isEmailConfigured() && cooldownOk && recipient) {
        // Lazily ensure an unsubscribe token before the link goes out.
        let token = watch.unsubToken;
        if (!token) {
          token = randomBytes(24).toString("base64url");
          data.unsubToken = token;
        }
        const { sent } = await sendAlertEmail({
          to: recipient,
          origin: watch.origin,
          destination: watch.destination,
          summary: hitSummary ?? "New award seats",
          unsubToken: token,
        });
        if (sent) {
          data.lastNotifiedAt = now;
          summary.emailsSent += 1;
        } else {
          summary.emailsSkipped += 1;
        }
      } else if (newKeys.length) {
        summary.emailsSkipped += 1;
      }
    }

    try {
      await prisma.awardWatch.update({ where: { id: watch.id }, data });
    } catch (error) {
      console.error("[alerts] persist failed", watch.id, error);
    }
  }

  return summary;
}

async function sendAlertEmail(params: {
  to: string;
  origin: string;
  destination: string;
  summary: string;
  unsubToken: string;
}): Promise<{ sent: boolean }> {
  const base = siteUrl();
  const searchLink = `${base}/flights`;
  const unsubLink = `${base}/unsubscribe/${params.unsubToken}`;
  const route = `${params.origin} → ${params.destination}`;

  return sendEmail({
    to: params.to,
    subject: `Reward seats found: ${route}`,
    text: [
      `Award seats opened up on ${route}.`,
      ``,
      params.summary,
      ``,
      `Search and book: ${searchLink}`,
      ``,
      `Availability changes fast — confirm with the program before you rely on it.`,
      ``,
      `Stop watching this route: ${unsubLink}`,
    ].join("\n"),
    html: [
      `<p>Award seats opened up on <strong>${route}</strong>.</p>`,
      `<p style="font-size:16px">${params.summary}</p>`,
      `<p><a href="${searchLink}">Search and book on FareAtlas</a></p>`,
      `<p style="color:#666;font-size:13px">Availability changes fast — confirm with the program before you rely on it.</p>`,
      `<p style="color:#666;font-size:13px"><a href="${unsubLink}">Stop watching this route</a></p>`,
    ].join(""),
  });
}
