export default function Loading() {
  return (
    <main className="container-wide py-20">
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-32 rounded-full bg-[var(--soft)]" />
        <div className="h-10 w-full max-w-xl rounded-2xl bg-[var(--soft)]" />
        <div className="h-4 w-full max-w-md rounded-full bg-[var(--soft)]" />
        <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div className="h-40 rounded-[var(--radius)] bg-[var(--soft)]" key={i} />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
