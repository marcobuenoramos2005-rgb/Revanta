import { AI_MAX_OUTPUT_TOKENS, AI_PRICING } from "./config";

/** Coste estimado en USD de una llamada, a partir de los tokens que devuelve la API. */
export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return (inputTokens * AI_PRICING.inputPerMTok + outputTokens * AI_PRICING.outputPerMTok) / 1_000_000;
}

/** Coste máximo posible de una sola llamada (prompt de `inputTokens` y salida al tope). */
export function maxCostPerCallUsd(inputTokens = 1500): number {
  return estimateCostUsd(inputTokens, AI_MAX_OUTPUT_TOKENS);
}

/** "0,0012 $" — con decimales suficientes para importes muy pequeños. */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: amount > 0 && amount < 1 ? 4 : 2,
  }).format(amount);
}
