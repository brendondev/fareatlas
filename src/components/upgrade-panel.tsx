import Link from "next/link";

/**
 * The locked state. Modelled on the dashed `!configured` panel in
 * award-search.tsx so a limit looks like a limit, not like an error.
 *
 * It appears alongside results, never instead of them: the search still
 * returned Economy. Showing an empty list would read as "broken".
 */
export function UpgradePanel({
  title,
  body,
  cta = "See Premium",
  href = "/pricing",
  signedIn,
}: {
  title: string;
  body: string;
  cta?: string;
  href?: string;
  signedIn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--accent)]/45 bg-[var(--accent-soft)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            <LockIcon />
            {title}
          </p>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
            {body}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {signedIn === false ? (
            <Link className="btn btn-secondary h-10" href="/register">
              Create free account
            </Link>
          ) : null}
          <Link className="btn btn-accent h-10" href={href}>
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        width="14"
        x="5"
        y="11"
      />
      <path
        d="M8 11V8a4 4 0 018 0v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
