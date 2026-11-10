import { formatMoney } from "@/lib/format";
import type { GroupStat } from "@/lib/stats/queries";

/**
 * Lista de barras horizontales (beneficio por grupo), ordenada de mayor a menor.
 * El nombre y el valor van escritos junto a cada barra: no depende del color.
 */
export function BarList({ items, currency }: { items: GroupStat[]; currency: string }) {
  const max = Math.max(...items.map((item) => Math.abs(item.profit)), 0.01);

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium">
              {item.label}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {item.sales === 1 ? "1 venta" : `${item.sales} ventas`}
              </span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{formatMoney(item.profit, currency)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted" aria-hidden="true">
            <div
              className={item.profit < 0 ? "h-2 rounded-full bg-destructive" : "h-2 rounded-full bg-primary"}
              style={{ width: `${Math.max(item.profit === 0 ? 0 : 2, (Math.abs(item.profit) / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
