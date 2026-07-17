"use client";

import { useState, type FormEvent } from "react";

export function AwardWatchForm() {
  const [email, setEmail] = useState("");
  const [origin, setOrigin] = useState("SYD");
  const [destination, setDestination] = useState("HND");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/watches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          origin,
          destination,
          cabins: "economy,premium,business",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not save alert.");
        return;
      }
      setStatus("ok");
      setMessage(
        data.source === "fallback"
          ? "Saved locally for demo. Connect Neon to persist watches."
          : "You're on the list — we'll watch this route for award seats.",
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <form className="card p-5 sm:p-6" onSubmit={onSubmit}>
      <p className="text-sm font-semibold text-[var(--accent)]">
        Award seat alert
      </p>
      <h3 className="mt-1 text-xl font-bold tracking-tight">
        Tell us where you want to fly
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Free email capture for now. Premium unlimited alerts land with Stripe +
        Resend.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-semibold text-[var(--muted)]">
          Email
          <input
            className="mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            type="email"
            value={email}
          />
        </label>
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
        className="btn btn-primary mt-4 w-full sm:w-auto"
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
