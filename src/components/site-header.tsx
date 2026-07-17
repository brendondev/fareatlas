"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/lib/content";

const NAV = [
  { href: "/offers", label: "Offers" },
  { href: "/flights", label: "Flights" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)]/80 bg-[rgba(247,244,239,0.85)] backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-2.5" href="/">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white shadow-[var(--shadow-sm)]">
            FA
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight">
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
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
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
          <Link className="btn btn-secondary h-10" href="/flights">
            Search seats
          </Link>
          <Link className="btn btn-coral h-10" href="/offers">
            Browse offers
          </Link>
        </div>

        <button
          aria-label="Menu"
          className="grid size-10 place-items-center rounded-xl border border-[var(--line)] bg-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--line)] bg-white px-4 py-4 md:hidden">
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
            <Link
              className="btn btn-coral mt-2"
              href="/flights"
              onClick={() => setOpen(false)}
            >
              Search award seats
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
