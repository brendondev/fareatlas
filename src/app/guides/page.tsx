import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/dal";
import { getGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Expert guides",
  description:
    "Plain-English guides to earning and burning Australian frequent-flyer points — starting with the one number that decides points vs cash.",
};

export default async function GuidesPage() {
  const [guides, viewer] = await Promise.all([getGuides(), getViewer()]);
  const isPremium = viewer.tier === "premium";

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <span className="pill text-[var(--accent)]">Guides</span>
        <h1 className="section-title mt-4">Learn the points game</h1>
        <p className="section-lead">
          No fluff, no affiliate padding — just how to tell a good redemption
          from a bad one, and where Australian points punch above their weight.
        </p>
      </div>

      {guides.length ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => {
            const locked = guide.tier === "premium" && !isPremium;
            return (
              <Link
                className="card group flex flex-col p-5 transition hover:border-[var(--line-strong)]"
                href={`/guides/${guide.slug}`}
                key={guide.slug}
              >
                <div className="flex items-center gap-2">
                  <span className="pill text-[var(--muted)]">
                    {guide.level === "advanced" ? "Advanced" : "Starter"}
                  </span>
                  {guide.tier === "premium" ? (
                    <span className="pill text-[var(--accent)]">
                      {locked ? "🔒 Premium" : "Premium"}
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-4 font-display text-lg font-semibold leading-snug">
                  {guide.title}
                </h2>
                {/* Title and excerpt stay visible even when locked — that's the
                    SEO surface and the reason to upgrade. Only the body is
                    gated, in the page. */}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                  {guide.excerpt}
                </p>

                <p className="mt-4 text-xs text-[var(--muted)]">
                  {guide.readingMinutes} min read
                  {locked ? " · Premium" : ""}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] p-8 text-center text-sm text-[var(--muted)]">
          Guides are on the way.
        </p>
      )}
    </main>
  );
}
