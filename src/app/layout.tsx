import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/content";
import { getViewer } from "@/lib/dal";
import "./globals.css";

/**
 * Plus Jakarta Sans for display, Inter for everything else.
 *
 * One serif display face and two palette swaps later, the serif was the last
 * artefact of the old identity — geometric-humanist headings over Inter body
 * is the coherent voice for a single-brand-colour SaaS. Jakarta stays out of
 * body copy: at 14–16px its wide apertures cost line-length.
 *
 * Inter carries the award table, where six columns of points and dates get
 * compared down the page. `tabular-nums` is applied in globals.css.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  // No `weight`: omitting it ships the full variable `wght` range, and
  // .section-title picks 700 from it.
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading the session here opts every page into dynamic rendering, which is
  // the unavoidable price of a personalised header. Accepted for now; if TTFB
  // or crawl budget suffers, the fix is a Suspense-wrapped header slot rather
  // than dropping the check.
  //
  // This is NOT an auth boundary — layouts don't re-render on navigation. It
  // only decides which buttons to draw. Pages call the DAL themselves.
  const viewer = await getViewer();

  return (
    // `data-scroll-behavior` is required from Next 16 on: the framework no
    // longer overrides `scroll-behavior: smooth` during navigation, so without
    // it every route change animates the scroll.
    <html
      className={`${jakarta.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      lang="en-AU"
    >
      <body>
        <SiteHeader viewer={viewer} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
