import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { deleteWatch } from "@/lib/actions/account";
import { isAuthConfigured } from "@/lib/auth-config";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";
import { entitlementsFor } from "@/lib/entitlements";

export const metadata: Metadata = { title: "Watched routes" };
export const dynamic = "force-dynamic";

function relativeTime(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

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

  const emailNote = isEmailConfigured()
    ? null
    : "Email delivery isn't switched on yet, so alerts show here rather than in your inbox for now.";

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
              <div className="min-w-0">
                <p className="font-semibold tabular">
                  {watch.origin} ✈ {watch.destination}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {watch.cabins.split(",").join(" · ")}
                </p>
                {watch.lastHitSummary ? (
                  <p className="mt-1.5 text-xs font-semibold text-[var(--accent)]">
                    ✈ Seats found · {watch.lastHitSummary}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-[var(--muted)]">
                    {watch.lastCheckedAt
                      ? `Checked ${relativeTime(watch.lastCheckedAt)} · no seats yet`
                      : "Not checked yet"}
                  </p>
                )}
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
        We check your routes in the background and email you when seats open —
        Economy on Free, every cabin on Premium. Availability moves fast, so
        confirm with the program before you rely on it.
        {emailNote ? ` ${emailNote}` : ""}
      </p>
    </main>
  );
}
