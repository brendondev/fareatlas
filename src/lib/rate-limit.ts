import "server-only";

import { headers } from "next/headers";
import { prisma } from "./db";

export type RateLimitResult = {
  ok: boolean;
  retryAfterMs: number;
};

/**
 * Fixed-window counter kept in Postgres.
 *
 * Not an in-memory Map: on Vercel each instance has its own heap, instances
 * scale horizontally and cold-start freely, so a limit of 5 becomes 5xN and
 * resets on every deploy. That looks like protection without being any.
 *
 * Races can over-count under contention, which fails closed. That's the right
 * direction for a login form.
 */
export async function consume(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const windowFloor = new Date(now.getTime() - windowMs);

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing || existing.windowStart < windowFloor) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      });
      return { ok: true, retryAfterMs: 0 };
    }

    if (existing.count >= limit) {
      const retryAfterMs = Math.max(
        0,
        existing.windowStart.getTime() + windowMs - now.getTime(),
      );
      return { ok: false, retryAfterMs };
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return { ok: true, retryAfterMs: 0 };
  } catch (error) {
    // If the limiter itself is broken, let the request through rather than
    // locking everyone out of login. The per-account lockout still applies.
    console.error("[rate-limit] check failed, allowing request", error);
    return { ok: true, retryAfterMs: 0 };
  }
}

/** Best-effort client IP. Vercel sets x-forwarded-for. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

export function retryAfterLabel(ms: number): string {
  const minutes = Math.ceil(ms / 60_000);
  if (minutes <= 1) return "a minute";
  return `${minutes} minutes`;
}
