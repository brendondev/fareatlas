import type { Metadata } from "next";
import {
  money,
  money2,
  points,
  ProgramBadge,
  VerticalShell,
} from "@/components/vertical-shell";
import { getWineDeals } from "@/lib/verticals";

export const metadata: Metadata = {
  title: "Wine bonus points",
  description:
    "Qantas and Virgin wine deals ranked by cost per 1,000 bonus points — with the price per bottle beside it, so a cheap case doesn't get ranked above good wine.",
};

export default async function WinePage() {
  const { items, source } = await getWineDeals();

  return (
    <VerticalShell
      eyebrow="Wine"
      lead="Ranked by what the points actually cost you — dollars per 1,000 bonus points. The catch every other site ignores: a huge case wins on that metric while being terrible wine, so we show the price per bottle right next to it."
      source={source}
      title="Wine bonus points, ranked"
    >
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-[var(--soft)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Deal</th>
              <th className="px-4 py-3 font-semibold">Bonus</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">$/bottle</th>
              <th className="px-4 py-3 font-semibold">Cost / 1,000 pts</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {items.map((deal, i) => (
              <tr
                className="border-t border-[var(--line)]"
                key={deal.id}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ProgramBadge color={deal.programColor} name={deal.vendor} />
                    {i === 0 ? (
                      <span className="text-[10px] font-bold text-[var(--accent)]">
                        ★ Best value
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 font-semibold">{deal.title}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-[var(--accent)]">
                  {points.format(deal.bonusPoints)}
                </td>
                <td className="px-4 py-3">{money.format(deal.priceAud)}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {deal.pricePerBottle !== null
                    ? money2.format(deal.pricePerBottle)
                    : "—"}
                </td>
                <td className="px-4 py-3 font-bold">
                  {deal.costPer1000 !== null
                    ? money2.format(deal.costPer1000)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
        Lower cost per 1,000 points is better. Always weigh it against the price
        per bottle — buying wine you won&apos;t drink to chase points is a loss,
        not a deal.
      </p>
    </VerticalShell>
  );
}
