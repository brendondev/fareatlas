"use client";

import { useState, type FormEvent } from "react";

/**
 * Create an award-seat watch from the flights page.
 *
 * Signed in: no email field — we already have the account address, and asking
 * for it again made this look like a newsletter box. Just the route.
 * Signed out: not rendered at all; the search panel carries the sign-up call.
 */
export function AwardWatchForm({
  signedIn,
  tier,
}: {
  signedIn: boolean;
  tier: "free" | "premium";
}) {
  const [origin, setOrigin] = useState("SYD");
  const [destination, setDestination] = useState("HND");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  if (!signedIn) return null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      // The API reads the account email and tier server-side from the session,
      // and derives the watched cabins from that tier. The body only carries
      // the route — the client is not trusted to pick cabins or identity.
      const res = await fetch("/api/watches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not save this watch.");
        return;
      }
      setStatus("ok");
      setMessage("Watching this route — we'll flag seats as they open.");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <form className="card p-5 sm:p-6" onSubmit={onSubmit}>
      <p className="text-sm font-semibold text-[var(--accent)]">
        Watch a route
      </p>
      <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
        Get told when seats open
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        We check in the background and alert you.{" "}
        {tier === "premium"
          ? "Every cabin on your plan."
          : "Economy on Free — Premium opens every cabin."}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-[var(--muted)]">
          From
          <input
            className="mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm uppercase text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            maxLength={3}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            required
            value={origin}
          />
        </label>
        <label className="text-xs font-semibold text-[var(--muted)]">
          To
          <input
            className="mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm uppercase text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            maxLength={3}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            required
            value={destination}
          />
        </label>
      </div>

      <button
        className="btn btn-accent mt-4 w-full"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? "Saving…" : "Watch this route"}
      </button>

      {message ? (
        <p
          className={`mt-3 text-sm ${
            status === "error" ? "text-[var(--danger)]" : "text-[var(--good)]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
