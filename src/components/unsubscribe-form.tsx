"use client";

import { useActionState } from "react";
import { unsubscribeWatch, type UnsubState } from "@/lib/actions/unsubscribe";

export function UnsubscribeForm({
  token,
  route,
}: {
  token: string;
  route: string | null;
}) {
  const [state, formAction, pending] = useActionState<UnsubState, FormData>(
    unsubscribeWatch,
    undefined,
  );

  if (state?.done) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-lg font-semibold text-[var(--accent)]">
          Unsubscribed
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You won&apos;t get more alerts for this route.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card p-6 text-center">
      <input name="token" type="hidden" value={token} />
      <p className="text-sm text-[var(--ink-soft)]">
        Stop watching{" "}
        <strong>{route ?? "this route"}</strong> and get no more alerts for it?
      </p>
      {state?.error ? (
        <p className="mt-3 text-sm text-[var(--danger)]">{state.error}</p>
      ) : null}
      <button
        className="btn btn-accent mt-5 w-full"
        disabled={pending}
        type="submit"
      >
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </button>
    </form>
  );
}
