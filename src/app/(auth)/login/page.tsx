import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { login } from "@/lib/actions/auth";
import { isAuthConfigured } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to FareAtlas to track offers and award seats.",
};

/**
 * Whether accounts exist is an environment fact, not a build-time one. Left to
 * prerender, `notFound()` would run once during the build and be baked into
 * static HTML, so a deploy whose env differs from its build would serve the
 * wrong answer forever.
 *
 * Note the response is still HTTP 200, not 404, and that is correct: the root
 * `loading.tsx` makes every route stream, headers go out before `notFound()`
 * resolves, and the status can no longer change. Next compensates by emitting
 * `<meta name="robots" content="noindex">`, which is verified and is why this
 * doesn't become a soft-404 in search. See `not-found.md` and `loading.md`
 * ("Status Codes") in the bundled docs before "fixing" this.
 */
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Not a disabled form: on a deployment without a database, accounts genuinely
  // do not exist. A greyed-out button would imply the feature is here and broken.
  if (!isAuthConfigured()) notFound();

  const { next } = await searchParams;
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/account";

  return (
    <main className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="section-title text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Pick up your programs, routes and alerts.
          </p>
        </div>

        <div className="card mt-8 p-6 sm:p-7">
          <AuthForm action={login} mode="login" next={target} />
        </div>
      </div>
    </main>
  );
}
