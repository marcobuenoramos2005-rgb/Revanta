import { expect, test } from "@playwright/test";

test("todas las respuestas llevan cabeceras de seguridad y no revelan la tecnología", async ({ request }) => {
  for (const path of ["/", "/login", "/panel"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    const headers = response.headers();
    expect(headers["x-content-type-options"], path).toBe("nosniff");
    expect(headers["x-frame-options"], path).toBe("DENY");
    expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"], path).toContain("max-age=63072000");
    expect(headers["content-security-policy"], path).toContain("frame-ancestors 'none'");
    expect(headers["permissions-policy"], path).toContain("geolocation=()");
    expect(headers["x-powered-by"], path).toBeUndefined();
  }
});

test("la clave de la IA y las claves secretas no aparecen en el código que recibe el navegador", async ({
  page,
}) => {
  const scripts: string[] = [];
  page.on("response", async (response) => {
    if (response.url().includes("/_next/static/") && response.url().endsWith(".js")) {
      scripts.push(await response.text().catch(() => ""));
    }
  });
  await page.goto("/");
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const bundle = scripts.join("\n");
  expect(scripts.length).toBeGreaterThan(0);
  for (const forbidden of ["ANTHROPIC_API_KEY", "sk-ant-", "sb_secret_", "service_role", "api.anthropic.com"]) {
    expect(bundle, forbidden).not.toContain(forbidden);
  }
});
