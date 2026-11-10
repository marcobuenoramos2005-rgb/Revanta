/**
 * Devuelve una ruta interna segura a la que redirigir tras iniciar sesión.
 * Evita redirecciones abiertas a otros dominios (p. ej. "//evil.com").
 */
export function safeNextPath(value: unknown, fallback = "/panel"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
