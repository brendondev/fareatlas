import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/content";
import "./globals.css";

/**
 * Fraunces for display, Inter for everything else.
 *
 * The reflex "premium serif" is a Didone (Playfair, Cormorant), and it is the
 * wrong call on a near-black page: high-contrast hairlines get eaten by the
 * surrounding field and shimmer on scroll. Fraunces is a variable soft-serif
 * with a real optical-size axis and moderate stroke contrast, so it survives
 * on obsidian. Headings and figures only — never body copy.
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
  // `opsz` is the axis that makes this work on a dark page; `SOFT` rounds the
  // terminals, which sits with champagne rather than chrome. `WONK` is left
  // out — it is pure flourish and costs payload.
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
