import { LISTING_PLATFORMS, type ListingInput } from "./prompt";
import type { ListingResult } from "./generate";

export const MOCK_MODEL = "mock";

/**
 * Generador simulado: construye un texto de ejemplo a partir de los datos del
 * producto, sin llamar a ninguna API y sin coste. Sirve para desarrollar y probar.
 * El texto se marca como simulado para que nadie lo confunda con uno real.
 */
export function generateMockListing(input: ListingInput): ListingResult {
  const title = [input.brand, input.title, input.size && `talla ${input.size}`, input.color]
    .filter(Boolean)
    .join(" ")
    .slice(0, 80);

  const facts = [
    input.condition && `Estado: ${input.condition.toLowerCase()}.`,
    input.category && `Categoría: ${input.category}.`,
    input.extraDetails && `${input.extraDetails.trim()}.`,
  ].filter(Boolean);

  const description = [
    `[Texto simulado · ${LISTING_PLATFORMS[input.platform]}]`,
    `Vendo ${input.title}${input.brand ? ` de ${input.brand}` : ""}.`,
    ...facts,
    "Este texto es un ejemplo generado sin IA para probar la aplicación.",
  ].join(" ");

  return { ok: true, title, description, model: MOCK_MODEL, inputTokens: 0, outputTokens: 0 };
}
