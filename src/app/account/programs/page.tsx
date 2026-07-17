import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { followProgram, unfollowProgram } from "@/lib/actions/account";
import { isAuthConfigured } from "@/lib/auth-config";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Your programs" };
export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  if (!isAuthConfigured()) notFound();
  const { user } = await requireUser("/account/programs");

  // Following needs the DB row id for the join, so read programs from Neon
  // directly. This page only exists when auth (and therefore the DB) is on.
  const [programs, followed] = await Promise.all([
    prisma.loyaltyProgram
      .findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true, shortCode: true, color: true },
      })
      .catch(() => [] as Array<{ id: string; slug: string; name: string; shortCode: string; color: string }>),
    prisma.userProgram
      .findMany({ where: { userId: user!.id }, select: { programId: true } })
      .catch(() => [] as { programId: string }[]),
  ]);

  const followedIds = new Set(followed.map((f) => f.programId));

  return (
    <main className="container-page py-12 sm:py-16">
      <AccountNav active="programs" />

      <h1 className="section-title mt-6">Your programs</h1>
      <p className="section-lead">
        Follow the programs you actually use. We&apos;ll keep their offers front
        and centre.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {programs.map((program) => {
          const isFollowed = followedIds.has(program.id);

          return (
            <article
              className="card flex items-center justify-between gap-4 p-5"
              key={program.slug}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-xl text-sm font-bold text-white"
                  style={{ background: program.color }}
                >
                  {program.shortCode}
                </span>
                <div>
                  <p className="font-semibold">{program.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {isFollowed ? "Following" : "Not following"}
                  </p>
                </div>
              </div>

              <form action={isFollowed ? unfollowProgram : followProgram}>
                <input name="programId" type="hidden" value={program.id} />
                <button
                  className={`btn h-10 ${isFollowed ? "btn-secondary" : "btn-accent"}`}
                  type="submit"
                >
                  {isFollowed ? "Unfollow" : "Follow"}
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </main>
  );
}
