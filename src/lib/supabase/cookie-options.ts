import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Opciones de las cookies de sesión.
 * En producción (HTTPS) se marcan como "Secure": el navegador nunca las envía por
 * una conexión sin cifrar. En desarrollo local (http://localhost) no se puede exigir.
 *
 * No son httpOnly a propósito: el navegador necesita leer la sesión para subir
 * las fotos directamente al almacenamiento de Supabase.
 */
export function sessionCookieOptions(): CookieOptionsWithName {
  const isHttps =
    typeof window === "undefined" ? Boolean(process.env.VERCEL) : window.location.protocol === "https:";
  return { secure: isHttps, sameSite: "lax", path: "/" };
}
