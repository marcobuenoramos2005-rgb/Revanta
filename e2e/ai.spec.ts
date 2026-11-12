import { expect, test, type Page } from "@playwright/test";

import { signOut, signUpAndConfirm } from "./support/auth";

// El servidor de pruebas arranca con AI_MOCK=1, AI_DAILY_LIMIT=3 y sin clave
// (ver playwright.config.ts): no se hace ninguna llamada real a la API.

async function createProduct(page: Page, title: string) {
  await page.goto("/inventario/nuevo");
  await expect(page.getByRole("heading", { level: 1, name: "Añadir producto" })).toBeVisible();
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Marca").fill("Levi's");
  await page.getByLabel("Talla").fill("M");
  await page.getByLabel(/Precio de compra/).fill("10");
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
}

const result = (page: Page) => page.getByRole("region", { name: "Tu anuncio" });

test("genera un anuncio (simulado), lo copia, lo guarda en el historial y cuenta el consumo", async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await signUpAndConfirm(page);
  await createProduct(page, "Chaqueta vaquera");

  await page.getByRole("link", { name: /Generar anuncio con IA/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Anuncio con IA" })).toBeVisible();
  await expect(page.getByText("Modo de prueba: los textos son simulados")).toBeVisible();
  await expect(page.getByText("Te quedan 3 de 3 anuncios")).toBeVisible();

  await page.getByRole("combobox", { name: "¿Dónde lo vas a publicar?" }).click();
  await page.getByRole("option", { name: "Vinted", exact: true }).click();
  await page.getByLabel("Detalles a destacar").fill("Pequeño roce en el puño");
  await page.getByRole("button", { name: "Generar anuncio" }).click();

  await expect(result(page)).toContainText("Levi's Chaqueta vaquera talla M");
  await expect(result(page)).toContainText("[Texto simulado · Vinted]");
  await expect(result(page)).toContainText("Pequeño roce en el puño");
  await expect(result(page)).toContainText("Texto simulado de prueba: no lo ha escrito la IA.");
  await expect(page.getByText("Te quedan 2 de 3 anuncios")).toBeVisible();

  // Copiar al portapapeles
  await result(page).getByRole("button", { name: "Copiar título" }).click();
  await expect(page.getByText("Copiado al portapapeles")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("Levi's Chaqueta vaquera talla M");

  // Historial (tras recargar) y consumo en Ajustes
  await page.reload();
  const history = page.getByRole("region", { name: "Anuncios anteriores" });
  await expect(history.getByRole("listitem")).toHaveCount(1);
  await expect(history).toContainText("simulado");
  await expect(page.getByText("Te quedan 2 de 3 anuncios")).toBeVisible();

  await page.goto("/ajustes");
  const card = page.locator("[data-slot=card]").filter({ hasText: "Anuncios con IA" });
  await expect(card).toContainText("1 de 3 anuncios");
  await expect(card).toContainText("1 anuncio");
  await expect(card).toContainText(/0,00\sUS\$/);
});

test("aplica el límite diario por usuario", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, "Bolso de piel");
  await page.getByRole("link", { name: /Generar anuncio con IA/ }).click();

  for (const remaining of [2, 1]) {
    await page.getByRole("button", { name: /Generar (anuncio|otra versión)/ }).click();
    await expect(page.getByText(`Te quedan ${remaining} de 3 anuncios`)).toBeVisible();
  }
  await page.getByRole("button", { name: "Generar otra versión" }).click();
  await expect(page.getByText("Has usado todos tus anuncios de las últimas 24 horas.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Generar otra versión" })).toBeDisabled();

  // El límite se aplica en el servidor: tras recargar sigue agotado.
  await page.reload();
  await expect(page.getByText("Has usado todos tus anuncios de las últimas 24 horas.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Generar anuncio" })).toBeDisabled();
  await expect(page.getByRole("region", { name: "Anuncios anteriores" }).getByRole("listitem")).toHaveCount(3);
});

test("un usuario no puede generar anuncios de productos de otro ni ver su historial", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, "Producto de A");
  const listingUrl = `${page.url()}/anuncio`;
  await page.goto(listingUrl);
  await page.getByRole("button", { name: "Generar anuncio" }).click();
  await expect(result(page)).toBeVisible();
  await signOut(page);

  await signUpAndConfirm(page);
  await page.goto(listingUrl);
  await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
  await expect(page.getByText("Producto de A")).toHaveCount(0);
  // El consumo de A no cuenta para B.
  await page.goto("/ajustes");
  await expect(page.locator("[data-slot=card]").filter({ hasText: "Anuncios con IA" })).toContainText("0 de 3 anuncios");
});
