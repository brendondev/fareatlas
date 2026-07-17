import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { register } from "@/lib/actions/auth";
import { isAuthConfigured } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Create your free account",
  description:
    "Free forever. Browse every offer and search Economy award seats — no card required.",
};

/** See the note in ../login/page.tsx — this check must run per request. */
export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isAuthConfigured()) notFound();

  const { next } = await searchParams;
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/account";

  return (
    <main className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <span className="pill text-[var(--accent)]">Free forever</span>
          <h1 className="section-title mt-4 text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Every offer across Qantas, Velocity, Everyday Rewards and Flybuys —
            plus Economy award search. No card required.
          </p>
        </div>

        <div className="card mt-8 p-6 sm:p-7">
          <AuthForm action={register} mode="register" next={target} />
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-[var(--muted)]">
          By creating an account you agree to our{" "}
          <a className="text-[var(--accent)] hover:underline" href="/terms">
            Terms
          </a>{" "}
          and{" "}
          <a className="text-[var(--accent)] hover:underline" href="/privacy">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
