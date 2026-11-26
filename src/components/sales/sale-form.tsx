"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { cn } from "cn";

import { saveSale } from "@/app/(app)/ventas/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { initialFormState } from "@/lib/form-state";
import { formatMoney } from "@/lib/format";
import { PLATFORM_LABELS, PLATFORMS } from "@/lib/sales/labels";

export type SaleFormValues = {
  platform: string;
  salePrice: string;
  platformFee: string;
  shippingCost: string;
  saleDate: string;
  notes: string;
};

/** Convierte "12,5" en 12.5; devuelve 0 si está vacío y null si no es un importe válido. */
function parseAmount(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return 0;
  return /^\d{1,9}(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : null;
}

export function SaleForm({
  productId,
  purchasePrice,
  productExpenses,
  currency,
  currencySymbol,
  values,
  isEdit,
}: {
  productId: string;
  purchasePrice: number;
  productExpenses: number;
  currency: string;
  currencySymbol: string;
  values: SaleFormValues;
  isEdit: boolean;
}) {
  const [state, action, pending] = useActionState(saveSale, initialFormState);
  const [amounts, setAmounts] = useState({
    salePrice: values.salePrice,
    platformFee: values.platformFee,
    shippingCost: values.shippingCost,
  });
  const errors = state.fieldErrors;

  const sale = parseAmount(amounts.salePrice);
  const fee = parseAmount(amounts.platformFee);
  const shipping = parseAmount(amounts.shippingCost);
  const hasPrice = amounts.salePrice.trim() !== "";
  const profit =
    hasPrice && sale !== null && fee !== null && shipping !== null
      ? (Math.round(sale * 100) -
          Math.round(fee * 100) -
          Math.round(shipping * 100) -
          Math.round(purchasePrice * 100) -
          Math.round(productExpenses * 100)) /
        100
      : null;

  const amountField = (name: keyof typeof amounts) => ({
    id: name,
    name,
    inputMode: "decimal" as const,
    placeholder: "0,00",
    value: amounts[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setAmounts((prev) => ({ ...prev, [name]: e.target.value })),
    "aria-invalid": !!errors?.[name],
  });

  const money = (value: number) => formatMoney(value, currency);

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
      <input type="hidden" name="productId" value={productId} />

      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      {errors && Object.keys(errors).length > 0 && (
        <FormAlert variant="error">Revisa los campos marcados en rojo.</FormAlert>
      )}

      <div className="space-y-5 rounded-2xl border bg-card p-4 md:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="¿Dónde lo has vendido?" name="platform" errors={errors?.platform} required>
            <Select name="platform" defaultValue={values.platform || null} items={PLATFORM_LABELS}>
              <SelectTrigger id="platform" className="w-full" aria-invalid={!!errors?.platform}>
                <SelectValue placeholder="Elige una plataforma" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {PLATFORM_LABELS[platform]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Fecha de venta" name="saleDate" errors={errors?.saleDate} required>
            <Input id="saleDate" name="saleDate" type="date" defaultValue={values.saleDate} required />
          </FormField>
        </div>

        <FormField
          label={`Precio de venta (${currencySymbol})`}
          name="salePrice"
          errors={errors?.salePrice}
          hint="Lo que paga el comprador por el artículo, sin contar el envío."
          required
        >
          <Input {...amountField("salePrice")} required className="sm:max-w-xs" />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label={`Comisión de la plataforma (${currencySymbol})`}
            name="platformFee"
            errors={errors?.platformFee}
            hint="Lo que te descuenta la plataforma. Déjalo vacío si no hay."
          >
            <Input {...amountField("platformFee")} />
          </FormField>
          <FormField
            label={`Envío pagado por ti (${currencySymbol})`}
            name="shippingCost"
            errors={errors?.shippingCost}
            hint="Si el envío lo paga el comprador, déjalo vacío."
          >
            <Input {...amountField("shippingCost")} />
          </FormField>
        </div>

        <FormField label="Notas" name="notes" errors={errors?.notes}>
          <Textarea id="notes" name="notes" defaultValue={values.notes} maxLength={2000} rows={3} />
        </FormField>
      </div>

      <section aria-label="Cálculo del beneficio" className="rounded-2xl border bg-card p-4 md:p-6">
        <h2 className="mb-3 text-base font-semibold">Beneficio neto</h2>
        <dl className="space-y-1.5 text-sm">
          <Line label="Precio de venta" value={sale !== null && hasPrice ? money(sale) : "—"} />
          <Line label="Comisión" value={fee ? `− ${money(fee)}` : "—"} />
          <Line label="Envío pagado por ti" value={shipping ? `− ${money(shipping)}` : "—"} />
          <Line label="Precio de compra" value={`− ${money(purchasePrice)}`} />
          <Line
            label="Gastos del producto"
            value={productExpenses ? `− ${money(productExpenses)}` : "—"}
          />
          <div className="flex items-baseline justify-between gap-4 border-t pt-3">
            <dt className="font-medium">Beneficio neto</dt>
            <dd
              data-testid="profit-preview"
              className={cn(
                "text-2xl font-semibold tabular-nums",
                profit === null ? "text-muted-foreground" : profit >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {profit === null ? "—" : money(profit)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/inventario/${productId}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Cancelar
        </Link>
        <SubmitButton pending={pending} pendingText="Guardando…" size="lg">
          {isEdit ? "Guardar cambios" : "Registrar venta"}
        </SubmitButton>
      </div>
    </form>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
