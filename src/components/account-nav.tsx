import Link from "next/link";

export function AccountNav({
  active,
}: {
  active: "overview" | "programs" | "watches";
}) {
  const items = [
    { href: "/account", label: "Overview", key: "overview" },
    { href: "/account/programs", label: "Programs", key: "programs" },
    { href: "/account/watches", label: "Watched routes", key: "watches" },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          className={`rounded-full px-3.5 py-2 text-sm font-medium ${
            item.key === active
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--ink)]"
          }`}
          href={item.href}
          key={item.key}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
