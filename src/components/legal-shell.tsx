import { LEGAL } from "@/lib/content";

/**
 * Shared chrome for /privacy, /terms and /contact. Prose styling lives here so
 * the three pages stay visually identical and the redesign has one target.
 */
export function LegalShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <main className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <span className="pill">Last updated {LEGAL.lastUpdated}</span>
        <h1 className="section-title mt-4">{title}</h1>
        <p className="section-lead">{lead}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--ink-soft)] [&_a]:font-semibold [&_a]:text-[var(--accent)] [&_a:hover]:underline [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold tracking-tight text-[var(--ink)]">
        {heading}
      </h2>
      {children}
    </section>
  );
}
