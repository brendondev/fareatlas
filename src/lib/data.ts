/** Legacy mock types kept for any transitional imports. Prefer `lib/offers` and `lib/content`. */

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
