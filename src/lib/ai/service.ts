import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { getProfile, requireUser } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/format";
import { CONDITION_LABELS } from "@/lib/products/labels";
import { idSchema } from "@/lib/products/schema";
import { createClient } from "@/lib/supabase/server";
import { AI_REQUEST_TIMEOUT_MS, getAiMode, getDailyLimit, type AiMode } from "./config";
import { estimateCostUsd } from "./cost";
import { generateListing } from "./generate";
import type { ListingFailureCode } from "./messages";
import { generateMockListing, MOCK_MODEL } from "./mock";
import type { ListingInput, ListingPlatform } from "./prompt";

const DAY_MS = 24 * 60 * 60 * 1000;

let cachedClient: Anthropic | undefined;

/**
 * Cliente de Anthropic. La clave se lee de ANTHROPIC_API_KEY solo en el servidor
 * (este módulo es "server-only": importarlo desde el navegador rompe la compilación).
 */
function getClient() {
  cachedClient ??= new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: AI_REQUEST_TIMEOUT_MS,
    maxRetries: 1,
  });
  return cachedClient;
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Generaciones del usuario en las últimas 24 horas (RLS: solo cuenta las suyas). */
async function countRecent(supabase: Supabase): Promise<number | null> {
  const since = new Date(Date.now() - DAY_MS).toISOString();
  const { count, error } = await supabase
    .from("ai_generations")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  return error ? null : (count ?? 0);
}

export type AiUsage = {
  mode: AiMode;
  limit: number;
  usedToday: number;
  remaining: number;
  monthCount: number;
  /** Coste estimado del mes en USD, según los tokens registrados. */
  monthCostUsd: number;
};

export async function getAiUsage(): Promise<AiUsage> {
  await requireUser();
  const supabase = await createClient();
  const limit = getDailyLimit();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [usedToday, month] = await Promise.all([
    countRecent(supabase),
    supabase
      .from("ai_generations")
      .select("input_tokens, output_tokens")
      .gte("created_at", monthStart.toISOString())
      .limit(1000),
  ]);

  const rows = month.data ?? [];
  const used = usedToday ?? limit; // si no se puede contar, se asume agotado
  return {
    mode: getAiMode(),
    limit,
    usedToday: used,
    remaining: Math.max(0, limit - used),
    monthCount: rows.length,
    monthCostUsd: rows.reduce((sum, r) => sum + estimateCostUsd(r.input_tokens, r.output_tokens), 0),
  };
}

export type ListingHistoryItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  simulated: boolean;
};

export async function listProductListings(productId: string): Promise<ListingHistoryItem[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_generations")
    .select("id, title, description, created_at, model")
    .eq("product_id", productId)
    .not("title", "is", null)
    .order("created_at", { ascending: false })
    .limit(5);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title ?? "",
    description: row.description ?? "",
    createdAt: row.created_at,
    simulated: row.model === MOCK_MODEL,
  }));
}

export type GenerateOutcome =
  | { ok: true; title: string; description: string; simulated: boolean; remaining: number }
  | { ok: false; code: ListingFailureCode };

/**
 * Genera el anuncio de un producto del usuario actual.
 * Orden: sesión → modo → límite diario → producto (RLS) → IA → registro de consumo.
 */
export async function generateListingForProduct(
  productId: string,
  options: { platform: ListingPlatform; extraDetails: string | null },
): Promise<GenerateOutcome> {
  await requireUser();
  const mode = getAiMode();
  if (mode === "off") return { ok: false, code: "not_configured" };
  if (!idSchema.safeParse(productId).success) return { ok: false, code: "not_found" };

  const supabase = await createClient();
  const limit = getDailyLimit();
  const used = await countRecent(supabase);
  if (used === null) return { ok: false, code: "unavailable" };
  if (used >= limit) return { ok: false, code: "limit_reached" };

  const [{ data: product }, profile] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, brand, category, size, color, condition, listed_price")
      .eq("id", productId)
      .maybeSingle(),
    getProfile(),
  ]);
  if (!product) return { ok: false, code: "not_found" };

  // Solo se envían datos del anuncio: nunca precio de compra, origen ni notas privadas.
  const input: ListingInput = {
    title: product.title,
    brand: product.brand,
    category: product.category,
    size: product.size,
    color: product.color,
    condition: product.condition && CONDITION_LABELS[product.condition],
    price: product.listed_price === null ? null : formatMoney(product.listed_price, profile.currency),
    platform: options.platform,
    extraDetails: options.extraDetails,
  };

  const result = mode === "live" ? await generateListing(getClient(), input) : generateMockListing(input);

  // Registra el consumo: los aciertos y también los fallos que han gastado tokens.
  if (result.ok || result.inputTokens > 0 || result.outputTokens > 0) {
    const { error } = await supabase.from("ai_generations").insert({
      product_id: product.id,
      model: result.ok ? result.model : "error",
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      title: result.ok ? result.title : null,
      description: result.ok ? result.description : null,
    });
    // Sin registro no hay control del límite: se corta por seguridad.
    if (error) {
      console.error("[ai] no se pudo registrar el consumo", { code: error.code });
      return { ok: false, code: "unavailable" };
    }
  }

  if (!result.ok) return { ok: false, code: result.code };
  return {
    ok: true,
    title: result.title,
    description: result.description,
    simulated: mode === "mock",
    remaining: Math.max(0, limit - used - 1),
  };
}
