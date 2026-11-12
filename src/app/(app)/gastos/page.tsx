import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, ReceiptIcon } from "lucide-react";
import { cn } from "cn";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getProfile } from "@/lib/auth/dal";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expenses/labels";
import { EXPENSES_LIMIT, listExpenses } from "@/lib/expenses/queries";
import { currentMonthRange, formatDate, formatMoney, sumMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Gastos" };

export default async function ExpensesPage() {
  const [expenses, profile] = await Promise.all([listExpenses(), getProfile()]);
  const money = (value: number) => formatMoney(value, profile.currency);
  const { start, end } = currentMonthRange();
  const thisMonth = expenses.filter((e) => e.expense_date >= start && e.expense_date < end);

  const addButton = (
    <Link href="/gastos/nuevo" className={cn(buttonVariants(), "w-full sm:w-auto")}>
      <PlusIcon data-icon="inline-start" /> Añadir gasto
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Gastos"
        description="Envíos, embalaje, transporte y otros costes del negocio."
        actions={addButton}
      />

      {expenses.length === 0 ? (
        <EmptyState
          icon={ReceiptIcon}
          title="Aún no hay gastos"
          description="Registra tus gastos para conocer tu beneficio neto real."
        >
          <Link href="/gastos/nuevo" className={buttonVariants()}>
            <PlusIcon data-icon="inline-start" /> Añadir gasto
          </Link>
        </EmptyState>
      ) : (
        <>
          <dl className="mb-5 grid grid-cols-2 gap-3 md:max-w-xl">
            <div className="rounded-2xl border bg-card p-4">
              <dt className="text-sm text-muted-foreground">Gastos de este mes</dt>
              <dd className="text-xl font-semibold tabular-nums">{money(sumMoney(thisMonth.map((e) => e.amount)))}</dd>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <dt className="text-sm text-muted-foreground">Total registrado</dt>
              <dd className="text-xl font-semibold tabular-nums">{money(sumMoney(expenses.map((e) => e.amount)))}</dd>
            </div>
          </dl>
          <p className="mb-3 text-sm text-muted-foreground" role="status">
            {expenses.length === 1 ? "1 gasto" : `${expenses.length} gastos`}
            {expenses.length === EXPENSES_LIMIT && ` (se muestran los ${EXPENSES_LIMIT} más recientes)`}
          </p>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {expenses.map((expense) => (
              <li key={expense.id}>
                <Link
                  href={`/gastos/${expense.id}/editar`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {expense.description || EXPENSE_CATEGORY_LABELS[expense.category]}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {EXPENSE_CATEGORY_LABELS[expense.category]} · {formatDate(expense.expense_date)}
                      {expense.productTitle && ` · ${expense.productTitle}`}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">{money(expense.amount)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
