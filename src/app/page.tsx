import Link from "next/link";
import {
  ArrowRightIcon,
  ChartColumnIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TagIcon,
  type LucideIcon,
} from "lucide-react";
import { cacheLife } from "next/cache";
import { cn } from "cn";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

const features: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Inventario",
    description: "Cada artículo con sus fotos, estado, talla, precio de compra y dónde lo publicaste.",
    icon: PackageIcon,
  },
  {
    title: "Compras y gastos",
    description: "Envíos, embalaje, transporte, comisiones y suscripciones, todo registrado.",
    icon: ReceiptIcon,
  },
  {
    title: "Ventas",
    description: "Registra ventas de Vinted, Wallapop, eBay o en mano en segundos.",
    icon: TagIcon,
  },
  {
    title: "Beneficio neto real",
    description: "Calculado automáticamente: venta menos compra, comisiones, envíos y gastos.",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Anuncios con IA",
    description: "Títulos y descripciones atractivos generados a partir de tu producto, listos para copiar.",
    icon: SparklesIcon,
  },
  {
    title: "Estadísticas",
    description: "Qué categorías y plataformas te dejan más dinero y cuánto tardas en vender.",
    icon: ChartColumnIcon,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Entrar
            </Link>
            <Link href="/registro" className={cn(buttonVariants(), "hidden sm:inline-flex")}>
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_60%)] opacity-15"
          />
          <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-14 text-center md:px-8 md:pt-28 md:pb-24">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              <span className="size-1.5 rounded-full bg-primary" />
              Para revendedores de segunda mano
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              Tu negocio de reventa, <span className="text-primary">bajo control</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-muted-foreground md:text-xl">
              Inventario, gastos, ventas y beneficio neto en un solo lugar. Diseñado para
              usarse cómodamente desde tu iPhone o iPad.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/registro" className={buttonVariants({ size: "lg" })}>
                Empezar gratis <ArrowRightIcon data-icon="inline-end" />
              </Link>
              <a href="#funciones" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Ver funciones
              </a>
            </div>
          </div>
        </section>

        <section id="funciones" className="scroll-mt-20 border-t bg-card/50">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Todo lo que necesitas, nada que sobre
              </h2>
              <p className="mt-3 text-muted-foreground">
                Deja las hojas de cálculo. Revanta hace las cuentas por ti.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-2xl border bg-card p-6">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <div
            className={cn(
              "flex flex-col items-start gap-4 rounded-3xl border bg-card p-8 md:flex-row md:items-center md:p-10",
            )}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
              <ShieldCheckIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Tus datos son solo tuyos</h2>
              <p className="mt-1 text-muted-foreground">
                Cada cuenta está aislada a nivel de base de datos. Nadie más puede ver tu
                inventario, tus ventas ni tus beneficios.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="pb-safe mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-8">
          <Logo className="text-foreground" />
          <p>© <CurrentYear /> Revanta</p>
        </div>
      </footer>
    </div>
  );
}

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
