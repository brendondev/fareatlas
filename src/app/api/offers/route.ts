import { NextRequest, NextResponse } from "next/server";
import { getOffers } from "@/lib/offers";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const program = sp.get("program") ?? undefined;
  const category = sp.get("category") ?? undefined;
  const featuredOnly = sp.get("featured") === "true";
  const take = Number(sp.get("take") ?? "24");

  const { offers, source } = await getOffers({
    program,
    category,
    featuredOnly,
    take: Number.isFinite(take) ? take : 24,
  });

  return NextResponse.json({ source, count: offers.length, offers });
}
