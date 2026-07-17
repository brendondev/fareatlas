import type { SeatsSource } from "./types";

/** Human labels for Seats.aero mileage program sources. */
export const PROGRAM_LABELS: Record<string, string> = {
  qantas: "Qantas",
  velocity: "Velocity",
  aeroplan: "Aeroplan",
  united: "United MileagePlus",
  american: "American AAdvantage",
  delta: "Delta SkyMiles",
  alaska: "Alaska Mileage Plan",
  flyingblue: "Flying Blue",
  emirates: "Emirates Skywards",
  qatar: "Qatar Privilege Club",
  singapore: "KrisFlyer",
  virginatlantic: "Virgin Atlantic",
  etihad: "Etihad Guest",
  turkish: "Miles & Smiles",
  lufthansa: "Miles & More",
  smiles: "GOL Smiles",
  azul: "Azul TudoAzul",
  jetblue: "JetBlue TrueBlue",
  aeromexico: "Club Premier",
  eurobonus: "SAS EuroBonus",
  connectmiles: "Copa ConnectMiles",
  ethiopian: "ShebaMiles",
  saudia: "AlFursan",
  finnair: "Finnair Plus",
  frontier: "Frontier",
  spirit: "Spirit",
};

/** Default programs relevant to AU / Oceania travellers. */
export const AU_FOCUS_SOURCES = [
  "qantas",
  "velocity",
  "aeroplan",
  "united",
  "flyingblue",
  "singapore",
  "emirates",
  "qatar",
  "virginatlantic",
  "american",
  "alaska",
  "delta",
].join(",");

export function programLabel(source: SeatsSource | string | undefined): string {
  if (!source) return "Unknown";
  return PROGRAM_LABELS[source] ?? source;
}
