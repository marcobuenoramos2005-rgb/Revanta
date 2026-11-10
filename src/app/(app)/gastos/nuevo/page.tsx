import type { Metadata } from "next";

import { PageHeader } from "@/components/app-shell/page-header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getProfile } from "@/lib/auth/dal";
import { listProductOptions } from "@/lib/expenses/queries";
import { currencySymbol, todayISO } from "@/lib/format";
import { ResetOnNavigate } from "@/components/reset-on-navigate";

export const metadata: Metadata = { title: "Añadir gasto" };

export default async function NewExpensePage({ searchParams }: PageProps<"/gastos/nuevo">) {
  const params = await searchParams;
  const requested = Array.isArray(params.producto) ? params.producto[0] : params.producto;
  const [products, profile] = await Promise.all([listProductOptions(), getProfile()]);
  // Solo se preselecciona si el producto es del usuario (la lista ya pasa por RLS).
  const product = products.find((p) => p.id === requested);

  return (
    <>
      <PageHeader
        title="Añadir gasto"
        description={product ? `Gasto de «${product.title}»` : "Un gasto del negocio o de un producto concreto."}
      />
      <ResetOnNavigate>
        <ExpenseForm
          products={products}
          currencySymbol={currencySymbol(profile.currency)}
          from={product ? "product" : undefined}
          values={{
            id: "",
            productId: product?.id ?? "",
            category: "",
            description: "",
            amount: "",
            expenseDate: todayISO(),
          }}
        />
      </ResetOnNavigate>
    </>
  );
}
