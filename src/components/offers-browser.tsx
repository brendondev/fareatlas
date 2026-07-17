"use client";

import { useMemo, useState } from "react";
import { OfferCard } from "@/components/offer-card";
import type { OfferView } from "@/lib/offers";
import { PROGRAMS } from "@/lib/programs";

export function OffersBrowser({
  offers,
  source,
}: {
  offers: OfferView[];
  source: "neon" | "fallback";
}) {
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers.filter((offer) => {
      if (program !== "all" && offer.programSlug !== program) return false;
      if (!q) return true;
      return (
        offer.title.toLowerCase().includes(q) ||
        offer.summary.toLowerCase().includes(q) ||
        offer.category.toLowerCase().includes(q) ||
        offer.programName.toLowerCase().includes(q)
      );
    });
  }, [offers, program, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
              program === "all"
                ? "bg-[var(--accent)] text-[#0b0d10]"
                : "bg-[var(--soft)] text-[var(--muted)] ring-1 ring-[var(--line)] hover:text-[var(--ink)]"
            }`}
            onClick={() => setProgram("all")}
            type="button"
          >
            All
          </button>
          {PROGRAMS.map((p) => (
            <button
              className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                program === p.slug
                  ? "text-white"
                  : "bg-[var(--soft)] text-[var(--muted)] ring-1 ring-[var(--line)] hover:text-[var(--ink)]"
              }`}
              key={p.slug}
              onClick={() => setProgram(p.slug)}
              style={
                program === p.slug ? { background: p.color } : undefined
              }
              type="button"
            >
              {p.shortCode}
            </button>
          ))}
        </div>
        <input
          className="h-11 w-full rounded-full border border-[var(--line)] bg-[var(--soft)] px-4 text-sm shadow-[var(--shadow-sm)] outline-none ring-[var(--accent)] focus:ring-2 sm:max-w-xs"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search offers…"
          value={query}
        />
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        {filtered.length} offer{filtered.length === 1 ? "" : "s"} · source:{" "}
        {source === "neon" ? "Neon database" : "demo catalogue"}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>

      {!filtered.length ? (
        <div className="card mt-4 p-8 text-center text-sm text-[var(--muted)]">
          No offers match this filter. Try another program or clear search.
        </div>
      ) : null}
    </div>
  );
}
