import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { getProfile } from "@/lib/auth/dal";
import { getExpense, listProductOptions } from "@/lib/expenses/queries";
import { currencySymbol, moneyInput } from "@/lib/format";
import { deleteExpense } from "../../actions";
import { ResetOnNavigate } from "@/components/reset-on-navigate";

export const metadata: Metadata = { title: "Editar gasto" };

export default async function EditExpensePage({ params, searchParams }: PageProps<"/gastos/[id]/editar">) {
  const { id } = await params;
  const from = (await searchParams).desde === "producto" ? "product" : undefined;
  const [expense, products, profile] = await Promise.all([getExpense(id), listProductOptions(), getProfile()]);
  if (!expense) notFound();

  return (
    <>
      <PageHeader
        title="Editar gasto"
        actions={
          <ConfirmDialog
            action={deleteExpense}
            fields={{ id: expense.id, ...(from ? { from } : {}) }}
            trigger={
              <>
                <Trash2Icon data-icon="inline-start" /> Eliminar
              </>
            }
            title="¿Eliminar este gasto?"
            description="Esta acción no se puede deshacer."
            confirmLabel="Eliminar gasto"
            pendingLabel="Eliminando…"
          />
        }
      />
      <ResetOnNavigate>
        <ExpenseForm
          products={products}
          currencySymbol={currencySymbol(profile.currency)}
          from={from}
          values={{
            id: expense.id,
            productId: expense.product_id ?? "",
            category: expense.category,
            description: expense.description ?? "",
            amount: moneyInput(expense.amount),
            expenseDate: expense.expense_date,
          }}
        />
      </ResetOnNavigate>
    </>
  );
}
