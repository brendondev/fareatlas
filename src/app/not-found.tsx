import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="container-page py-20">
      <div className="card mx-auto max-w-lg p-8 text-center">
        <span className="pill">404</span>
        <h1 className="section-title mt-4 text-2xl">
          There&apos;s nothing at this address
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          The link may be old, or the page may have moved.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" href="/offers">
            Browse offers
          </Link>
          <Link className="btn btn-secondary" href="/flights">
            Search award seats
          </Link>
        </div>
      </div>
    </main>
  );
}
