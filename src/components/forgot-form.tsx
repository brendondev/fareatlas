"use client";

import { useActionState } from "react";
import { type ForgotState, requestReset } from "@/lib/actions/reset";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState<ForgotState, FormData>(
    requestReset,
    undefined,
  );

  if (state?.ok) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-lg font-semibold text-[var(--accent)]">
          Check your inbox
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card p-6">
      {state?.message ? (
        <p className="mb-4 rounded-xl bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/25">
          {state.message}
        </p>
      ) : null}

      <label className="block text-sm font-semibold" htmlFor="email">
        Email
      </label>
      <input
        autoComplete="email"
        className="mt-1.5 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        id="email"
        name="email"
        required
        type="email"
      />

      <button
        className="btn btn-accent mt-5 w-full"
        disabled={pending}
        type="submit"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
