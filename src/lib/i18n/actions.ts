"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./config";

/**
 * Persist the chosen locale in a year-long cookie. Not httpOnly on purpose —
 * it's a display preference, carries no identity, and the toggle reads it back
 * with no security consequence. The calling client component triggers a
 * router.refresh() afterwards so the server re-renders in the new language.
 */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
