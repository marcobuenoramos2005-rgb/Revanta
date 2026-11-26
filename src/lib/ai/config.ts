/**
 * Configuración de la IA de anuncios. Sin dependencias: se puede usar en pruebas.
 *
 * Modelo y precios verificados el 11/11/2026 en la documentación oficial:
 * https://platform.claude.com/docs/en/about-claude/models/overview
 * https://platform.claude.com/docs/en/about-claude/pricing
 */
export const AI_MODEL = "claude-haiku-5-5";

/** Precio en USD por millón de tokens (prompts de hasta 100.000 tokens). */
export const AI_PRICING = { inputPerMTok: 0.1, outputPerMTok: 0.5 } as const;

/** Tope de tokens de salida por anuncio (incluye el razonamiento interno del modelo). */
export const AI_MAX_OUTPUT_TOKENS = 4096;

/** Anuncios por usuario cada 24 horas, si no se configura AI_DAILY_LIMIT. */
export const AI_DEFAULT_DAILY_LIMIT = 20;

export const AI_REQUEST_TIMEOUT_MS = 30_000;

export const LISTING_TITLE_MAX = 80;
export const EXTRA_DETAILS_MAX = 500;

export type AiMode = "live" | "mock" | "off";

type Env = Record<string, string | undefined>;

/**
 * - "live": hay ANTHROPIC_API_KEY → llamadas reales (con coste).
 * - "mock": AI_MOCK=1 y sin clave → texto simulado, sin llamadas ni coste.
 * - "off":  nada configurado → la función se muestra como no disponible.
 * La clave real siempre tiene prioridad para que producción nunca sirva texto simulado por error.
 */
export function getAiMode(env: Env = process.env): AiMode {
  if (env.ANTHROPIC_API_KEY?.trim()) return "live";
  if (env.AI_MOCK === "1") return "mock";
  return "off";
}

export function getDailyLimit(env: Env = process.env): number {
  const value = Number(env.AI_DAILY_LIMIT);
  return Number.isInteger(value) && value > 0 && value <= 1000 ? value : AI_DEFAULT_DAILY_LIMIT;
}
