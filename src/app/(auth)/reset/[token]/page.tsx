import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResetForm } from "@/components/reset-form";
import { isAuthConfigured } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function ResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!isAuthConfigured()) notFound();

  const { token } = await params;

  return (
    <main className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="section-title text-3xl">Set a new password</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Choose something you don&apos;t use anywhere else.
          </p>
        </div>

        <div className="mt-8">
          {/* The token is validated when the form is submitted, not here — so a
              scraped or expired link shows the form, then a clear error on
              submit rather than leaking whether the token exists on GET. */}
          <ResetForm token={token} />
        </div>
      </div>
    </main>
  );
}
