"use client";

import { startTransition, useActionState } from "react";
import Link from "next/link";

import { saveExpense } from "@/app/(app)/gastos/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "@/lib/expenses/labels";
import { initialFormState } from "@/lib/form-state";

export type ExpenseFormValues = {
  id: string;
  productId: string;
  category: string;
  description: string;
  amount: string;
  expenseDate: string;
};

export function ExpenseForm({
  values,
  products,
  currencySymbol,
  from,
}: {
  values: ExpenseFormValues;
  products: { id: string; title: string }[];
  currencySymbol: string;
  /** "product": al guardar vuelve a la ficha del producto. */
  from?: "product";
}) {
  const [state, action, pending] = useActionState(saveExpense, initialFormState);
  const errors = state.fieldErrors;
  const isEdit = !!values.id;
  const productItems: Record<string, string> = {
    "": "Ninguno (gasto general)",
    ...Object.fromEntries(products.map((p) => [p.id, p.title])),
  };
  const cancelHref = from === "product" && values.productId ? `/inventario/${values.productId}` : "/gastos";

  return (
    <form
      onSubmit={(event) => {
        // Envío manual para conservar lo escrito si el servidor devuelve errores.
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => action(formData));
      }}
      className="max-w-2xl space-y-6"
      noValidate
    >
      <input type="hidden" name="id" value={values.id} />
      {from && <input type="hidden" name="from" value={from} />}

      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      {errors && Object.keys(errors).length > 0 && (
        <FormAlert variant="error">Revisa los campos marcados en rojo.</FormAlert>
      )}

      <div className="space-y-5 rounded-2xl border bg-card p-4 md:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={`Importe (${currencySymbol})`} name="amount" errors={errors?.amount} required>
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              placeholder="0,00"
              required
              defaultValue={values.amount}
              aria-invalid={!!errors?.amount}
            />
          </FormField>
          <FormField label="Fecha" name="expenseDate" errors={errors?.expenseDate} required>
            <Input id="expenseDate" name="expenseDate" type="date" required defaultValue={values.expenseDate} />
          </FormField>
        </div>

        <FormField label="Categoría" name="category" errors={errors?.category} required>
          <Select name="category" defaultValue={values.category || null} items={EXPENSE_CATEGORY_LABELS}>
            <SelectTrigger id="category" className="w-full sm:w-72" aria-invalid={!!errors?.category}>
              <SelectValue placeholder="Elige una categoría" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {EXPENSE_CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Descripción" name="description" errors={errors?.description}>
          <Input
            id="description"
            name="description"
            maxLength={500}
            placeholder="Ej.: Sobres acolchados, gasolina al mercadillo…"
            defaultValue={values.description}
          />
        </FormField>

        <FormField
          label="Producto asociado"
          name="productId"
          errors={errors?.productId}
          hint="Si lo asocias, este gasto se descuenta del beneficio de ese producto. Si no, cuenta como gasto general del mes."
        >
          <Select name="productId" defaultValue={values.productId} items={productItems}>
            <SelectTrigger id="productId" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Ninguno (gasto general)</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Cancelar
        </Link>
        <SubmitButton pending={pending} pendingText="Guardando…" size="lg">
          {isEdit ? "Guardar cambios" : "Guardar gasto"}
        </SubmitButton>
      </div>
    </form>
  );
}
