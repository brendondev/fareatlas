"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useActionState } from "react";
import { AIRPORTS, formatAirport } from "@/lib/airports";
import { createAlert, type CreateAlertState } from "@/lib/actions/alerts";
import type { Dictionary } from "@/lib/i18n";

type ModalDict = Dictionary["alerts"]["modal"];
type CabinLabels = Dictionary["common"]["cabins"];

// Display order; labels come from the (translated) cabin dictionary.
const CABIN_ORDER = ["first", "business", "premium", "economy"] as const;

type DateMode = "any" | "fixed" | "range";

/** Trigger + modal in one file; the button owns the state so consumers just
 *  drop `<NewAlertModal />` where they want the CTA to appear. Copy is passed
 *  in (`dict`, `cabins`) because this is a client component and can't reach the
 *  server-only dictionary loader. */
export function NewAlertModal({
  label,
  variant = "accent",
  dict,
  cabins,
}: {
  label: string;
  variant?: "accent" | "secondary";
  dict: ModalDict;
  cabins: CabinLabels;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={variant === "accent" ? "btn btn-accent" : "btn btn-secondary"}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span aria-hidden>+</span> {label}
      </button>
      {open ? (
        <AlertDialog
          cabinLabels={cabins}
          dict={dict}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function AlertDialog({
  onClose,
  dict,
  cabinLabels,
}: {
  onClose: () => void;
  dict: ModalDict;
  cabinLabels: CabinLabels;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const [state, formAction, pending] = useActionState<CreateAlertState, FormData>(
    createAlert,
    undefined,
  );

  const [origin, setOrigin] = useState(AIRPORTS[0]!.iata);
  const [destination, setDestination] = useState(AIRPORTS[1]!.iata);
  const [cabins, setCabins] = useState<Set<string>>(
    () => new Set(["first", "business", "premium", "economy"]),
  );
  const [dateMode, setDateMode] = useState<DateMode>("any");

  // Close on success. Not inside a useEffect on `state.ok` alone: `state` may
  // stay ok across renders and we only want to close once.
  const closedRef = useRef(false);
  useEffect(() => {
    if (state?.ok && !closedRef.current) {
      closedRef.current = true;
      onClose();
    }
  }, [state, onClose]);

  // ESC to close, click outside to close, and lock body scroll while open.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  function toggleCabin(value: string) {
    setCabins((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const errorMessage = state && !state.ok ? state.error : null;

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]"
        ref={dialogRef}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold" id={titleId}>
            {dict.title}
          </h2>
          <button
            aria-label={dict.close}
            className="grid size-9 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--ink)]"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold text-[var(--ink)]">
              {dict.routeLegend}
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[var(--muted)]">
                {dict.origin}
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                  name="origin"
                  onChange={(event) => setOrigin(event.target.value)}
                  required
                  value={origin}
                >
                  {AIRPORTS.map((airport) => (
                    <option key={airport.iata} value={airport.iata}>
                      {formatAirport(airport)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-[var(--muted)]">
                {dict.destination}
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                  name="destination"
                  onChange={(event) => setDestination(event.target.value)}
                  required
                  value={destination}
                >
                  {AIRPORTS.map((airport) => (
                    <option key={airport.iata} value={airport.iata}>
                      {formatAirport(airport)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)]">
              <span aria-hidden>ⓘ</span> {dict.routeHint}
            </p>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[var(--ink)]">
              {dict.cabinLegend}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CABIN_ORDER.map((value) => {
                const active = cabins.has(value);
                return (
                  <label
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--line)] bg-[var(--soft)] text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                    key={value}
                  >
                    <input
                      checked={active}
                      className="sr-only"
                      name="cabin"
                      onChange={() => toggleCabin(value)}
                      type="checkbox"
                      value={value}
                    />
                    {cabinLabels[value]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[var(--ink)]">
              {dict.dateLegend}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {(
                [
                  { value: "any", label: dict.dateAny },
                  { value: "fixed", label: dict.dateFixed },
                  { value: "range", label: dict.dateRange },
                ] as const
              ).map((option) => {
                const active = dateMode === option.value;
                return (
                  <label
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-xs font-semibold ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--line)] bg-[var(--soft)] text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                    key={option.value}
                  >
                    <input
                      checked={active}
                      className="sr-only"
                      name="dateMode"
                      onChange={() => setDateMode(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>

            {dateMode === "any" ? (
              <p className="mt-2 text-xs text-[var(--muted)]">{dict.anyHint}</p>
            ) : null}

            {dateMode === "fixed" ? (
              <label className="mt-3 block text-xs font-semibold text-[var(--muted)]">
                {dict.dateLabel}
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                  name="date"
                  required
                  type="date"
                />
              </label>
            ) : null}

            {dateMode === "range" ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-[var(--muted)]">
                  {dict.fromLabel}
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    name="startDate"
                    required
                    type="date"
                  />
                </label>
                <label className="text-xs font-semibold text-[var(--muted)]">
                  {dict.toLabel}
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    name="endDate"
                    required
                    type="date"
                  />
                </label>
              </div>
            ) : null}
          </fieldset>

          {errorMessage ? (
            <p className="rounded-xl bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/25">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              className="btn btn-ghost h-10"
              onClick={onClose}
              type="button"
            >
              {dict.cancel}
            </button>
            <button
              className="btn btn-accent h-10"
              disabled={pending || origin === destination || cabins.size === 0}
              type="submit"
            >
              {pending ? dict.saving : dict.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
