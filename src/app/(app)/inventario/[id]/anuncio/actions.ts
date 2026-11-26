"use server";

import { revalidatePath } from "next/cache";

import { EXTRA_DETAILS_MAX } from "@/lib/ai/config";
import { LISTING_ERROR_MESSAGES } from "@/lib/ai/messages";
import { LISTING_PLATFORMS, type ListingPlatform } from "@/lib/ai/prompt";
import { generateListingForProduct } from "@/lib/ai/service";

export type ListingFormState = {
  error?: string;
  result?: { title: string; description: string; simulated: boolean };
  remaining?: number;
};

export async function generateListingAction(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const platform = text("platform");
  if (!(platform in LISTING_PLATFORMS)) return { error: "Elige una plataforma válida." };
  const extraDetails = text("extraDetails").trim();
  if (extraDetails.length > EXTRA_DETAILS_MAX) {
    return { error: `Los detalles no pueden tener más de ${EXTRA_DETAILS_MAX} caracteres.` };
  }

  const productId = text("productId");
  // La sesión, el límite y la propiedad del producto se comprueban dentro del servicio.
  const outcome = await generateListingForProduct(productId, {
    platform: platform as ListingPlatform,
    extraDetails: extraDetails || null,
  });
  if (!outcome.ok) return { error: LISTING_ERROR_MESSAGES[outcome.code] };

  revalidatePath(`/inventario/${productId}/anuncio`);
  revalidatePath("/ajustes");
  return {
    result: { title: outcome.title, description: outcome.description, simulated: outcome.simulated },
    remaining: outcome.remaining,
  };
}
