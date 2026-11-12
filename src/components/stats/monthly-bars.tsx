import { cn } from "cn";

import { formatMoney, monthLabel } from "@/lib/format";
import type { MonthStat } from "@/lib/stats/queries";

const PLOT_HEIGHT = 168; // px

/**
 * Columnas de beneficio neto por mes. Una sola serie: no necesita leyenda.
 * Las pérdidas crecen hacia abajo desde la misma línea base. Cada columna lleva
 * su valor escrito (en pantallas táctiles no hay "hover") y hay una tabla
 * equivalente para lectores de pantalla.
 */
export function MonthlyBars({ months, currency }: { months: MonthStat[]; currency: string }) {
  const maxPositive = Math.max(0, ...months.map((m) => m.profit));
  const maxNegative = Math.max(0, ...months.map((m) => -m.profit));
  const range = maxPositive + maxNegative || 1;
  const positiveHeight = maxNegative === 0 ? PLOT_HEIGHT : Math.round((maxPositive / range) * PLOT_HEIGHT);
  const negativeHeight = PLOT_HEIGHT - positiveHeight;
  const compact = months.length > 6;

  const short = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: Math.abs(value) < 100 && !compact ? 2 : 0,
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <figure>
      <div aria-hidden="true" className="flex gap-1 sm:gap-2">
        {months.map((month) => {
          const height = Math.max(month.profit === 0 ? 0 : 3, Math.round((Math.abs(month.profit) / range) * PLOT_HEIGHT));
          const negative = month.profit < 0;
          const label = (
            <span className={cn("block text-center font-medium tabular-nums", compact ? "text-[0.6rem]" : "text-xs")}>
              {month.sales === 0 && month.profit === 0 ? "" : short(month.profit)}
            </span>
          );
          return (
            <div
              key={month.key}
              className="min-w-0 flex-1"
              title={`${monthLabel(month.key, true)}: ${formatMoney(month.profit, currency)} · ${month.sales} ventas`}
            >
              <div className="flex flex-col justify-end" style={{ height: positiveHeight + 20 }}>
                {!negative && label}
                {!negative && (
                  <div className="mx-auto w-full max-w-6 rounded-t bg-primary" style={{ height }} />
                )}
              </div>
              <div className="border-t border-border" />
              <div style={{ height: negativeHeight ? negativeHeight + 20 : 0 }}>
                {negative && (
                  <>
                    <div className="mx-auto w-full max-w-6 rounded-b bg-destructive" style={{ height }} />
                    {label}
                  </>
                )}
              </div>
              <p className={cn("mt-1.5 truncate text-center text-muted-foreground", compact ? "text-[0.65rem]" : "text-xs")}>
                {monthLabel(month.key)}
              </p>
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>Beneficio neto por mes</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Beneficio neto</th>
            <th scope="col">Ventas</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.key}>
              <th scope="row">{monthLabel(month.key, true)}</th>
              <td>{formatMoney(month.profit, currency)}</td>
              <td>{month.sales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
