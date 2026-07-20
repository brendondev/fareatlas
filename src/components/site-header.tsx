"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/lib/content";
import type { Viewer } from "@/lib/dal";

// "Earn" groups the accumulation verticals — seven flat links overflowed the
// bar, and these belong together conceptually (ways to earn points on spend).
const EARN = [
  { href: "/offers", label: "Offers", hint: "Bonus point promotions" },
  { href: "/wine", label: "Wine", hint: "Ranked by cost per 1,000 points" },
  { href: "/gift-cards", label: "Gift cards", hint: "Best points per dollar" },
  { href: "/cards", label: "Cards & perks", hint: "Sign-up bonuses" },
];

const NAV = [
  { href: "/flights", label: "Flights" },
  // Alerts is inserted between Flights and Marketplace when auth is switched
  // on — it's account-gated and would frustrate an anonymous click.
  { href: "/marketplace", label: "Marketplace" },
  { href: "/partners", label: "Partners" },
  { href: "/perks", label: "Perks" },
  { href: "/guides", label: "Guides" },
  { href: "/pricing", label: "Pricing" },
];

const ALERTS_ITEM = { href: "/alerts", label: "Alerts" } as const;

/**
 * `viewer` arrives as a prop from the root layout: this is a client component
 * and must not reach into the DAL. It decides which buttons to draw, nothing
 * more — the pages themselves enforce access.
 */
export function SiteHeader({ viewer }: { viewer: Viewer }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [earnOpen, setEarnOpen] = useState(false);
  const { authConfigured, user } = viewer;
  const earnActive = EARN.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  // Inject Alerts right after Flights when auth is switched on.
  const nav = authConfigured
    ? [NAV[0]!, ALERTS_ITEM, ...NAV.slice(1)]
    : NAV;

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
              Points · cash · awards
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
              Earn
              <span aria-hidden className="text-[10px]">
                ▾
              </span>
            </button>
            {earnOpen ? (
              <div className="absolute left-0 top-full w-64 pt-2">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2 shadow-[var(--shadow)]">
                  {EARN.map((item) => (
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
          {!authConfigured ? (
            // No accounts on this deployment. Show the old CTAs rather than a
            // disabled "Sign in", which would imply a broken feature.
            <>
              <Link className="btn btn-secondary h-10" href="/flights">
                Search seats
              </Link>
              <Link className="btn btn-accent h-10" href="/offers">
                Browse offers
              </Link>
            </>
          ) : user ? (
            <>
              <Link className="btn btn-secondary h-10" href="/flights">
                Search seats
              </Link>
              <Link className="btn btn-accent h-10" href="/account">
                Account
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost h-10" href="/login">
                Sign in
              </Link>
              <Link className="btn btn-accent h-10" href="/register">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Menu"
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
              Earn
            </p>
            {EARN.map((item) => (
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
                  Account
                </Link>
              ) : (
                <>
                  <Link
                    className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--soft)]"
                    href="/login"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    className="btn btn-accent mt-2"
                    href="/register"
                    onClick={() => setOpen(false)}
                  >
                    Get started
                  </Link>
                </>
              )
            ) : (
              <Link
                className="btn btn-accent mt-2"
                href="/flights"
                onClick={() => setOpen(false)}
              >
                Search award seats
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
