import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { SaleForm } from "@/components/sales/sale-form";
import { getProfile } from "@/lib/auth/dal";
import { listProductExpenses } from "@/lib/expenses/queries";
import { currencySymbol, moneyInput, sumMoney, todayISO } from "@/lib/format";
import { getProduct } from "@/lib/products/queries";
import { getSaleByProduct } from "@/lib/sales/queries";
import { ResetOnNavigate } from "@/components/reset-on-navigate";

export const metadata: Metadata = { title: "Venta" };

export default async function SalePage({ params }: PageProps<"/inventario/[id]/venta">) {
  const { id } = await params;
  const [product, profile] = await Promise.all([getProduct(id), getProfile()]);
  if (!product) notFound();
  const [sale, expenses] = await Promise.all([getSaleByProduct(product.id), listProductExpenses(product.id)]);

  return (
    <>
      <PageHeader title={sale ? "Editar venta" : "Registrar venta"} description={product.title} />
      <ResetOnNavigate>
        <SaleForm
          productId={product.id}
          purchasePrice={product.purchase_price}
          productExpenses={sumMoney(expenses.map((e) => e.amount))}
          currency={profile.currency}
          currencySymbol={currencySymbol(profile.currency)}
          isEdit={!!sale}
          values={{
            platform: sale?.platform ?? "",
            salePrice: sale ? moneyInput(sale.sale_price) : moneyInput(product.listed_price),
            platformFee: sale?.platform_fee ? moneyInput(sale.platform_fee) : "",
            shippingCost: sale?.shipping_cost ? moneyInput(sale.shipping_cost) : "",
            saleDate: sale?.sale_date ?? todayISO(),
            notes: sale?.notes ?? "",
          }}
        />
      </ResetOnNavigate>
    </>
  );
}
