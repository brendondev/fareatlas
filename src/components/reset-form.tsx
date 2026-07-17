"use client";

import { useActionState } from "react";
import { performReset, type ResetState } from "@/lib/actions/reset";

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    performReset,
    undefined,
  );

  return (
    <form action={formAction} className="card p-6">
      <input name="token" type="hidden" value={token} />

      {state?.message ? (
        <p className="mb-4 rounded-xl bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/25">
          {state.message}
        </p>
      ) : null}

      <label className="block text-sm font-semibold" htmlFor="password">
        New password
      </label>
      <input
        autoComplete="new-password"
        className="mt-1.5 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        id="password"
        name="password"
        required
        type="password"
      />
      {state?.errors?.password ? (
        <p className="mt-1.5 text-xs text-[var(--danger)]">
          {state.errors.password[0]}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-[var(--muted)]">At least 10 characters.</p>
      )}

      <button
        className="btn btn-accent mt-5 w-full"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
