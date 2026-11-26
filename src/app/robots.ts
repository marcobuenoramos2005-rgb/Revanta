import type { MetadataRoute } from "next";

/**
 * Mientras la app está en pruebas privadas, se pide a los buscadores que no la indexen.
 * Al lanzar públicamente: permitir "/" y bloquear solo las rutas privadas.
 */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
