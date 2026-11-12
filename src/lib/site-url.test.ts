import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const requestHeaders = new Map<string, string>();
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (name: string) => requestHeaders.get(name) ?? null }),
}));

import { authCallbackUrl, getSiteUrl } from "./site-url";

afterEach(() => {
  vi.unstubAllEnvs();
  requestHeaders.clear();
});

describe("dirección pública de la app", () => {
  it("en local usa la dirección de la petición con http", async () => {
    requestHeaders.set("host", "localhost:3000");
    expect(await getSiteUrl()).toBe("http://localhost:3000");
  });

  it("en producción de Vercel usa la dirección de producción con https", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "revanta.vercel.app");
    vi.stubEnv("VERCEL_URL", "revanta-abc123.vercel.app");
    requestHeaders.set("host", "otra-cosa.example.com");
    expect(await getSiteUrl()).toBe("https://revanta.vercel.app");
  });

  it("en un despliegue de prueba de Vercel usa la dirección de ese despliegue", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "revanta-abc123.vercel.app");
    expect(await getSiteUrl()).toBe("https://revanta-abc123.vercel.app");
  });

  it("SITE_URL tiene prioridad (dominio propio) y se limpia la barra final", async () => {
    vi.stubEnv("SITE_URL", "https://revanta.es/");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "revanta.vercel.app");
    expect(await getSiteUrl()).toBe("https://revanta.es");
  });

  it("detrás de un proxy usa la dirección y el protocolo reenviados", async () => {
    requestHeaders.set("host", "interno:3000");
    requestHeaders.set("x-forwarded-host", "app.example.com");
    requestHeaders.set("x-forwarded-proto", "https");
    expect(await getSiteUrl()).toBe("https://app.example.com");
  });

  it("construye el destino de los enlaces de email", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "revanta.vercel.app");
    expect(await authCallbackUrl("/panel")).toBe("https://revanta.vercel.app/auth/callback?next=%2Fpanel");
    expect(await authCallbackUrl("/restablecer")).toBe(
      "https://revanta.vercel.app/auth/callback?next=%2Frestablecer",
    );
  });
});
