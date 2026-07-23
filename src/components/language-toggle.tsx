"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import {
  LOCALE_LABELS,
  LOCALE_NAMES,
  LOCALES,
  type Locale,
} from "@/lib/i18n/config";

/**
 * PT / EN / ES segmented toggle. Sets the locale cookie via a server action,
 * then refreshes so the server re-renders every string in the new language.
 * `current` comes from the server (getLocale) so the active state is correct on
 * first paint, with no client-side flash.
 */
export function LanguageToggle({
  current,
  className = "",
}: {
  current: Locale;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function pick(locale: Locale) {
    if (locale === current || pending) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-[var(--line)] bg-[var(--soft)] p-0.5 ${className}`}
      role="group"
    >
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            aria-label={LOCALE_NAMES[locale]}
            aria-pressed={active}
            className={`rounded-full px-2 py-1 text-xs font-semibold transition ${
              active
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            } ${pending ? "opacity-70" : ""}`}
            disabled={pending}
            key={locale}
            onClick={() => pick(locale)}
            type="button"
          >
            {LOCALE_LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
