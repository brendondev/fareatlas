import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewAlertModal } from "@/components/new-alert-modal";
import { deleteAlert } from "@/lib/actions/alerts";
import { airportByIata } from "@/lib/airports";
import { isAuthConfigured } from "@/lib/auth-config";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";
import { entitlementsFor } from "@/lib/entitlements";

export const metadata: Metadata = { title: "Flight alerts" };
export const dynamic = "force-dynamic";

const CABIN_LABEL: Record<string, string> = {
  economy: "Economy",
  premium: "Premium Economy",
  business: "Business",
  first: "First",
};

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function relativeTime(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function windowLabel(startDate: Date | null, endDate: Date | null): string {
  if (!startDate && !endDate) return "Any date";
  if (startDate && endDate) {
    if (startDate.getTime() === endDate.getTime()) {
      return dateFormatter.format(startDate);
    }
    return `${dateFormatter.format(startDate)} → ${dateFormatter.format(endDate)}`;
  }
  if (startDate) return `From ${dateFormatter.format(startDate)}`;
  return `Until ${dateFormatter.format(endDate!)}`;
}

function airportLabel(iata: string): string {
  const airport = airportByIata(iata);
  return airport ? `${airport.city} (${airport.iata})` : iata;
}

export default async function AlertsPage() {
  if (!isAuthConfigured()) notFound();
  const { user, tier } = await requireUser("/alerts");

  const alerts = await prisma.awardWatch
    .findMany({
      where: { userId: user!.id, status: "active" },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const limit = entitlementsFor(tier).maxWatches;
  const limitLabel = Number.isFinite(limit) ? `${limit}` : "Unlimited";
  const atLimit = Number.isFinite(limit) && alerts.length >= limit;

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="pill text-[var(--accent)]">
            <BellIcon /> Flight alerts
          </span>
          <h1 className="section-title mt-4">Flight alerts</h1>
          <p className="section-lead">
            Manage the routes and dates you want award-seat alerts for.{" "}
            {alerts.length} of {limitLabel} on the{" "}
            {tier === "premium" ? "Premium" : "Free"} plan.
          </p>
        </div>
        {!atLimit ? <NewAlertModal label="New alert" /> : null}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
          <PlaneIcon /> Your alerts
        </div>

        {alerts.length ? (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li
                className="card flex flex-wrap items-center justify-between gap-3 p-4"
                key={alert.id}
              >
                <div className="min-w-0">
                  <p className="font-semibold tabular">
                    {airportLabel(alert.origin)} ✈ {airportLabel(alert.destination)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {alert.cabins
                      .split(",")
                      .map((c) => CABIN_LABEL[c.trim()] ?? c.trim())
                      .join(" · ")}
                    {" · "}
                    {windowLabel(alert.startDate, alert.endDate)}
                  </p>
                  {alert.lastHitSummary ? (
                    <p className="mt-1.5 text-xs font-semibold text-[var(--accent)]">
                      ✈ Seats found · {alert.lastHitSummary}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-[var(--muted)]">
                      {alert.lastCheckedAt
                        ? `Checked ${relativeTime(alert.lastCheckedAt)} · no seats yet`
                        : "Not checked yet"}
                    </p>
                  )}
                </div>
                <form action={deleteAlert}>
                  <input name="alertId" type="hidden" value={alert.id} />
                  <button className="btn btn-secondary h-9" type="submit">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <div className="card grid place-items-center gap-3 p-10 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <PlaneIcon size={26} />
            </div>
            <p className="font-display text-lg font-semibold">
              No flight alerts yet
            </p>
            <p className="max-w-md text-sm text-[var(--muted)]">
              You won&apos;t get any flight notifications until you create an
              alert. Add one to track award seats on a specific route for a
              fixed date, a date range, or any date.
            </p>
            <div className="mt-2">
              <NewAlertModal label="Create your first alert" />
            </div>
          </div>
        )}
      </section>

      {atLimit ? (
        <p className="mt-6 rounded-xl border border-dashed border-[var(--line-strong)] p-4 text-center text-sm text-[var(--muted)]">
          You&apos;re at the {limitLabel}-alert limit on Free. Remove one, or
          {" "}
          <a className="text-[var(--accent)] hover:underline" href="/pricing">
            go Premium
          </a>{" "}
          for unlimited.
        </p>
      ) : null}

      <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
        We check your alerts in the background and email you when seats open —
        Economy on Free, every cabin on Premium. Availability moves fast, so
        confirm with the program before you rely on it.
        {isEmailConfigured()
          ? ""
          : " Email delivery isn't switched on yet, so alerts show here rather than in your inbox for now."}
      </p>
    </main>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M6 9a6 6 0 1112 0c0 4 2 5 2 5H4s2-1 2-5zM10 19a2 2 0 004 0" />
    </svg>
  );
}

function PlaneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M3 12l18-8-6 18-3-7-9-3z" />
    </svg>
  );
}
