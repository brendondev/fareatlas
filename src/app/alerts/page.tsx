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
import { getDictionary, getLocale, type Dictionary } from "@/lib/i18n";
import { LOCALE_HTML_LANG } from "@/lib/i18n/config";

export const metadata: Metadata = { title: "Flight alerts" };
export const dynamic = "force-dynamic";

type AlertsDict = Dictionary["alerts"];

function relativeTime(date: Date, t: AlertsDict): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return t.timeJustNow;
  if (mins < 60) return t.timeMinAgo.replace("{n}", String(mins));
  const hours = Math.round(mins / 60);
  if (hours < 24) return t.timeHoursAgo.replace("{n}", String(hours));
  return t.timeDaysAgo.replace("{n}", String(Math.round(hours / 24)));
}

function windowLabel(
  startDate: Date | null,
  endDate: Date | null,
  t: AlertsDict,
  fmt: Intl.DateTimeFormat,
): string {
  if (!startDate && !endDate) return t.anyDate;
  if (startDate && endDate) {
    if (startDate.getTime() === endDate.getTime()) return fmt.format(startDate);
    return `${fmt.format(startDate)} → ${fmt.format(endDate)}`;
  }
  if (startDate) return `${t.from} ${fmt.format(startDate)}`;
  return `${t.until} ${fmt.format(endDate!)}`;
}

function airportLabel(iata: string): string {
  const airport = airportByIata(iata);
  return airport ? `${airport.city} (${airport.iata})` : iata;
}

export default async function AlertsPage() {
  if (!isAuthConfigured()) notFound();
  const { user, tier } = await requireUser("/alerts");
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.alerts;
  const cabinLabels = dict.common.cabins;

  const dateFormatter = new Intl.DateTimeFormat(LOCALE_HTML_LANG[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const alerts = await prisma.awardWatch
    .findMany({
      where: { userId: user!.id, status: "active" },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const limit = entitlementsFor(tier).maxWatches;
  const limitLabel = Number.isFinite(limit)
    ? `${limit}`
    : dict.common.unlimited;
  const atLimit = Number.isFinite(limit) && alerts.length >= limit;
  const planLabel = tier === "pro" ? "Pro" : tier === "premium" ? "Premium" : "Free";

  return (
    <main className="container-page py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="pill text-[var(--accent)]">
            <BellIcon /> {t.title}
          </span>
          <h1 className="section-title mt-4">{t.title}</h1>
          <p className="section-lead">
            {t.countTemplate
              .replace("{count}", String(alerts.length))
              .replace("{limit}", limitLabel)
              .replace("{plan}", planLabel)}
          </p>
        </div>
        {!atLimit ? (
          <NewAlertModal cabins={cabinLabels} dict={t.modal} label={t.newAlert} />
        ) : null}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
          <PlaneIcon /> {t.yourAlerts}
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
                      .map(
                        (c) =>
                          cabinLabels[
                            c.trim() as keyof typeof cabinLabels
                          ] ?? c.trim(),
                      )
                      .join(" · ")}
                    {" · "}
                    {windowLabel(alert.startDate, alert.endDate, t, dateFormatter)}
                  </p>
                  {alert.lastHitSummary ? (
                    <p className="mt-1.5 text-xs font-semibold text-[var(--accent)]">
                      ✈ {t.seatsFound} · {alert.lastHitSummary}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-[var(--muted)]">
                      {alert.lastCheckedAt
                        ? t.checkedTemplate.replace(
                            "{time}",
                            relativeTime(alert.lastCheckedAt, t),
                          )
                        : t.notCheckedYet}
                    </p>
                  )}
                </div>
                <form action={deleteAlert}>
                  <input name="alertId" type="hidden" value={alert.id} />
                  <button className="btn btn-secondary h-9" type="submit">
                    {t.remove}
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
            <p className="font-display text-lg font-semibold">{t.emptyTitle}</p>
            <p className="max-w-md text-sm text-[var(--muted)]">{t.emptyBody}</p>
            <div className="mt-2">
              <NewAlertModal
                cabins={cabinLabels}
                dict={t.modal}
                label={t.createFirst}
              />
            </div>
          </div>
        )}
      </section>

      {atLimit ? (
        <p className="mt-6 rounded-xl border border-dashed border-[var(--line-strong)] p-4 text-center text-sm text-[var(--muted)]">
          {t.atLimitTemplate.replace("{limit}", limitLabel)}{" "}
          <a className="text-[var(--accent)] hover:underline" href="/pricing">
            {tier === "premium" ? t.atLimitCtaPro : t.atLimitCtaUpgrade}
          </a>
        </p>
      ) : null}

      <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
        {entitlementsFor(tier).emailAlerts ? t.footerPaid : t.footerFree}
        {isEmailConfigured() ? "" : t.emailOffNote}
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
