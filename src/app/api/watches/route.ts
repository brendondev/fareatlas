import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getViewer } from "@/lib/dal";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { entitlementsFor } from "@/lib/entitlements";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IATA = /^[A-Za-z]{3}$/;

export async function POST(request: NextRequest) {
  let body: {
    email?: string;
    origin?: string;
    destination?: string;
    cabins?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const origin = body.origin?.trim().toUpperCase() ?? "";
  const destination = body.destination?.trim().toUpperCase() ?? "";
  const cabins = body.cabins?.trim() || "economy,business";

  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (!IATA.test(origin) || !IATA.test(destination)) {
    return NextResponse.json(
      { error: "Origin and destination must be 3-letter IATA codes." },
      { status: 400 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      source: "fallback",
      watch: { email, origin, destination, cabins },
    });
  }

  try {
    const viewer = await getViewer();
    const limit = entitlementsFor(viewer.tier).maxWatches;

    // Signed-in watches are counted against the plan. Anonymous ones are keyed
    // only by an unverified email, so counting them would let anybody exhaust a
    // stranger's allowance by typing their address.
    if (viewer.user && Number.isFinite(limit)) {
      const existing = await prisma.awardWatch.count({
        where: { userId: viewer.user.id, status: "active" },
      });

      if (existing >= limit) {
        return NextResponse.json(
          {
            error: `The free plan covers ${limit} watched routes. Remove one, or go Premium for unlimited.`,
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
        userId: viewer.user?.id,
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
