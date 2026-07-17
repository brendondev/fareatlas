import { NextRequest, NextResponse } from "next/server";
import {
  getTripsCached,
  isSeatsAeroConfigured,
  programLabel,
  SeatsAeroError,
} from "@/lib/seats-aero";
import { isDatabaseConfigured } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isSeatsAeroConfigured()) {
    return NextResponse.json(
      {
        error:
          "Award availability API is not configured. Set AWARD_AVAILABILITY_API_KEY.",
        configured: false,
      },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json(
      { error: "Availability id is required." },
      { status: 400 },
    );
  }

  const includeFiltered =
    request.nextUrl.searchParams.get("include_filtered") === "true";
  const bypassCache =
    request.nextUrl.searchParams.get("refresh") === "1" ||
    request.nextUrl.searchParams.get("refresh") === "true";

  try {
    const cached = await getTripsCached(id, {
      includeFiltered,
      refresh: bypassCache,
    });
    const { response, source, dayKey, hitCount: cacheHits } = cached;

    const trips = (response.data ?? []).map((trip) => ({
      id: trip.ID,
      cabin: trip.Cabin ?? null,
      program: programLabel(trip.Source),
      source: trip.Source ?? null,
      mileageCost: trip.MileageCost ?? null,
      remainingSeats: trip.RemainingSeats ?? null,
      totalTaxes: trip.TotalTaxes ?? null,
      taxesCurrency: trip.TaxesCurrency || null,
      taxesCurrencySymbol: trip.TaxesCurrencySymbol || null,
      stops: trip.Stops ?? null,
      totalDurationMinutes: trip.TotalDuration ?? null,
      carriers: trip.Carriers ?? null,
      flightNumbers: trip.FlightNumbers ?? null,
      departsAt: trip.DepartsAt ?? null,
      arrivesAt: trip.ArrivesAt ?? null,
      segments: (trip.AvailabilitySegments ?? []).map((seg) => ({
        id: seg.ID,
        flightNumber: seg.FlightNumber,
        origin: seg.OriginAirport,
        destination: seg.DestinationAirport,
        departsAt: seg.DepartsAt,
        arrivesAt: seg.ArrivesAt,
        aircraft: seg.AircraftName || seg.AircraftCode || null,
        fareClass: seg.FareClass ?? null,
        order: seg.Order ?? 0,
      })),
    }));

    return NextResponse.json({
      configured: true,
      availabilityId: id,
      cache: {
        enabled: isDatabaseConfigured(),
        source,
        dayKey,
        hitCount: cacheHits,
        bypassed: bypassCache,
      },
      count: trips.length,
      trips,
      bookingLinks: response.booking_links ?? [],
      originCoordinates: response.origin_coordinates ?? null,
      destinationCoordinates: response.destination_coordinates ?? null,
    });
  } catch (error) {
    if (error instanceof SeatsAeroError) {
      return NextResponse.json(
        {
          error: error.message,
          status: error.status,
          detail: error.body || undefined,
        },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }

    console.error("[awards/trips]", error);
    return NextResponse.json(
      { error: "Unexpected error while loading trip details." },
      { status: 500 },
    );
  }
}
