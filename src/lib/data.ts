export type AwardSignal = {
  from: string;
  to: string;
  cabin: string;
  program: string;
  seats: number;
  points: string;
  valueCentsPerPoint: string;
};

export type CashFare = {
  route: string;
  airline: string;
  travelWindow: string;
  price: number;
  delta: string;
};

export type PointsOffer = {
  program: string;
  title: string;
  summary: string;
  estimate: string;
  expires: string;
};

export type IntegrationGap = {
  name: string;
  nextStep: string;
};

export const awardSignals: AwardSignal[] = [
  {
    from: "SYD",
    to: "HND",
    cabin: "Business",
    program: "Qantas",
    seats: 2,
    points: "82,000",
    valueCentsPerPoint: "4.8",
  },
  {
    from: "MEL",
    to: "LAX",
    cabin: "Premium Economy",
    program: "Velocity",
    seats: 4,
    points: "71,700",
    valueCentsPerPoint: "3.1",
  },
  {
    from: "BNE",
    to: "SIN",
    cabin: "Economy",
    program: "Qantas",
    seats: 6,
    points: "25,200",
    valueCentsPerPoint: "1.9",
  },
];

export const cashFares: CashFare[] = [
  {
    route: "Sydney to Tokyo",
    airline: "ANA",
    travelWindow: "Sep-Oct",
    price: 914,
    delta: "22% below tracked average",
  },
  {
    route: "Melbourne to Singapore",
    airline: "Singapore Airlines",
    travelWindow: "Aug-Nov",
    price: 788,
    delta: "Good cash alternative to points",
  },
  {
    route: "Brisbane to Los Angeles",
    airline: "Fiji Airways",
    travelWindow: "Oct",
    price: 1096,
    delta: "Watchlist threshold reached",
  },
];

export const pointsOffers: PointsOffer[] = [
  {
    program: "Qantas",
    title: "Marketplace bonus points",
    summary: "Track boosted earn rates across retail and gift card partners.",
    estimate: "Up to 10x points",
    expires: "API pending",
  },
  {
    program: "Velocity",
    title: "Flight and hotel bonus stack",
    summary: "Flag promotions that can stack with status and card offers.",
    estimate: "2,000+ bonus points",
    expires: "API pending",
  },
  {
    program: "Everyday + Flybuys",
    title: "Grocery booster watch",
    summary: "Compare supermarket offers by effective points per dollar.",
    estimate: "Best weekly value",
    expires: "API pending",
  },
];

export const integrationGaps: IntegrationGap[] = [
  {
    name: "Award availability",
    nextStep: "Connect Seats.aero or airline availability provider.",
  },
  {
    name: "Cash fares",
    nextStep: "Connect Duffel, Amadeus, Skyscanner affiliate, or similar API.",
  },
  {
    name: "Loyalty offers",
    nextStep: "Build crawler/admin ingestion for Qantas, Velocity, Flybuys and Everyday Rewards.",
  },
  {
    name: "Notifications",
    nextStep: "Add email/SMS/push delivery with Resend, Twilio or OneSignal.",
  },
];
