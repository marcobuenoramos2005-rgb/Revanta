import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { PackageIcon, PlusIcon, SearchIcon, SearchXIcon } from "lucide-react";
import { cn } from "cn";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/products/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProfile } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/format";
import { STATUS_LABELS, type ProductStatus } from "@/lib/products/labels";
import { LIST_LIMIT, listProducts, type ProductListItem } from "@/lib/products/queries";

export const metadata: Metadata = { title: "Inventario" };

const FILTERS: { value?: ProductStatus; label: string }[] = [
  { label: "Activos" },
  { value: "in_stock", label: STATUS_LABELS.in_stock },
  { value: "listed", label: STATUS_LABELS.listed },
  { value: "reserved", label: STATUS_LABELS.reserved },
  { value: "sold", label: STATUS_LABELS.sold },
  { value: "archived", label: STATUS_LABELS.archived },
];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InventoryPage({ searchParams }: PageProps<"/inventario">) {
  const params = await searchParams;
  const query = first(params.q)?.trim() ?? "";
  const statusParam = first(params.estado);
  const status = FILTERS.find((f) => f.value && f.value === statusParam)?.value;

  const [products, profile] = await Promise.all([listProducts({ query, status }), getProfile()]);
  const isFiltered = !!query || !!status;

  const filterHref = (value?: ProductStatus) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (value) next.set("estado", value);
    const qs = next.toString();
    return qs ? `/inventario?${qs}` : "/inventario";
  };

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Todo lo que tienes a la venta, en un solo lugar."
        actions={
          <Link href="/inventario/nuevo" className={cn(buttonVariants(), "w-full sm:w-auto")}>
            <PlusIcon data-icon="inline-start" /> Añadir producto
          </Link>
        }
      />

      <Form action="/inventario" className="relative mb-3">
        {status && <input type="hidden" name="estado" value={status} />}
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Buscar por título, marca o categoría"
          aria-label="Buscar en el inventario"
          enterKeyHint="search"
          className="pl-10"
        />
      </Form>

      <nav aria-label="Filtrar por situación" className="-mx-4 mb-5 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex w-max gap-2">
          {FILTERS.map(({ value, label }) => {
            const active = value === status;
            return (
              <li key={label}>
                <Link
                  href={filterHref(value)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {products.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon={SearchXIcon}
            title="Sin resultados"
            description="No hay productos que coincidan con tu búsqueda o filtro."
          >
            <Link href="/inventario" className={buttonVariants({ variant: "outline" })}>
              Quitar filtros
            </Link>
          </EmptyState>
        ) : (
          <EmptyState
            icon={PackageIcon}
            title="Tu inventario está vacío"
            description="Añade tu primer producto con sus fotos y lo que te costó."
          >
            <Link href="/inventario/nuevo" className={buttonVariants()}>
              <PlusIcon data-icon="inline-start" /> Añadir producto
            </Link>
          </EmptyState>
        )
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground" role="status">
            {products.length === 1 ? "1 producto" : `${products.length} productos`}
            {products.length === LIST_LIMIT && ` (se muestran los ${LIST_LIMIT} más recientes)`}
          </p>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} currency={profile.currency} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function ProductCard({ product, currency }: { product: ProductListItem; currency: string }) {
  const details = [product.brand, product.size].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/inventario/${product.id}`}
      className="group block overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-square bg-muted">
        {product.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal
          <img src={product.coverUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/50">
            <PackageIcon className="size-10" strokeWidth={1.25} />
          </div>
        )}
        {/* Fondo opaco para que la etiqueta se lea sobre cualquier foto. */}
        <span className="absolute top-2 left-2 rounded-full bg-card shadow-sm">
          <StatusBadge status={product.status} />
        </span>
      </div>
      <div className="space-y-0.5 p-3">
        <p className="truncate font-medium">{product.title}</p>
        <p className="truncate text-sm text-muted-foreground">{details || " "}</p>
        <p className="pt-1 text-sm">
          <span className="text-muted-foreground">Coste </span>
          <span className="font-semibold tabular-nums">{formatMoney(product.purchase_price, currency)}</span>
        </p>
      </div>
    </Link>
  );
}
