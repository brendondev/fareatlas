"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/lib/validation/auth";

type Action = (
  state: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

export function AuthForm({
  action,
  mode,
  next,
}: {
  action: Action;
  mode: "login" | "register";
  next: string;
}) {
  // `useActionState`, not the removed `useFormState`. `pending` is the third
  // element, so no `useFormStatus` child component is needed.
  const [state, formAction, pending] = useActionState(action, undefined);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="space-y-4">
      <input name="next" type="hidden" value={next} />

      {state?.message ? (
        <p
          className="rounded-2xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/25"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      {isRegister ? (
        <Field
          autoComplete="name"
          errors={state?.errors?.name}
          hint="Optional."
          id="name"
          label="Name"
          type="text"
        />
      ) : null}

      <Field
        autoComplete="email"
        errors={state?.errors?.email}
        id="email"
        label="Email"
        required
        type="email"
      />

      <Field
        autoComplete={isRegister ? "new-password" : "current-password"}
        errors={state?.errors?.password}
        hint={isRegister ? "At least 10 characters." : undefined}
        id="password"
        label="Password"
        required
        type="password"
      />

      <button
        className="btn btn-accent w-full"
        disabled={pending}
        type="submit"
      >
        {pending
          ? isRegister
            ? "Creating account…"
            : "Signing in…"
          : isRegister
            ? "Create free account"
            : "Sign in"}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link
              className="font-semibold text-[var(--accent)] hover:underline"
              href="/login"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account yet?{" "}
            <Link
              className="font-semibold text-[var(--accent)] hover:underline"
              href="/register"
            >
              Create one free
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  autoComplete,
  errors,
  hint,
  id,
  label,
  required,
  type,
}: {
  autoComplete: string;
  errors?: string[];
  hint?: string;
  id: string;
  label: string;
  required?: boolean;
  type: string;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={errors?.length ? errorId : hint ? hintId : undefined}
        aria-invalid={errors?.length ? true : undefined}
        autoComplete={autoComplete}
        className={`mt-1.5 h-11 w-full rounded-xl border bg-[var(--soft)] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${
          errors?.length ? "border-[var(--danger)]" : "border-[var(--line)]"
        }`}
        id={id}
        name={id}
        required={required}
        type={type}
      />
      {errors?.length ? (
        <p className="mt-1.5 text-xs text-[var(--danger)]" id={errorId}>
          {errors[0]}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-[var(--muted)]" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
