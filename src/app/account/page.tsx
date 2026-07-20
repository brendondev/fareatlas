import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { logout } from "@/lib/actions/auth";
import { isAuthConfigured } from "@/lib/auth-config";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Your account",
};

/** Never prerender an account page. See ../(auth)/login/page.tsx. */
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!isAuthConfigured()) notFound();

  // The proxy already bounced cookie-less requests, but that check is
  // optimistic and unsigned. This is the one that actually decides.
  const { user, tier } = await requireUser("/account");

  const watches = await prisma.awardWatch
    .findMany({
      where: { userId: user!.id, status: "active" },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
    .catch(() => []);

  return (
    <main className="container-page py-12 sm:py-16">
      <AccountNav active="overview" />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="pill text-[var(--accent)]">
            {tier === "premium" ? "Premium" : "Free plan"}
          </span>
          <h1 className="section-title mt-4">
            {user!.name ? `Hello, ${user!.name}` : "Your account"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{user!.email}</p>
        </div>
        <form action={logout}>
          <button className="btn btn-secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Watched routes</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Routes you asked us to keep an eye on.
          </p>

          {watches.length ? (
            <ul className="mt-5 space-y-2">
              {watches.map((watch) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--soft)] px-3 py-2.5 text-sm"
                  key={watch.id}
                >
                  <span className="font-semibold tabular">
                    {watch.origin} ✈ {watch.destination}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {watch.cabins.split(",").join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-[var(--line-strong)] px-4 py-6 text-center text-sm text-[var(--muted)]">
              No routes watched yet.{" "}
              <Link className="text-[var(--accent)] hover:underline" href="/flights">
                Search award seats
              </Link>{" "}
              to add one.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="btn btn-secondary h-9" href="/alerts">
              Manage alerts
            </Link>
            <Link className="btn btn-secondary h-9" href="/account/programs">
              Your programs
            </Link>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
            We watch these in the background and flag seats as they open. Manage
            them to see the latest.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">Your plan</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {tier === "premium"
              ? "Every cabin and the full 12-month award window."
              : "Economy award search across the next 90 days, and every offer."}
          </p>
          {tier === "free" ? (
            <Link className="btn btn-accent mt-5 w-full" href="/pricing">
              See Premium
            </Link>
          ) : null}
        </section>
      </div>
    </main>
  );
}
