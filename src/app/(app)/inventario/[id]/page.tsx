import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, PencilIcon, PlusIcon, TagIcon, Undo2Icon } from "lucide-react";
import { cn } from "cn";

import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { PhotoGallery } from "@/components/products/photo-gallery";
import { StatusBadge } from "@/components/products/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { getProfile } from "@/lib/auth/dal";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expenses/labels";
import { listProductExpenses } from "@/lib/expenses/queries";
import { formatDate, formatMoney, sumMoney } from "@/lib/format";
import { CONDITION_LABELS, EDITABLE_STATUSES, STATUS_LABELS } from "@/lib/products/labels";
import { getProduct } from "@/lib/products/queries";
import { PLATFORM_LABELS } from "@/lib/sales/labels";
import { getSaleByProduct } from "@/lib/sales/queries";
import { deleteSale } from "../../ventas/actions";
import { setProductStatus } from "../actions";

export const metadata: Metadata = { title: "Producto" };

export default async function ProductPage({ params }: PageProps<"/inventario/[id]">) {
  const { id } = await params;
  const [product, profile] = await Promise.all([getProduct(id), getProfile()]);
  if (!product) notFound();
  const [sale, expenses] = await Promise.all([getSaleByProduct(product.id), listProductExpenses(product.id)]);
  const expensesTotal = sumMoney(expenses.map((e) => e.amount));
  const netProfit = sale
    ? sumMoney([sale.sale_price, -sale.platform_fee, -sale.shipping_cost, -product.purchase_price, -expensesTotal])
    : null;

  const money = (value: number) => formatMoney(value, profile.currency);
  const expectedMargin =
    product.listed_price === null ? null : product.listed_price - product.purchase_price;

  const details: [string, string | null][] = [
    ["Marca", product.brand],
    ["Categoría", product.category],
    ["Talla", product.size],
    ["Color", product.color],
    ["Estado del artículo", product.condition && CONDITION_LABELS[product.condition]],
    ["Fecha de compra", product.purchase_date && formatDate(product.purchase_date)],
    ["Comprado en", product.purchase_source],
  ];

  return (
    <>
      <Link
        href="/inventario"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" /> Inventario
      </Link>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <PhotoGallery photos={product.photos} title={product.title} />

        <div className="min-w-0 space-y-6">
          <div className="space-y-2">
            <StatusBadge status={product.status} />
            <h1 className="text-2xl font-semibold tracking-tight break-words md:text-3xl">{product.title}</h1>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <Stat label="Precio de compra" value={money(product.purchase_price)} />
            <Stat
              label="Precio de venta previsto"
              value={product.listed_price === null ? "—" : money(product.listed_price)}
            />
            {!sale && expectedMargin !== null && (
              <div className="col-span-2 rounded-2xl border bg-card p-4">
                <dt className="text-sm text-muted-foreground">Margen previsto</dt>
                <dd
                  className={cn(
                    "text-xl font-semibold tabular-nums",
                    expectedMargin >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {money(expectedMargin)}
                </dd>
                <dd className="mt-0.5 text-xs text-muted-foreground">
                  Antes de comisiones, envío y otros gastos.
                </dd>
              </div>
            )}
          </dl>

          {sale && netProfit !== null ? (
            <section aria-labelledby="venta" className="rounded-2xl border bg-card p-4">
              <h2 id="venta" className="mb-3 text-base font-semibold">
                Venta
              </h2>
              <dl className="space-y-1.5 text-sm">
                <Line label="Vendido en" value={`${PLATFORM_LABELS[sale.platform]} · ${formatDate(sale.sale_date)}`} />
                <Line label="Precio de venta" value={money(sale.sale_price)} />
                <Line label="Comisión" value={sale.platform_fee ? `− ${money(sale.platform_fee)}` : "—"} />
                <Line label="Envío pagado por ti" value={sale.shipping_cost ? `− ${money(sale.shipping_cost)}` : "—"} />
                <Line label="Precio de compra" value={`− ${money(product.purchase_price)}`} />
                <Line label="Gastos del producto" value={expensesTotal ? `− ${money(expensesTotal)}` : "—"} />
                <div className="flex items-baseline justify-between gap-4 border-t pt-3">
                  <dt className="font-medium">Beneficio neto</dt>
                  <dd
                    data-testid="net-profit"
                    className={cn(
                      "text-2xl font-semibold tabular-nums",
                      netProfit >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {money(netProfit)}
                  </dd>
                </div>
              </dl>
              {sale.notes && <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{sale.notes}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/inventario/${product.id}/venta`} className={buttonVariants({ variant: "outline" })}>
                  <PencilIcon data-icon="inline-start" /> Editar venta
                </Link>
                <ConfirmDialog
                  action={deleteSale}
                  fields={{ productId: product.id }}
                  trigger={
                    <>
                      <Undo2Icon data-icon="inline-start" /> Anular venta
                    </>
                  }
                  title="¿Anular esta venta?"
                  description="Se borrará la venta y el producto volverá a «En stock». El producto y sus gastos no se eliminan."
                  confirmLabel="Anular venta"
                  pendingLabel="Anulando…"
                />
              </div>
            </section>
          ) : (
            <Link href={`/inventario/${product.id}/venta`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              <TagIcon data-icon="inline-start" /> Registrar venta
            </Link>
          )}

          {product.status !== "sold" && (
            <section aria-labelledby="situacion">
              <h2 id="situacion" className="mb-2 text-sm font-medium">
                Situación
              </h2>
              <form action={setProductStatus} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={product.id} />
                {EDITABLE_STATUSES.map((status) => (
                  <button
                    key={status}
                    name="status"
                    value={status}
                    aria-pressed={status === product.status}
                    className={cn(
                      "h-10 rounded-full border px-4 text-sm font-medium transition-colors",
                      status === product.status
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </form>
            </section>
          )}

          <dl className="divide-y rounded-2xl border bg-card px-4">
            {details
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium break-words">{value}</dd>
                </div>
              ))}
            <div className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-muted-foreground">Añadido el</dt>
              <dd className="font-medium">{formatDate(product.created_at.slice(0, 10))}</dd>
            </div>
          </dl>

          {product.notes && (
            <section aria-labelledby="notas">
              <h2 id="notas" className="mb-2 text-sm font-medium">
                Notas
              </h2>
              <p className="rounded-2xl border bg-card p-4 text-sm whitespace-pre-wrap">{product.notes}</p>
            </section>
          )}

          <section aria-labelledby="gastos-producto">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 id="gastos-producto" className="text-sm font-medium">
                Gastos de este producto
                {expensesTotal > 0 && <span className="text-muted-foreground"> · {money(expensesTotal)}</span>}
              </h2>
              <Link
                href={`/gastos/nuevo?producto=${product.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <PlusIcon data-icon="inline-start" /> Añadir gasto
              </Link>
            </div>
            {expenses.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                Sin gastos asociados (envío, embalaje, arreglos…).
              </p>
            ) : (
              <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                {expenses.map((expense) => (
                  <li key={expense.id}>
                    <Link
                      href={`/gastos/${expense.id}/editar?desde=producto`}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-accent/40"
                    >
                      <span className="min-w-0 truncate">
                        {expense.description || EXPENSE_CATEGORY_LABELS[expense.category]}
                        <span className="text-muted-foreground"> · {formatDate(expense.expense_date)}</span>
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">{money(expense.amount)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            <Link href={`/inventario/${product.id}/editar`} className={buttonVariants({ variant: "outline" })}>
              <PencilIcon data-icon="inline-start" /> Editar
            </Link>
            <DeleteProductDialog id={product.id} title={product.title} />
          </div>

          <div className="space-y-2 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            <p className="flex flex-wrap items-center justify-between gap-2">
              Generar el anuncio con IA <ComingSoonBadge phase={6} />
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  );
}
