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

export const metadata: Metadata = { title: "Panel" };

const kpis: { label: string; icon: LucideIcon }[] = [
  { label: "Beneficio neto del mes", icon: TrendingUpIcon },
  { label: "Ventas del mes", icon: CircleDollarSignIcon },
  { label: "Valor del stock", icon: BoxesIcon },
  { label: "Productos en stock", icon: PackageIcon },
];

const steps: { title: string; description: string; href: string; icon: LucideIcon; phase: number }[] = [
  {
    title: "Añade tu primer producto",
    description: "Registra lo que has comprado y cuánto te costó.",
    href: "/inventario",
    icon: PackageIcon,
    phase: 3,
  },
  {
    title: "Registra tus gastos",
    description: "Envíos, embalaje, transporte, comisiones…",
    href: "/gastos",
    icon: ReceiptIcon,
    phase: 4,
  },
  {
    title: "Registra una venta",
    description: "Revanta calculará tu beneficio neto real.",
    href: "/ventas",
    icon: TagIcon,
    phase: 4,
  },
  {
    title: "Crea un anuncio con IA",
    description: "Título y descripción listos para copiar y pegar.",
    href: "/inventario",
    icon: SparklesIcon,
    phase: 6,
  },
];

export default function PanelPage() {
  return (
    <>
      <PageHeader
        title="Panel"
        description="El resumen de tu negocio de un vistazo."
      />

      <section aria-label="Indicadores principales" className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {kpis.map(({ label, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardDescription className="flex items-center justify-between gap-2">
                <span className="leading-tight">{label}</span>
                <Icon className="size-4 shrink-0 text-muted-foreground" />
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">—</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Sin datos todavía</p>
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
                <div className="mt-2">
                  <ComingSoonBadge phase={phase} />
                </div>
              </div>
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
