import type { Metadata } from "next";
import Link from "next/link";
import { PackageIcon, TagIcon } from "lucide-react";
import { cn } from "cn";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getProfile } from "@/lib/auth/dal";
import { formatDate, formatMoney, sumMoney } from "@/lib/format";
import { PLATFORM_LABELS } from "@/lib/sales/labels";
import { listSales, SALES_LIMIT } from "@/lib/sales/queries";

export const metadata: Metadata = { title: "Ventas" };

export default async function SalesPage() {
  const [sales, profile] = await Promise.all([listSales(), getProfile()]);
  const money = (value: number) => formatMoney(value, profile.currency);

  return (
    <>
      <PageHeader title="Ventas" description="Cada venta con su beneficio neto real." />

      {sales.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="Aún no hay ventas"
          description="Para registrar una venta, abre el producto en tu inventario y pulsa «Registrar venta»."
        >
          <Link href="/inventario" className={buttonVariants()}>
            <PackageIcon data-icon="inline-start" /> Ir al inventario
          </Link>
        </EmptyState>
      ) : (
        <>
          <dl className="mb-5 grid grid-cols-2 gap-3 md:max-w-xl">
            <div className="rounded-2xl border bg-card p-4">
              <dt className="text-sm text-muted-foreground">Total vendido</dt>
              <dd className="text-xl font-semibold tabular-nums">{money(sumMoney(sales.map((s) => s.salePrice)))}</dd>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <dt className="text-sm text-muted-foreground">Beneficio de las ventas</dt>
              <dd className="text-xl font-semibold tabular-nums">{money(sumMoney(sales.map((s) => s.netProfit)))}</dd>
            </div>
          </dl>
          <p className="mb-3 text-sm text-muted-foreground" role="status">
            {sales.length === 1 ? "1 venta" : `${sales.length} ventas`}
            {sales.length === SALES_LIMIT && ` (se muestran las ${SALES_LIMIT} más recientes)`}
          </p>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {sales.map((sale) => (
              <li key={sale.productId}>
                <Link
                  href={`/inventario/${sale.productId}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{sale.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {PLATFORM_LABELS[sale.platform]} · {formatDate(sale.saleDate)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "font-semibold tabular-nums",
                        sale.netProfit >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {sale.netProfit > 0 && "+"}
                      {money(sale.netProfit)}
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">Venta {money(sale.salePrice)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
