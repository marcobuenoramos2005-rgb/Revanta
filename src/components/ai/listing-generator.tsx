"use client";

import { startTransition, useActionState } from "react";
import { SparklesIcon } from "lucide-react";

import {
  generateListingAction,
  type ListingFormState,
} from "@/app/(app)/inventario/[id]/anuncio/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EXTRA_DETAILS_MAX, type AiMode } from "@/lib/ai/config";
import { LISTING_PLATFORMS, type ListingPlatform } from "@/lib/ai/prompt";
import { ListingText } from "./listing-text";

const initialState: ListingFormState = {};

export function ListingGenerator({
  productId,
  mode,
  limit,
  remaining: initialRemaining,
}: {
  productId: string;
  mode: AiMode;
  limit: number;
  remaining: number;
}) {
  const [state, action, pending] = useActionState(generateListingAction, initialState);
  const remaining = state.remaining ?? initialRemaining;
  const exhausted = remaining <= 0;

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          startTransition(() => action(formData));
        }}
        className="space-y-5 rounded-2xl border bg-card p-4 md:p-6"
      >
        <input type="hidden" name="productId" value={productId} />

        {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

        <FormField label="¿Dónde lo vas a publicar?" name="platform">
          <Select name="platform" defaultValue={"general" satisfies ListingPlatform} items={LISTING_PLATFORMS}>
            <SelectTrigger id="platform" className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LISTING_PLATFORMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Detalles a destacar"
          name="extraDetails"
          hint="Opcional: medidas, material, defectos, motivo de la venta… La IA solo usará lo que esté en la ficha y lo que escribas aquí."
        >
          <Textarea id="extraDetails" name="extraDetails" rows={3} maxLength={EXTRA_DETAILS_MAX} />
        </FormField>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" role="status">
            {exhausted
              ? "Has usado todos tus anuncios de las últimas 24 horas."
              : `Te quedan ${remaining} de ${limit} anuncios en las próximas 24 horas.`}
          </p>
          <SubmitButton
            pending={pending}
            pendingText="Generando…"
            size="lg"
            disabled={pending || exhausted || mode === "off"}
          >
            <SparklesIcon data-icon="inline-start" />
            {state.result ? "Generar otra versión" : "Generar anuncio"}
          </SubmitButton>
        </div>
      </form>

      {state.result && (
        <section aria-labelledby="resultado" className="rounded-2xl border border-primary/40 bg-card p-4 md:p-6">
          <h2 id="resultado" className="mb-4 text-base font-semibold">
            Tu anuncio
          </h2>
          <ListingText title={state.result.title} description={state.result.description} />
          <p className="mt-4 text-xs text-muted-foreground">
            {state.result.simulated
              ? "Texto simulado de prueba: no lo ha escrito la IA."
              : "Texto generado con IA. Revísalo antes de publicarlo: puede contener errores."}
          </p>
        </section>
      )}
    </div>
  );
}
