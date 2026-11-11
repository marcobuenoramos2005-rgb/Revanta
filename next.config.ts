import type { NextConfig } from "next";

/** Cabeceras de seguridad que se envían en todas las respuestas. */
const securityHeaders = [
  // Obliga a usar HTTPS durante dos años (los navegadores lo ignoran en localhost).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Impide que el navegador "adivine" tipos de archivo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Impide incrustar la app en otras webs (protege frente a clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  // No envía la dirección completa de la página a otras webs.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La app no usa micrófono, ubicación, etc. La cámara se usa solo a través del selector de fotos del sistema.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // No anuncia qué tecnología usa el servidor.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
