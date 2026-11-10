import type { Metadata } from "next";

import { PageHeader } from "@/components/app-shell/page-header";
import { ProductForm } from "@/components/products/product-form";
import { getProfile, requireUser } from "@/lib/auth/dal";
import { currencySymbol } from "@/lib/format";

export const metadata: Metadata = { title: "Añadir producto" };

export default async function NewProductPage() {
  const user = await requireUser();
  const profile = await getProfile();

  return (
    <>
      <PageHeader title="Añadir producto" description="Solo el título y el precio de compra son obligatorios." />
      <ProductForm
        mode="create"
        userId={user.id}
        productId={crypto.randomUUID()}
        currencySymbol={currencySymbol(profile.currency)}
        values={{
          title: "",
          brand: "",
          category: "",
          size: "",
          color: "",
          condition: "",
          status: "in_stock",
          purchasePrice: "",
          purchaseDate: "",
          purchaseSource: "",
          listedPrice: "",
          notes: "",
        }}
      />
    </>
  );
}
