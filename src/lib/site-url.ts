/**
 * Canonical absolute base URL for links in emails.
 *
 * NEXT_PUBLIC_SITE_URL is the real domain; VERCEL_URL is the deployment-
 * specific host (works, but ugly and changes per deploy); localhost is the
 * dev fallback. Set NEXT_PUBLIC_SITE_URL in production for clean links.
 */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}
