/** Seats.aero Partner API types (Cached Search + Get Trips). */

export type CabinCode = "economy" | "premium" | "business" | "first";

export type SeatsSource =
  | "qantas"
  | "velocity"
  | "aeroplan"
  | "united"
  | "american"
  | "delta"
  | "alaska"
  | "flyingblue"
  | "emirates"
  | "qatar"
  | "singapore"
  | "virginatlantic"
  | "etihad"
  | "turkish"
  | "lufthansa"
  | "smiles"
  | "azul"
  | "jetblue"
  | "aeromexico"
  | "eurobonus"
  | "connectmiles"
  | "ethiopian"
  | "saudia"
  | "finnair"
  | "frontier"
  | "spirit"
  | string;

export type SeatsRoute = {
  ID: string;
  OriginAirport: string;
  OriginRegion?: string;
  DestinationAirport: string;
  DestinationRegion?: string;
  NumDaysOut?: number;
  Distance?: number;
  Source: SeatsSource;
};

export type SeatsAvailability = {
  ID: string;
  RouteID?: string;
  Route: SeatsRoute;
  Date: string;
  ParsedDate?: string;
  YAvailable?: boolean | null;
  WAvailable?: boolean | null;
  JAvailable?: boolean | null;
  FAvailable?: boolean | null;
  YMileageCost?: string | number | null;
  WMileageCost?: string | number | null;
  JMileageCost?: string | number | null;
  FMileageCost?: string | number | null;
  YRemainingSeats?: number | null;
  WRemainingSeats?: number | null;
  JRemainingSeats?: number | null;
  FRemainingSeats?: number | null;
  YAirlines?: string | null;
  WAirlines?: string | null;
  JAirlines?: string | null;
  FAirlines?: string | null;
  YDirect?: boolean | null;
  WDirect?: boolean | null;
  JDirect?: boolean | null;
  FDirect?: boolean | null;
  Source: SeatsSource;
  CreatedAt?: string;
  UpdatedAt?: string;
  AvailabilityTrips?: SeatsTrip[] | null;
};

export type SeatsSegment = {
  ID: string;
  RouteID?: string;
  AvailabilityID?: string;
  AvailabilityTripID?: string;
  FlightNumber: string;
  Distance?: number;
  FareClass?: string;
  AircraftName?: string;
  AircraftCode?: string;
  OriginAirport: string;
  DestinationAirport: string;
  DepartsAt: string;
  ArrivesAt: string;
  Source?: SeatsSource;
  Order?: number;
};

export type SeatsTrip = {
  ID: string;
  RouteID?: string;
  AvailabilityID?: string;
  AvailabilitySegments?: SeatsSegment[];
  TotalDuration?: number;
  Stops?: number;
  Carriers?: string;
  RemainingSeats?: number;
  MileageCost?: number;
  TotalTaxes?: number;
  TaxesCurrency?: string;
  TaxesCurrencySymbol?: string;
  AllianceCost?: number;
  FlightNumbers?: string;
  DepartsAt?: string;
  ArrivesAt?: string;
  Cabin?: string;
  Source?: SeatsSource;
};

export type SeatsBookingLink = {
  label: string;
  link: string;
  primary?: boolean;
};

export type SeatsSearchResponse = {
  data: SeatsAvailability[];
  count?: number;
  hasMore?: boolean;
  cursor?: number;
  moreResultsAvailable?: boolean;
};

export type SeatsTripsResponse = {
  data: SeatsTrip[];
  origin_coordinates?: { Lat: number; Lon: number };
  destination_coordinates?: { Lat: number; Lon: number };
  booking_links?: SeatsBookingLink[];
};

export type CachedSearchParams = {
  originAirport: string;
  destinationAirport: string;
  startDate?: string;
  endDate?: string;
  sources?: string;
  cabins?: string;
  carriers?: string;
  onlyDirectFlights?: boolean;
  includeTrips?: boolean;
  minifyTrips?: boolean;
  orderBy?: "lowest_mileage" | string;
  take?: number;
  skip?: number;
  cursor?: number;
  includeFiltered?: boolean;
};

export type AwardCabinOffer = {
  cabin: CabinCode;
  label: string;
  available: boolean;
  mileageCost: number | null;
  remainingSeats: number | null;
  airlines: string | null;
  direct: boolean | null;
};

/** Normalized row for FareAtlas UI. */
export type AwardResult = {
  id: string;
  date: string;
  from: string;
  to: string;
  program: string;
  source: SeatsSource;
  regionFrom?: string;
  regionTo?: string;
  distance?: number;
  cabins: AwardCabinOffer[];
  /** Best (lowest mileage) premium or any available cabin for list display. */
  bestCabin: AwardCabinOffer | null;
  updatedAt?: string;
};
