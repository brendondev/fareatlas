import type { OfferView } from "@/lib/offers";

export function OfferCard({ offer }: { offer: OfferView }) {
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden p-5">
      {offer.featured ? (
        <span className="absolute right-4 top-4 rounded-full bg-[var(--coral-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--coral-strong)]">
          🔥 Hot
        </span>
      ) : null}

      <div className="flex items-center gap-2 pr-16">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
          style={{ background: offer.programColor }}
        >
          {offer.shortCode}
        </span>
        <span className="text-xs font-medium text-[var(--muted)]">
          {offer.programName}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-[var(--ink)]">
        {offer.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
        {offer.summary}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">
            {offer.estimate ?? "Bonus points"}
          </p>
          <p className="mt-0.5 text-xs capitalize text-[var(--muted)]">
            {offer.category} · {offer.expiresLabel}
          </p>
        </div>
        {offer.url ? (
          <a
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--soft)]"
            href={offer.url}
            rel="noreferrer"
            target="_blank"
          >
            View
          </a>
        ) : (
          <span className="rounded-full bg-[var(--soft)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
            Tracked
          </span>
        )}
      </div>
    </article>
  );
}
