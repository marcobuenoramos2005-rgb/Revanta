import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { ProductForm } from "@/components/products/product-form";
import { getProfile, requireUser } from "@/lib/auth/dal";
import { currencySymbol } from "@/lib/format";
import { getProduct } from "@/lib/products/queries";
import { ResetOnNavigate } from "@/components/reset-on-navigate";

export const metadata: Metadata = { title: "Editar producto" };

const money = (value: number | null) => (value === null ? "" : value.toFixed(2).replace(".", ","));

export default async function EditProductPage({ params }: PageProps<"/inventario/[id]/editar">) {
  const user = await requireUser();
  const { id } = await params;
  const [product, profile] = await Promise.all([getProduct(id), getProfile()]);
  if (!product) notFound();

  return (
    <>
      <PageHeader title="Editar producto" description={product.title} />
      <ResetOnNavigate>
        <ProductForm
          mode="edit"
          userId={user.id}
          productId={product.id}
          currencySymbol={currencySymbol(profile.currency)}
          isSold={product.status === "sold"}
          initialPhotos={product.photos}
          values={{
            title: product.title,
            brand: product.brand ?? "",
            category: product.category ?? "",
            size: product.size ?? "",
            color: product.color ?? "",
            condition: product.condition ?? "",
            status: product.status === "sold" ? "in_stock" : product.status,
            purchasePrice: money(product.purchase_price),
            purchaseDate: product.purchase_date ?? "",
            purchaseSource: product.purchase_source ?? "",
            listedPrice: money(product.listed_price),
            notes: product.notes ?? "",
          }}
        />
      </ResetOnNavigate>
    </>
  );
}
