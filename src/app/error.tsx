"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app]", error);
  }, [error]);

  return (
    <main className="container-page py-20">
      <div className="card mx-auto max-w-lg p-8 text-center">
        <span className="pill">Something broke</span>
        <h1 className="section-title mt-4 text-2xl">
          That page didn&apos;t load
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          The error is on our side, not yours. Offers and award searches are
          unaffected — try again, and if it keeps happening, let us know.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Reference: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button className="btn btn-primary" onClick={reset} type="button">
            Try again
          </button>
          <Link className="btn btn-secondary" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
