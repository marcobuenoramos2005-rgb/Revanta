import type { Metadata } from "next";
import Link from "next/link";
import { ChartColumnIcon } from "lucide-react";
import { cn } from "cn";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { BarList } from "@/components/stats/bar-list";
import { MonthlyBars } from "@/components/stats/monthly-bars";
import { buttonVariants } from "@/components/ui/button";
import { getProfile } from "@/lib/auth/dal";
import { formatMoney, formatPercent } from "@/lib/format";
import { getStats } from "@/lib/stats/queries";

export const metadata: Metadata = { title: "Estadísticas" };

const PERIODS = [
  { months: 6, label: "6 meses" },
  { months: 12, label: "12 meses" },
];

export default async function StatsPage({ searchParams }: PageProps<"/estadisticas">) {
  const params = await searchParams;
  const requested = Number(Array.isArray(params.periodo) ? params.periodo[0] : params.periodo);
  const period = PERIODS.find((p) => p.months === requested) ?? PERIODS[0];

  const [stats, profile] = await Promise.all([getStats(period.months), getProfile()]);
  const money = (value: number) => formatMoney(value, profile.currency);
  const hasData = stats.salesCount > 0 || stats.generalExpenses > 0;

  return (
    <>
      <PageHeader
        title="Estadísticas"
        description="Descubre qué te deja más beneficio y dónde vendes mejor."
      />

      <nav aria-label="Periodo" className="mb-5">
        <ul className="flex gap-2">
          {PERIODS.map(({ months, label }) => {
            const active = months === period.months;
            return (
              <li key={months}>
                <Link
                  href={months === PERIODS[0].months ? "/estadisticas" : `/estadisticas?periodo=${months}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  Últimos {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!hasData ? (
        <EmptyState
          icon={ChartColumnIcon}
          title="Todavía no hay datos en este periodo"
          description="Cuando registres ventas verás aquí tu beneficio por mes, por plataforma y por categoría."
        >
          <Link href="/inventario" className={buttonVariants()}>
            Ir al inventario
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {stats.truncated && (
            <p className="rounded-xl border border-warning/40 bg-warning/10 px-3.5 py-3 text-sm">
              Hay más de 1.000 registros en este periodo: las cifras pueden estar incompletas.
            </p>
          )}

          <dl className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            <Stat
              label="Beneficio neto"
              value={money(stats.netProfit)}
              hint={
                stats.generalExpenses > 0
                  ? `Tras ${money(stats.generalExpenses)} de gastos generales`
                  : "Sin gastos generales"
              }
              tone={stats.netProfit < 0 ? "negative" : "positive"}
            />
            <Stat
              label="Ingresos por ventas"
              value={money(stats.revenue)}
              hint={stats.salesCount === 1 ? "1 venta" : `${stats.salesCount} ventas`}
            />
            <Stat
              label="Margen medio"
              value={stats.margin === null ? "—" : formatPercent(stats.margin)}
              hint="Beneficio de las ventas sobre ingresos"
            />
            <Stat
              label="Tiempo medio hasta vender"
              value={stats.avgDaysToSell === null ? "—" : stats.avgDaysToSell === 1 ? "1 día" : `${stats.avgDaysToSell} días`}
              hint={stats.avgDaysToSell === null ? "Añade la fecha de compra a tus productos" : "Desde la fecha de compra"}
            />
          </dl>

          <Panel title="Beneficio neto por mes" subtitle={`En ${profile.currency}, descontados los gastos generales de cada mes`}>
            <MonthlyBars months={stats.months} currency={profile.currency} />
          </Panel>

          {stats.salesCount > 0 && (
            <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
              <Panel title="Beneficio por plataforma" subtitle="Dónde ganas más">
                <BarList items={stats.byPlatform} currency={profile.currency} />
              </Panel>
              <Panel title="Beneficio por categoría" subtitle="Qué tipo de artículo te deja más">
                <BarList items={stats.byCategory} currency={profile.currency} />
              </Panel>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <dt className="text-sm leading-tight text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </dd>
      <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const id = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <section aria-labelledby={id} className="rounded-2xl border bg-card p-4 md:p-6">
      <h2 id={id} className="text-base font-semibold">
        {title}
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">{subtitle}</p>
      {children}
    </section>
  );
}
