"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/lib/content";
import type { Viewer } from "@/lib/dal";

const NAV = [
  { href: "/offers", label: "Offers" },
  { href: "/flights", label: "Flights" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * `viewer` arrives as a prop from the root layout: this is a client component
 * and must not reach into the DAL. It decides which buttons to draw, nothing
 * more — the pages themselves enforce access.
 */
export function SiteHeader({ viewer }: { viewer: Viewer }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { authConfigured, user } = viewer;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(11,13,16,0.72)] backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-2.5" href="/">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] font-display text-sm font-bold text-[#0b0d10]">
            FA
          </span>
          <span>
            <span className="block font-display text-base font-semibold tracking-tight">
              {SITE.name}
            </span>
            <span className="hidden text-[11px] font-medium text-[var(--muted)] sm:block">
              Points · cash · awards
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
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
            {NAV.map((item) => (
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
