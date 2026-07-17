import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { deleteWatch } from "@/lib/actions/account";
import { isAuthConfigured } from "@/lib/auth-config";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { entitlementsFor } from "@/lib/entitlements";

export const metadata: Metadata = { title: "Watched routes" };
export const dynamic = "force-dynamic";

export default async function WatchesPage() {
  if (!isAuthConfigured()) notFound();
  const { user, tier } = await requireUser("/account/watches");

  const watches = await prisma.awardWatch
    .findMany({
      where: { userId: user!.id, status: "active" },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const limit = entitlementsFor(tier).maxWatches;
  const limitLabel = Number.isFinite(limit) ? `${limit}` : "Unlimited";

  return (
    <main className="container-page py-12 sm:py-16">
      <AccountNav active="watches" />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Watched routes</h1>
          <p className="section-lead">
            {watches.length} of {limitLabel} on the{" "}
            {tier === "premium" ? "Premium" : "Free"} plan.
          </p>
        </div>
        <Link className="btn btn-accent" href="/flights">
          Add a route
        </Link>
      </div>

      {watches.length ? (
        <ul className="mt-8 space-y-2">
          {watches.map((watch) => (
            <li
              className="card flex flex-wrap items-center justify-between gap-3 p-4"
              key={watch.id}
            >
              <div>
                <p className="font-semibold tabular">
                  {watch.origin} ✈ {watch.destination}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {watch.cabins.split(",").join(" · ")}
                </p>
              </div>
              <form action={deleteWatch}>
                <input name="watchId" type="hidden" value={watch.id} />
                <button className="btn btn-secondary h-9" type="submit">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-[var(--line-strong)] p-8 text-center text-sm text-[var(--muted)]">
          No routes watched yet.{" "}
          <Link className="text-[var(--accent)] hover:underline" href="/flights">
            Search award seats
          </Link>{" "}
          and add one.
        </p>
      )}

      <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
        Alerting isn&apos;t switched on yet — we save these so they&apos;re ready
        the day it is. Nothing emails you until then.
      </p>
    </main>
  );
}
