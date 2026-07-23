import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { pt } from "./dictionaries/pt";

/**
 * The dictionary shape is pt's shape — pt is the default and the source of
 * truth, so en/es are checked against it, never the other way round.
 */
export type Dictionary = typeof pt;

// Imported lazily inside getDictionary so this module's type export (Dictionary)
// can be consumed by en.ts/es.ts without a circular value import at load time.
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  pt: async () => pt,
  en: async () => (await import("./dictionaries/en")).en,
  es: async () => (await import("./dictionaries/es")).es,
};

/** The viewer's locale from the cookie, defaulting to pt. Memoised per request. */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

/** The dictionary for the viewer's locale. */
export const getDictionary = cache(async (): Promise<Dictionary> => {
  return loaders[await getLocale()]();
});
