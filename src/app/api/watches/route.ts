import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getViewer } from "@/lib/dal";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { entitlementsFor } from "@/lib/entitlements";

const IATA = /^[A-Za-z]{3}$/;

export async function POST(request: NextRequest) {
  let body: {
    origin?: string;
    destination?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // The form is signed-in only; the account is the source of truth for who is
  // watching and what they may watch. We never trust an email or cabin list off
  // the wire — email comes from the session, cabins from the tier.
  const viewer = await getViewer();
  if (!viewer.user) {
    return NextResponse.json(
      { error: "Sign in to watch a route." },
      { status: 401 },
    );
  }

  const email = viewer.user.email;
  const origin = body.origin?.trim().toUpperCase() ?? "";
  const destination = body.destination?.trim().toUpperCase() ?? "";
  const cabins = entitlementsFor(viewer.tier).cabins.join(",");

  if (!IATA.test(origin) || !IATA.test(destination)) {
    return NextResponse.json(
      { error: "Origin and destination must be 3-letter IATA codes." },
      { status: 400 },
    );
  }

  // A signed-in session implies auth (and therefore Neon) is configured, so
  // there is no in-memory fallback path here — the watch is persisted or fails.
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Could not save watch. Check Neon connection." },
      { status: 500 },
    );
  }

  try {
    const limit = entitlementsFor(viewer.tier).maxWatches;

    if (Number.isFinite(limit)) {
      const existing = await prisma.awardWatch.count({
        where: { userId: viewer.user.id, status: "active" },
      });

      if (existing >= limit) {
        // Free points at Premium; Premium (also capped) points at Pro, which is
        // the only tier with an unlimited allowance.
        const upsell =
          viewer.tier === "free"
            ? "go Premium for more, or Pro for unlimited"
            : "go Pro for unlimited";
        return NextResponse.json(
          {
            error: `Your plan covers ${limit} watched routes. Remove one, or ${upsell}.`,
            tier: viewer.tier,
            limit,
          },
          { status: 403 },
        );
      }
    }

    const watch = await prisma.awardWatch.create({
      data: {
        email,
        userId: viewer.user.id,
        origin,
        destination,
        cabins,
        status: "active",
        // One-click unsubscribe token, minted up front so alert emails always
        // have a link (older rows get one lazily in the alerts cron).
        unsubToken: randomBytes(24).toString("base64url"),
      },
    });

    return NextResponse.json({
      ok: true,
      source: "neon",
      watch: {
        id: watch.id,
        email: watch.email,
        origin: watch.origin,
        destination: watch.destination,
        cabins: watch.cabins,
      },
    });
  } catch (error) {
    console.error("[watches]", error);
    return NextResponse.json(
      { error: "Could not save watch. Check Neon connection." },
      { status: 500 },
    );
  }
}
