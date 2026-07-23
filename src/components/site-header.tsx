"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { SITE } from "@/lib/content";
import type { Viewer } from "@/lib/dal";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

/**
 * `viewer`, `locale` and `dict` all arrive as props from the root layout: this
 * is a client component and must not reach into the DAL or the (server-only)
 * dictionary loader. It decides which buttons to draw and in which language,
 * nothing more — the pages themselves enforce access.
 *
 * Labels come from `dict`; hrefs stay here (they don't translate).
 */
export function SiteHeader({
  viewer,
  locale,
  dict,
}: {
  viewer: Viewer;
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [earnOpen, setEarnOpen] = useState(false);
  const { authConfigured, user } = viewer;

  // "Earn" groups the accumulation verticals — seven flat links overflowed the
  // bar, and these belong together conceptually (ways to earn points on spend).
  const earn = [
    { href: "/offers", ...dict.nav.earnItems.offers },
    { href: "/wine", ...dict.nav.earnItems.wine },
    { href: "/gift-cards", ...dict.nav.earnItems.giftCards },
    { href: "/cards", ...dict.nav.earnItems.cards },
  ];

  const baseNav = [
    { href: "/flights", label: dict.nav.flights },
    { href: "/marketplace", label: dict.nav.marketplace },
    { href: "/partners", label: dict.nav.partners },
    { href: "/perks", label: dict.nav.perks },
    { href: "/guides", label: dict.nav.guides },
    { href: "/pricing", label: dict.nav.pricing },
  ];
  const alertsItem = { href: "/alerts", label: dict.nav.alerts };

  const earnActive = earn.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  // Inject Alerts right after Flights when auth is switched on — it's
  // account-gated and would frustrate an anonymous click.
  const nav = authConfigured
    ? [baseNav[0]!, alertsItem, ...baseNav.slice(1)]
    : baseNav;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(255,255,255,0.82)] backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-2.5" href="/">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] font-display text-sm font-bold text-white">
            FA
          </span>
          <span>
            <span className="block font-display text-base font-bold tracking-tight text-ink">
              {SITE.name}
            </span>
            <span className="hidden text-[11px] font-medium text-[var(--muted)] sm:block">
              {dict.header.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {/* Earn dropdown — hover/focus-within, so it works without JS too. */}
          <div
            className="relative"
            onMouseEnter={() => setEarnOpen(true)}
            onMouseLeave={() => setEarnOpen(false)}
          >
            <button
              aria-expanded={earnOpen}
              className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium ${
                earnActive
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--ink)]"
              }`}
              onClick={() => setEarnOpen((v) => !v)}
              type="button"
            >
              {dict.nav.earn}
              <span aria-hidden className="text-[10px]">
                ▾
              </span>
            </button>
            {earnOpen ? (
              <div className="absolute left-0 top-full w-64 pt-2">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2 shadow-[var(--shadow)]">
                  {earn.map((item) => (
                    <Link
                      className="block rounded-xl px-3 py-2 hover:bg-[var(--soft)]"
                      href={item.href}
                      key={item.href}
                      onClick={() => setEarnOpen(false)}
                    >
                      <span className="text-sm font-semibold text-[var(--ink)]">
                        {item.label}
                      </span>
                      <span className="block text-xs text-[var(--muted)]">
                        {item.hint}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={`rounded-full px-3.5 py-2 text-sm font-medium ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--ink)]"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle current={locale} />
          {!authConfigured ? (
            // No accounts on this deployment. Show the old CTAs rather than a
            // disabled "Sign in", which would imply a broken feature.
            <>
              <Link className="btn btn-secondary h-10" href="/flights">
                {dict.header.searchSeats}
              </Link>
              <Link className="btn btn-accent h-10" href="/offers">
                {dict.header.browseOffers}
              </Link>
            </>
          ) : user ? (
            <>
              <Link className="btn btn-secondary h-10" href="/flights">
                {dict.header.searchSeats}
              </Link>
              <Link className="btn btn-accent h-10" href="/account">
                {dict.header.account}
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost h-10" href="/login">
                {dict.header.signIn}
              </Link>
              <Link className="btn btn-accent h-10" href="/register">
                {dict.header.getStarted}
              </Link>
            </>
          )}
        </div>

        <button
          aria-label={dict.header.menu}
          className="grid size-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--soft)] text-[var(--ink)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--line)] bg-[var(--panel)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              {dict.nav.earn}
            </p>
            {earn.map((item) => (
              <Link
                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--soft)]"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-1 border-t border-[var(--line)]" />
            {nav.map((item) => (
              <Link
                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--soft)]"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {authConfigured ? (
              user ? (
                <Link
                  className="btn btn-accent mt-2"
                  href="/account"
                  onClick={() => setOpen(false)}
                >
                  {dict.header.account}
                </Link>
              ) : (
                <>
                  <Link
                    className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--soft)]"
                    href="/login"
                    onClick={() => setOpen(false)}
                  >
                    {dict.header.signIn}
                  </Link>
                  <Link
                    className="btn btn-accent mt-2"
                    href="/register"
                    onClick={() => setOpen(false)}
                  >
                    {dict.header.getStarted}
                  </Link>
                </>
              )
            ) : (
              <Link
                className="btn btn-accent mt-2"
                href="/flights"
                onClick={() => setOpen(false)}
              >
                {dict.header.searchAwardSeats}
              </Link>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {dict.header.language}
              </span>
              <LanguageToggle current={locale} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
