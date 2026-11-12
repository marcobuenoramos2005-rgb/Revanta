import "server-only";

import { headers } from "next/headers";

/**
 * Dirección pública de la app (sin barra final), para construir los enlaces de
 * vuelta de los emails. Orden de preferencia:
 * 1. SITE_URL, si se configura a mano (p. ej. con dominio propio).
 * 2. En Vercel, la dirección de producción o la del despliegue (automáticas).
 * 3. La dirección de la petición actual (desarrollo local).
 *
 * Aunque alguien falseara la dirección de la petición, Supabase solo acepta
 * destinos incluidos en su lista «Redirect URLs».
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  return `${protocol}://${host}`;
}

/** Destino de los enlaces por defecto de Supabase: /auth/callback y después `next`. */
export async function authCallbackUrl(next: "/panel" | "/restablecer"): Promise<string> {
  return `${await getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
