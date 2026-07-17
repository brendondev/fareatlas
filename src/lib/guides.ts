import "server-only";

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { remark } from "remark";
import remarkHtml from "remark-html";
import type { Tier } from "./dal";

const GUIDES_DIR = join(process.cwd(), "content", "guides");

export type GuideLevel = "starter" | "advanced";

export type GuideMeta = {
  slug: string;
  title: string;
  excerpt: string;
  level: GuideLevel;
  tier: Tier;
  readingMinutes: number;
  publishedAt: string;
  updatedAt: string;
};

/**
 * Guides are markdown in the repo, not rows in a table. They are versioned
 * prose — they belong in git with diffs and review, not in a console with no
 * history. They also render with DATABASE_URL unset (free ones show; premium
 * ones show the upgrade panel because getViewer() returns free), which is the
 * degrade-honestly behaviour for free.
 */

function parseFront(slug: string, raw: string): GuideMeta {
  const { data } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ""),
    level: data.level === "advanced" ? "advanced" : "starter",
    tier: data.tier === "premium" ? "premium" : "free",
    readingMinutes: Number(data.readingMinutes) || 5,
    publishedAt: String(data.publishedAt ?? ""),
    updatedAt: String(data.updatedAt ?? data.publishedAt ?? ""),
  };
}

/** All guide metadata, newest first. Never reads bodies. */
export const getGuides = cache(async (): Promise<GuideMeta[]> => {
  let files: string[];
  try {
    files = await readdir(GUIDES_DIR);
  } catch {
    return [];
  }

  const guides = await Promise.all(
    files
      .filter((name) => name.endsWith(".md"))
      .map(async (name) => {
        const slug = name.replace(/\.md$/, "");
        const raw = await readFile(join(GUIDES_DIR, name), "utf8");
        return parseFront(slug, raw);
      }),
  );

  return guides.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
});

export const getGuideMeta = cache(
  async (slug: string): Promise<GuideMeta | null> => {
    const all = await getGuides();
    return all.find((guide) => guide.slug === slug) ?? null;
  },
);

/**
 * Renders a guide's body to HTML.
 *
 * The caller MUST decide access before calling this. It is a separate function
 * from the metadata on purpose: rendering the body into the DOM and hiding it
 * with CSS is the classic paywall leak, so a premium body is never read for a
 * viewer who can't see it. See the page for the gate.
 */
export const getGuideHtml = cache(async (slug: string): Promise<string | null> => {
  if (!/^[a-z0-9-]+$/.test(slug)) return null; // no path traversal

  let raw: string;
  try {
    raw = await readFile(join(GUIDES_DIR, `${slug}.md`), "utf8");
  } catch {
    return null;
  }

  const { content } = matter(raw);
  const processed = await remark().use(remarkHtml).process(content);
  return String(processed);
});
