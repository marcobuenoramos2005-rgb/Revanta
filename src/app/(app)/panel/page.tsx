import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BoxesIcon,
  CircleDollarSignIcon,
  PackageIcon,
  ReceiptIcon,
  SparklesIcon,
  TagIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile, requireUser } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/format";
import { getStockSummary } from "@/lib/products/queries";
import { getMonthSummary } from "@/lib/sales/queries";

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
    description: "Título y descripción listos para copiar y pegar.",
    href: "/inventario",
    icon: SparklesIcon,
    phase: 6,
  },
];

export default async function PanelPage() {
  await requireUser();
  const [{ businessName, currency }, stock, month] = await Promise.all([
    getProfile(),
    getStockSummary(),
    getMonthSummary(),
  ]);

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
    </>
  );
}
