"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/lib/actions/waitlist";

export function WaitlistForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, formAction, pending] = useActionState<WaitlistState, FormData>(
    joinWaitlist,
    undefined,
  );

  if (state?.ok) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-lg font-semibold text-[var(--accent)]">
          You&apos;re on the list
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card p-6">
      <h2 className="font-display text-xl font-semibold">
        Get told when Premium opens
      </h2>
      <p className="mt-1.5 text-sm text-[var(--muted)]">
        No card, no charge — Premium isn&apos;t for sale yet. We&apos;ll email
        you once, when it is.
      </p>

      {state?.message ? (
        <p className="mt-4 rounded-xl bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/25">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="sr-only" htmlFor="waitlist-email">
            Email
          </label>
          <input
            className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            defaultValue={defaultEmail}
            id="waitlist-email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          {state?.errors?.email ? (
            <p className="mt-1.5 text-xs text-[var(--danger)]">
              {state.errors.email[0]}
            </p>
          ) : null}
        </div>
        <button className="btn btn-accent" disabled={pending} type="submit">
          {pending ? "Adding…" : "Join the waitlist"}
        </button>
      </div>
    </form>
  );
}
