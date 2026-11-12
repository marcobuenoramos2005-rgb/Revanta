"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";

import { createProduct, updateProduct } from "@/app/(app)/inventario/actions";
import { FieldErrorText } from "@/components/forms/field-error";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState } from "@/lib/form-state";
import { compressImage } from "@/lib/images";
import {
  CATEGORY_SUGGESTIONS,
  CONDITION_LABELS,
  CONDITIONS,
  EDITABLE_STATUSES,
  STATUS_LABELS,
} from "@/lib/products/labels";
import { photoPath } from "@/lib/products/schema";
import { createClient } from "@/lib/supabase/client";
import { PhotoPicker, type PhotoItem } from "./photo-picker";

export type ProductFormValues = {
  title: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  condition: string;
  status: string;
  purchasePrice: string;
  purchaseDate: string;
  purchaseSource: string;
  listedPrice: string;
  notes: string;
};

const conditionItems = { "": "Sin especificar", ...CONDITION_LABELS };
const statusItems = Object.fromEntries(EDITABLE_STATUSES.map((s) => [s, STATUS_LABELS[s]]));

export function ProductForm({
  mode,
  userId,
  productId,
  values,
  initialPhotos = [],
  currencySymbol,
  isSold = false,
}: {
  mode: "create" | "edit";
  userId: string;
  productId: string;
  values: ProductFormValues;
  initialPhotos?: { path: string; url: string }[];
  currencySymbol: string;
  isSold?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createProduct : updateProduct,
    initialFormState,
  );
  const [photos, setPhotos] = useState<PhotoItem[]>(
    initialPhotos.map((photo) => ({ key: photo.path, path: photo.path, previewUrl: photo.url })),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const busy = pending || uploading;
  const errors = state.fieldErrors;

  /** Sube las fotos nuevas y devuelve la lista final de rutas. */
  async function uploadPending(): Promise<string[]> {
    const supabase = createClient();
    const result = [...photos];
    for (let i = 0; i < result.length; i++) {
      const photo = result[i];
      if (photo.path || !photo.file) continue;
      const blob = await compressImage(photo.file);
      const path = photoPath(userId, productId, crypto.randomUUID());
      const { error } = await supabase.storage
        .from("product-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      result[i] = { ...photo, path, file: undefined };
    }
    setPhotos(result);
    return result.map((photo) => photo.path!);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setUploadError(undefined);
    setUploading(true);
    try {
      formData.set("photoPaths", JSON.stringify(await uploadPending()));
    } catch {
      setUploadError("No se han podido subir las fotos. Comprueba tu conexión e inténtalo de nuevo.");
      return;
    } finally {
      setUploading(false);
    }
    startTransition(() => formAction(formData));
  }

  const field = (name: keyof ProductFormValues) => ({
    id: name,
    name,
    defaultValue: values[name],
    "aria-invalid": !!errors?.[name],
    "aria-describedby": errors?.[name] ? `${name}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8" noValidate>
      <input type="hidden" name="id" value={productId} />

      {(state.error || uploadError) && <FormAlert variant="error">{state.error ?? uploadError}</FormAlert>}
      {errors && Object.keys(errors).length > 0 && (
        <FormAlert variant="error">Revisa los campos marcados en rojo.</FormAlert>
      )}

      <Section title="Fotos">
        <PhotoPicker photos={photos} onChange={setPhotos} disabled={busy} />
        <FieldErrorText id="photoPaths-error" errors={errors?.photoPaths} />
      </Section>

      <Section title="Producto">
        <Field label="Título" name="title" errors={errors?.title} required>
          <Input {...field("title")} required maxLength={200} placeholder="Ej.: Chaqueta vaquera Levi's" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Marca" name="brand" errors={errors?.brand}>
            <Input {...field("brand")} maxLength={100} />
          </Field>
          <Field label="Categoría" name="category" errors={errors?.category}>
            <Input {...field("category")} maxLength={100} list="category-suggestions" />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>
          <Field label="Talla" name="size" errors={errors?.size}>
            <Input {...field("size")} maxLength={50} placeholder="Ej.: M, 42, única" />
          </Field>
          <Field label="Color" name="color" errors={errors?.color}>
            <Input {...field("color")} maxLength={50} />
          </Field>
          <Field label="Estado del artículo" name="condition" errors={errors?.condition}>
            <Select name="condition" defaultValue={values.condition} items={conditionItems}>
              <SelectTrigger id="condition" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin especificar</SelectItem>
                {CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {CONDITION_LABELS[condition]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {isSold ? (
            <input type="hidden" name="status" value="in_stock" />
          ) : (
            <Field label="Situación" name="status" errors={errors?.status}>
              <Select name="status" defaultValue={values.status} items={statusItems}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EDITABLE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>
      </Section>

      <Section title="Compra">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={`Precio de compra (${currencySymbol})`} name="purchasePrice" errors={errors?.purchasePrice} required>
            <Input {...field("purchasePrice")} required inputMode="decimal" placeholder="0,00" />
          </Field>
          <Field label="Fecha de compra" name="purchaseDate" errors={errors?.purchaseDate}>
            <Input {...field("purchaseDate")} type="date" />
          </Field>
        </div>
        <Field label="¿Dónde lo compraste?" name="purchaseSource" errors={errors?.purchaseSource}>
          <Input {...field("purchaseSource")} maxLength={200} placeholder="Ej.: Rastro, Vinted, Humana…" />
        </Field>
      </Section>

      <Section title="Venta">
        <Field
          label={`Precio de venta previsto (${currencySymbol})`}
          name="listedPrice"
          errors={errors?.listedPrice}
          hint="Opcional. El precio al que lo publicas."
        >
          <Input {...field("listedPrice")} inputMode="decimal" placeholder="0,00" className="sm:max-w-xs" />
        </Field>
        <Field label="Notas" name="notes" errors={errors?.notes}>
          <Textarea {...field("notes")} maxLength={5000} rows={4} placeholder="Medidas, defectos, dónde lo guardas…" />
        </Field>
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={mode === "create" ? "/inventario" : `/inventario/${productId}`}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Cancelar
        </Link>
        <SubmitButton
          pending={busy}
          pendingText={uploading ? "Subiendo fotos…" : "Guardando…"}
          size="lg"
        >
          {mode === "create" ? "Guardar producto" : "Guardar cambios"}
        </SubmitButton>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 rounded-2xl border bg-card p-4 md:p-6">
      <legend className="float-left mb-4 w-full text-base font-semibold">{title}</legend>
      <div className="clear-both space-y-5">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  name,
  errors,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </Label>
      {children}
      {hint && !errors?.length && <p className="text-sm text-muted-foreground">{hint}</p>}
      <FieldErrorText id={`${name}-error`} errors={errors} />
    </div>
  );
}
