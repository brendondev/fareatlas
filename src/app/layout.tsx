import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/content";
import { getViewer } from "@/lib/dal";
import "./globals.css";

/**
 * Fraunces for display, Inter for everything else.
 *
 * Fraunces is a variable soft-serif with a real optical-size axis and moderate
 * stroke contrast — it reads warm next to the navy body copy without the icy
 * hairlines of a Didone (Playfair, Cormorant). Headings and figures only,
 * never body copy: on a light page long-form serif at 14–16px slows scanning.
 *
 * Inter carries the award table, where six columns of points and dates get
 * compared down the page. `tabular-nums` is applied in globals.css.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  // No `weight`: that would pin the font and next/font rejects `axes` on a
  // pinned variable font. Omitting it ships the full `wght` range.
  // `opsz` gives the terminals room to breathe at display sizes; `SOFT`
  // rounds them, which sits with the amber accent rather than chrome.
  // `WONK` is left out — pure flourish and costs payload.
  axes: ["opsz", "SOFT"],
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
      className={`${fraunces.variable} ${inter.variable}`}
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
