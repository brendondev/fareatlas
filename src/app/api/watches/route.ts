import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/db";

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
    const watch = await prisma.awardWatch.create({
      data: {
        email,
        origin,
        destination,
        cabins,
        status: "active",
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
