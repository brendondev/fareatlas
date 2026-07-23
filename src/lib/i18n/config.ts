/**
 * i18n configuration — the pieces safe to import from both client and server.
 *
 * Locale is cookie-based, not URL-based: the toggle flips a cookie and the page
 * re-renders in place, so no route moves under an `[lang]` segment (see the
 * internationalization guide — the dictionary pattern is the same either way;
 * only where the locale comes from differs). Portuguese (Brazil) is the
 * default, so a first-time visitor with no cookie gets pt.
 */
export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "fa_locale";

/** Short labels for the toggle. */
export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

/** Full names, e.g. for aria-labels. */
export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

/** BCP-47 value for the <html lang> attribute. */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
