import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UpgradePanel } from "@/components/upgrade-panel";
import { getViewer } from "@/lib/dal";
import { getGuideHtml, getGuideMeta, getGuides } from "@/lib/guides";

/** Free guides prerender; premium ones render on demand (they need the viewer). */
export async function generateStaticParams() {
  const guides = await getGuides();
  return guides
    .filter((guide) => guide.tier === "free")
    .map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideMeta(slug);
  if (!guide) return { title: "Guide not found" };
  return { title: guide.title, description: guide.excerpt };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuideMeta(slug);
  if (!guide) notFound();

  const viewer = await getViewer();
  const locked = guide.tier === "premium" && viewer.tier !== "premium";

  // The gate is here, BEFORE the body is read. A locked guide never calls
  // getGuideHtml, so the premium text never enters the DOM to be un-hidden.
  const html = locked ? null : await getGuideHtml(slug);

  return (
    <main className="container-page py-12 sm:py-16">
      <article className="mx-auto max-w-2xl">
        <Link
          className="text-sm font-semibold text-[var(--accent)] hover:underline"
          href="/guides"
        >
          ← All guides
        </Link>

        <div className="mt-5 flex items-center gap-2">
          <span className="pill text-[var(--muted)]">
            {guide.level === "advanced" ? "Advanced" : "Starter"}
          </span>
          {guide.tier === "premium" ? (
            <span className="pill text-[var(--accent)]">Premium</span>
          ) : null}
          <span className="text-xs text-[var(--muted)]">
            {guide.readingMinutes} min read
          </span>
        </div>

        <h1 className="section-title mt-4">{guide.title}</h1>
        <p className="section-lead">{guide.excerpt}</p>

        <hr className="my-8 border-[var(--line)]" />

        {locked ? (
          <UpgradePanel
            body="This guide is part of Premium. Everything in the starter guides is free forever — the advanced strategy pieces come with Premium."
            cta="See Premium"
            signedIn={Boolean(viewer.user)}
            title="This is a Premium guide"
          />
        ) : (
          <div
            className="prose-guide"
            // Content is our own trusted markdown, rendered server-side by remark.
            dangerouslySetInnerHTML={{ __html: html ?? "" }}
          />
        )}
      </article>
    </main>
  );
}
