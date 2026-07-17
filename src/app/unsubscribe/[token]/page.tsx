import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/unsubscribe-form";
import { isDatabaseConfigured, prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Look up the route to show in the confirmation, but never unsubscribe on
  // this GET — an email scanner prefetching the link would opt the user out.
  let route: string | null = null;
  if (isDatabaseConfigured() && token) {
    const watch = await prisma.awardWatch
      .findFirst({
        where: { unsubToken: token },
        select: { origin: true, destination: true },
      })
      .catch(() => null);
    if (watch) route = `${watch.origin} → ${watch.destination}`;
  }

  return (
    <main className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-md">
        <h1 className="section-title text-center text-3xl">Unsubscribe</h1>
        <div className="mt-8">
          <UnsubscribeForm route={route} token={token} />
        </div>
      </div>
    </main>
  );
}
