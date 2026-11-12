import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { AI_MAX_OUTPUT_TOKENS, AI_MODEL, LISTING_TITLE_MAX } from "./config";
import { buildListingUserMessage, LISTING_SYSTEM_PROMPT, type ListingInput } from "./prompt";

export const listingOutputSchema = z.object({
  title: z.string().describe("Título del anuncio"),
  description: z.string().describe("Descripción del anuncio"),
});

export type ListingErrorCode =
  | "not_configured" // falta la clave o es inválida, o la cuenta no tiene crédito/permiso
  | "rate_limited" // Anthropic limita temporalmente las peticiones
  | "unavailable" // error del servicio, sobrecarga, red o tiempo de espera
  | "refused" // el modelo se negó a generar el contenido
  | "truncated" // se alcanzó el tope de tokens antes de terminar
  | "invalid_output"; // la respuesta no tiene el formato esperado

export type ListingResult =
  | {
      ok: true;
      title: string;
      description: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
    }
  | {
      ok: false;
      code: ListingErrorCode;
      /** Tokens facturados aunque no haya anuncio (p. ej. respuesta truncada). */
      inputTokens: number;
      outputTokens: number;
    };

/** Lo mínimo que se necesita del SDK: permite inyectar un cliente falso en las pruebas. */
export type ListingClient = { messages: Pick<Anthropic["messages"], "parse"> };

function failure(code: ListingErrorCode, usage?: { input_tokens: number; output_tokens: number }): ListingResult {
  return { ok: false, code, inputTokens: usage?.input_tokens ?? 0, outputTokens: usage?.output_tokens ?? 0 };
}

/** Recorta el título en un límite de palabra si el modelo se pasa del máximo. */
function clampTitle(title: string) {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= LISTING_TITLE_MAX) return clean;
  const cut = clean.slice(0, LISTING_TITLE_MAX);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), LISTING_TITLE_MAX - 20)).trim();
}

/**
 * Genera el anuncio con la API de Claude. Nunca lanza excepciones: devuelve un
 * resultado con código de error para que la app muestre un mensaje claro.
 */
export async function generateListing(client: ListingClient, input: ListingInput): Promise<ListingResult> {
  try {
    const response = await client.messages.parse({
      model: AI_MODEL,
      max_tokens: AI_MAX_OUTPUT_TOKENS,
      // Tarea sencilla: esfuerzo bajo = menos tokens de razonamiento y menor coste.
      output_config: { effort: "low", format: zodOutputFormat(listingOutputSchema) },
      system: LISTING_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildListingUserMessage(input) }],
    });

    if (response.stop_reason === "refusal") return failure("refused", response.usage);
    if (response.stop_reason === "max_tokens") return failure("truncated", response.usage);

    const parsed = listingOutputSchema.safeParse(response.parsed_output);
    const title = parsed.success ? clampTitle(parsed.data.title) : "";
    const description = parsed.success ? parsed.data.description.trim() : "";
    if (!title || !description) return failure("invalid_output", response.usage);

    return {
      ok: true,
      title,
      description,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  } catch (error) {
    console.error("[ai] error al generar el anuncio", describeErrorForLog(error));
    return failure(classifyError(error));
  }
}

/** Traduce las excepciones tipadas del SDK a códigos propios (de la más específica a la más general). */
export function classifyError(error: unknown): ListingErrorCode {
  if (error instanceof Anthropic.AuthenticationError) return "not_configured"; // 401: clave inválida
  if (error instanceof Anthropic.PermissionDeniedError) return "not_configured"; // 403: sin acceso al modelo
  if (error instanceof Anthropic.NotFoundError) return "not_configured"; // 404: modelo inexistente
  if (error instanceof Anthropic.RateLimitError) return "rate_limited"; // 429
  if (error instanceof Anthropic.BadRequestError) return "not_configured"; // 400: p. ej. sin crédito
  if (error instanceof Anthropic.APIConnectionError) return "unavailable"; // red o tiempo de espera
  if (error instanceof Anthropic.APIError) return "unavailable"; // 5xx, 529 sobrecarga…
  return "invalid_output"; // p. ej. JSON que no se pudo interpretar
}

/** Datos seguros para el registro del servidor: nunca la clave, el prompt ni el texto generado. */
export function describeErrorForLog(error: unknown) {
  if (error instanceof Anthropic.APIError) {
    return { type: error.constructor.name, status: error.status, requestId: error.requestID };
  }
  return { type: error instanceof Error ? error.constructor.name : typeof error };
}
