"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { isKnownIata } from "@/lib/airports";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ALL_CABINS, entitlementsFor } from "@/lib/entitlements";

/**
 * Actions backing the /alerts page.
 *
 * Kept out of `account.ts` because /alerts is a top-level page in its own
 * right — bundling this here means /alerts doesn't force-load the account
 * server code and its Prisma queries.
 *
 * `createAlert` accepts everything the modal collects: origin, destination,
 * multi-select cabins, and a date mode (any | fixed | range). Anything else in
 * the form is ignored — the shape is fixed by the Prisma model, not the form.
 */

const IATA = /^[A-Z]{3}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type CreateAlertState =
  | { ok: true }
  | { ok: false; error: string }
  | undefined;

/**
 * Reads a date field, returning either a Date or null. An empty string is
 * treated as "not provided". Invalid dates raise the caller's validation error
 * rather than getting silently swallowed — a truncated ISO string here would
 * be persisted as a distant year in Postgres.
 */
function parseDate(raw: FormDataEntryValue | null): Date | null | "invalid" {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  if (!ISO_DATE.test(value)) return "invalid";
  const dt = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(dt.getTime()) ? "invalid" : dt;
}

export async function createAlert(
  _previous: CreateAlertState,
  formData: FormData,
): Promise<CreateAlertState> {
  const { user, tier } = await requireUser("/alerts");

  const origin = String(formData.get("origin") ?? "").toUpperCase().trim();
  const destination = String(formData.get("destination") ?? "")
    .toUpperCase()
    .trim();

  if (!IATA.test(origin) || !IATA.test(destination)) {
    return { ok: false, error: "Choose both an origin and destination." };
  }
  if (origin === destination) {
    return { ok: false, error: "Origin and destination must differ." };
  }
  if (!isKnownIata(origin) || !isKnownIata(destination)) {
    return { ok: false, error: "That route isn't in the monitored list yet." };
  }

  // Multiple <input name="cabin" value="economy"> submissions; keep the order
  // stable so `cabins` stored on the row matches what the user picked.
  const rawCabins = formData
    .getAll("cabin")
    .map((v) => String(v).trim().toLowerCase())
    .filter((v): v is (typeof ALL_CABINS)[number] =>
      (ALL_CABINS as readonly string[]).includes(v),
    );
  const seen = new Set<string>();
  const cabins = rawCabins.filter((c) => (seen.has(c) ? false : seen.add(c)));

  if (!cabins.length) {
    return { ok: false, error: "Pick at least one cabin." };
  }

  const mode = String(formData.get("dateMode") ?? "any");
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (mode === "fixed") {
    const parsed = parseDate(formData.get("date"));
    if (parsed === "invalid" || parsed === null) {
      return { ok: false, error: "Choose a valid date." };
    }
    startDate = parsed;
    endDate = parsed;
  } else if (mode === "range") {
    const start = parseDate(formData.get("startDate"));
    const end = parseDate(formData.get("endDate"));
    if (start === "invalid" || end === "invalid" || !start || !end) {
      return { ok: false, error: "Choose both a start and end date." };
    }
    if (start.getTime() > end.getTime()) {
      return { ok: false, error: "Start date must be on or before end date." };
    }
    startDate = start;
    endDate = end;
  }
  // mode === "any" leaves both null; the alerts cron treats null start as today.

  const limit = entitlementsFor(tier).maxWatches;
  if (Number.isFinite(limit)) {
    const existing = await prisma.awardWatch.count({
      where: { userId: user!.id, status: "active" },
    });
    if (existing >= limit) {
      return {
        ok: false,
        error: `The free plan covers ${limit} alerts. Remove one, or go Premium for unlimited.`,
      };
    }
  }

  try {
    await prisma.awardWatch.create({
      data: {
        userId: user!.id,
        email: user!.email,
        origin,
        destination,
        cabins: cabins.join(","),
        startDate,
        endDate,
        status: "active",
        unsubToken: randomBytes(24).toString("base64url"),
      },
    });
  } catch (error) {
    console.error("[alerts] create failed", error);
    return { ok: false, error: "Could not save alert. Try again." };
  }

  revalidatePath("/alerts");
  revalidatePath("/account");
  return { ok: true };
}

export async function deleteAlert(formData: FormData): Promise<void> {
  const { user } = await requireUser("/alerts");
  const alertId = String(formData.get("alertId") ?? "");
  if (!alertId) return;

  try {
    await prisma.awardWatch.deleteMany({
      where: { id: alertId, userId: user!.id },
    });
  } catch (error) {
    console.error("[alerts] delete failed", error);
  }

  revalidatePath("/alerts");
  revalidatePath("/account");
}
