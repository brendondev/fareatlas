import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForgotForm } from "@/components/forgot-form";
import { isAuthConfigured } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Reset your password" };
export const dynamic = "force-dynamic";

export default function ForgotPage() {
  if (!isAuthConfigured()) notFound();

  return (
    <main className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="section-title text-3xl">Reset your password</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            We&apos;ll email you a link to set a new one.
          </p>
        </div>

        <div className="mt-8">
          <ForgotForm />
        </div>

        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          Remembered it?{" "}
          <Link className="font-semibold text-[var(--accent)] hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
