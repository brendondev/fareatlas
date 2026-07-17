/** Shared header + data-source note for the three vertical pages. */
export function VerticalShell({
  eyebrow,
  title,
  lead,
  source,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  source: "neon" | "fallback";
  children: React.ReactNode;
}) {
  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <span className="pill text-[var(--accent)]">{eyebrow}</span>
        <h1 className="section-title mt-4">{title}</h1>
        <p className="section-lead">{lead}</p>
      </div>

      {source === "fallback" ? (
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-xs text-[var(--muted)]">
          Demo data — connect the database to show live listings.
        </p>
      ) : null}

      <div className="mt-8">{children}</div>
    </main>
  );
}

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const money2 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 2,
});

const points = new Intl.NumberFormat("en-AU");

export function ProgramBadge({
  name,
  color,
}: {
  name: string | null;
  color: string | null;
}) {
  if (!name) return null;
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
      style={{ background: color ?? "#555" }}
    >
      {name}
    </span>
  );
}

export { money, money2, points };
