import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BoxesIcon,
  ClockAlertIcon,
  CircleDollarSignIcon,
  PackageIcon,
  ReceiptIcon,
  SparklesIcon,
  TagIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "cn";

import { PageHeader } from "@/components/app-shell/page-header";
import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile, requireUser } from "@/lib/auth/dal";
import { formatDate, formatMoney } from "@/lib/format";
import { getStockSummary } from "@/lib/products/queries";
import { PLATFORM_LABELS } from "@/lib/sales/labels";
import { getMonthSummary, listSales } from "@/lib/sales/queries";
import { getStaleStock, STALE_DAYS } from "@/lib/stats/queries";

export const metadata: Metadata = { title: "Panel" };

const steps: { title: string; description: string; href: string; icon: LucideIcon; phase?: number }[] = [
  {
    title: "Añade tu primer producto",
    description: "Registra lo que has comprado y cuánto te costó.",
    href: "/inventario/nuevo",
    icon: PackageIcon,
  },
  {
    title: "Registra tus gastos",
    description: "Envíos, embalaje, transporte, comisiones…",
    href: "/gastos/nuevo",
    icon: ReceiptIcon,
  },
  {
    title: "Registra una venta",
    description: "Abre un producto y pulsa «Registrar venta».",
    href: "/inventario",
    icon: TagIcon,
  },
  {
    title: "Crea un anuncio con IA",
    description: "Abre un producto y pulsa «Generar anuncio con IA».",
    href: "/inventario",
    icon: SparklesIcon,
  },
];

export default async function PanelPage() {
  await requireUser();
  const [{ businessName, currency }, stock, month, stale, sales] = await Promise.all([
    getProfile(),
    getStockSummary(),
    getMonthSummary(),
    getStaleStock(),
    listSales(),
  ]);
  const money = (value: number) => formatMoney(value, currency);
  const isNewAccount = stock.total === 0 && sales.length === 0;
  const recentSales = sales.slice(0, 5);

  const kpis: { label: string; icon: LucideIcon; value?: string; hint?: string }[] = [
    {
      label: "Beneficio neto del mes",
      icon: TrendingUpIcon,
      value: formatMoney(month.netProfit, currency),
      hint:
        month.generalExpenses > 0
          ? `Tras ${formatMoney(month.generalExpenses, currency)} de gastos generales`
          : "Lo vendido este mes menos todos sus costes",
    },
    {
      label: "Ventas del mes",
      icon: CircleDollarSignIcon,
      value: formatMoney(month.revenue, currency),
      hint: month.salesCount === 1 ? "1 venta" : `${month.salesCount} ventas`,
    },
    {
      label: "Valor del stock",
      icon: BoxesIcon,
      value: formatMoney(stock.value, currency),
      hint: "Lo que te costó lo que tienes sin vender",
    },
    {
      label: "Productos en stock",
      icon: PackageIcon,
      value: String(stock.count),
      hint: "En stock, publicados o reservados",
    },
  ];

  return (
    <>
      <PageHeader
        title="Panel"
        description={businessName ? `Hola, ${businessName}. Este es el resumen de tu negocio.` : "El resumen de tu negocio de un vistazo."}
      />

      <section aria-label="Indicadores principales" className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {kpis.map(({ label, icon: Icon, value, hint }) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardDescription className="flex items-center justify-between gap-2">
                <span className="leading-tight">{label}</span>
                <Icon className="size-4 shrink-0 text-muted-foreground" />
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">{value ?? "—"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {isNewAccount ? (
        <section aria-labelledby="primeros-pasos" className="mt-8">
          <h2 id="primeros-pasos" className="mb-3 text-lg font-semibold">
            Primeros pasos
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {steps.map(({ title, description, href, icon: Icon, phase }, index) => (
              <Link
                key={title}
                href={href}
                className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    <span className="text-muted-foreground">{index + 1}. </span>
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  {phase && (
                    <div className="mt-2">
                      <ComingSoonBadge phase={phase} />
                    </div>
                  )}
                </div>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="stock-parado">
            <h2 id="stock-parado" className="mb-3 text-lg font-semibold">
              Stock parado
            </h2>
            {stale.count === 0 ? (
              <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                Ningún producto lleva más de {STALE_DAYS} días sin venderse.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border bg-card">
                <p className="flex items-start gap-2.5 border-b bg-warning/10 px-4 py-3 text-sm">
                  <ClockAlertIcon className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {stale.count === 1
                      ? `1 producto lleva más de ${STALE_DAYS} días sin venderse`
                      : `${stale.count} productos llevan más de ${STALE_DAYS} días sin venderse`}{" "}
                    ({money(stale.value)} inmovilizados). Prueba a bajar el precio o renovar el anuncio.
                  </span>
                </p>
                <ul className="divide-y">
                  {stale.oldest.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/inventario/${product.id}`}
                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-accent/40"
                      >
                        <span className="min-w-0 truncate font-medium">{product.title}</span>
                        <span className="shrink-0 text-muted-foreground tabular-nums">{product.days} días</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section aria-labelledby="ultimas-ventas">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 id="ultimas-ventas" className="text-lg font-semibold">
                Últimas ventas
              </h2>
              {recentSales.length > 0 && (
                <Link href="/ventas" className="text-sm font-medium text-primary hover:underline">
                  Ver todas
                </Link>
              )}
            </div>
            {recentSales.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                Aún no has registrado ventas. Abre un producto y pulsa «Registrar venta».
              </p>
            ) : (
              <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                {recentSales.map((sale) => (
                  <li key={sale.productId}>
                    <Link
                      href={`/inventario/${sale.productId}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-accent/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{sale.title}</span>
                        <span className="text-muted-foreground">
                          {PLATFORM_LABELS[sale.platform]} · {formatDate(sale.saleDate)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 font-semibold tabular-nums",
                          sale.netProfit >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {sale.netProfit > 0 && "+"}
                        {money(sale.netProfit)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
