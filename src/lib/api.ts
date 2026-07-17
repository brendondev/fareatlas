/**
 * Server data helpers for FareAtlas.
 * Offers / cash live in `offers.ts` (Neon + fallback).
 * Awards live in `seats-aero/` (Seats.aero Partner API).
 */
export { getCashFares, getOffers, getProgramsFromDb } from "./offers";
export {
  cachedSearch,
  getTrips,
  isSeatsAeroConfigured,
  mapSearchResults,
} from "./seats-aero";
