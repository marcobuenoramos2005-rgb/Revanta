import { expect, test, type Page } from "@playwright/test";

import { signOut, signUpAndConfirm } from "./support/auth";

/** PNG válido de 1×1 px para probar la subida de fotos. */
const PHOTO = {
  name: "foto.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ),
};

async function createProduct(
  page: Page,
  product: { title: string; price: string; brand?: string; photo?: boolean },
) {
  await page.goto("/inventario/nuevo");
  await expect(page.getByRole("heading", { level: 1, name: "Añadir producto" })).toBeVisible();
  if (product.photo) {
    await page.getByLabel("Añadir fotos").setInputFiles(PHOTO);
    await expect(page.getByRole("img", { name: "Foto 1" })).toBeVisible();
  }
  await page.getByLabel("Título").fill(product.title);
  if (product.brand) await page.getByLabel("Marca").fill(product.brand);
  await page.getByLabel(/Precio de compra/).fill(product.price);
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await expect(page.getByRole("heading", { level: 1, name: product.title })).toBeVisible();
}

const filters = (page: Page) => page.getByRole("navigation", { name: "Filtrar por situación" });

test("crea un producto con foto y aparece en la ficha, la lista y el panel", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, { title: "Chaqueta vaquera", price: "12,5", brand: "Levi's", photo: true });

  // Ficha
  await expect(page).toHaveURL(/\/inventario\/[0-9a-f-]{36}$/);
  await expect(page.getByText(/12,50\s€/)).toBeVisible();
  const photo = page.getByRole("img", { name: "Foto de Chaqueta vaquera" });
  await expect(photo).toBeVisible();
  // La foto (privada, con URL firmada) se carga de verdad.
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

  // Lista
  await page.goto("/inventario");
  await expect(page.getByRole("status").filter({ hasText: "1 producto" })).toBeVisible();
  const card = page.getByRole("link", { name: /Chaqueta vaquera/ });
  await expect(card).toContainText("Levi's");
  await expect(card).toContainText("En stock");

  // Panel
  await page.goto("/panel");
  const stockValue = page.locator("[data-slot=card]").filter({ hasText: "Valor del stock" });
  await expect(stockValue).toContainText(/12,50\s€/);
});

test("valida el título y el precio", async ({ page }) => {
  await signUpAndConfirm(page);
  await page.goto("/inventario/nuevo");
  await page.getByLabel(/Precio de compra/).fill("doce");
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await expect(page.getByText("Escribe un título.")).toBeVisible();
  await expect(page.getByText("Introduce un importe válido, por ejemplo 12,50.")).toBeVisible();
  // Lo escrito no se pierde.
  await expect(page.getByLabel(/Precio de compra/)).toHaveValue("doce");
});

test("busca y filtra por situación", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, { title: "Zapatillas Samba", price: "30", brand: "Adidas" });
  await createProduct(page, { title: "Bolso de piel", price: "8", brand: "Zara" });

  // Cambia la situación del bolso a «Publicado» desde su ficha.
  const published = page.getByRole("button", { name: "Publicado" });
  await published.click();
  await expect(published).toHaveAttribute("aria-pressed", "true");

  await page.goto("/inventario");
  await expect(page.getByRole("status").filter({ hasText: "2 productos" })).toBeVisible();

  // Búsqueda por marca
  await page.getByRole("searchbox", { name: "Buscar en el inventario" }).fill("adidas");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/q=adidas/);
  await expect(page.getByRole("link", { name: /Zapatillas Samba/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Bolso de piel/ })).toHaveCount(0);

  // Búsqueda sin resultados
  await page.getByRole("searchbox", { name: "Buscar en el inventario" }).fill("no-existe");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Sin resultados" })).toBeVisible();
  await page.getByRole("link", { name: "Quitar filtros" }).click();
  await expect(page).toHaveURL(/\/inventario$/);

  // Filtro por situación
  await filters(page).getByRole("link", { name: "Publicado" }).click();
  await expect(page).toHaveURL(/estado=listed/);
  await expect(page.getByRole("link", { name: /Bolso de piel/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Zapatillas Samba/ })).toHaveCount(0);
});

test("edita un producto y quita su foto", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, { title: "Camisa de lino", price: "5", photo: true });

  await page.getByRole("link", { name: "Editar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Editar producto" })).toBeVisible();
  await expect(page.getByLabel(/Precio de compra/)).toHaveValue("5,00");
  await page.getByLabel("Título").fill("Camisa de lino blanca");
  await page.getByLabel(/Precio de venta previsto/).fill("19.99");
  await page.getByRole("button", { name: "Quitar foto 1" }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Camisa de lino blanca" })).toBeVisible();
  await expect(page.getByText(/19,99\s€/)).toBeVisible();
  await expect(page.getByText(/14,99\s€/)).toBeVisible(); // margen previsto
  await expect(page.getByText("Sin fotos")).toBeVisible();
});

test("archiva y elimina un producto", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, { title: "Lámpara vintage", price: "15", photo: true });

  // Archivado: desaparece de la vista por defecto pero sigue en «Archivado».
  const archived = page.getByRole("button", { name: "Archivado" });
  await archived.click();
  await expect(archived).toHaveAttribute("aria-pressed", "true");
  await page.goto("/inventario");
  await expect(page.getByRole("heading", { name: "Tu inventario está vacío" })).toBeVisible();
  await filters(page).getByRole("link", { name: "Archivado" }).click();
  await page.getByRole("link", { name: /Lámpara vintage/ }).click();

  // Eliminar
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar producto" }).click();
  await expect(page).toHaveURL(/\/inventario$/);
  await filters(page).getByRole("link", { name: "Archivado" }).click();
  await expect(page.getByRole("heading", { name: "Sin resultados" })).toBeVisible();
});

test("un usuario no puede ver ni editar los productos de otro", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, { title: "Producto privado de A", price: "99" });
  const productUrl = page.url();
  await signOut(page);

  await signUpAndConfirm(page);
  for (const url of [productUrl, `${productUrl}/editar`]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
    await expect(page.getByText("Producto privado de A")).toHaveCount(0);
  }
  await page.goto("/inventario");
  await expect(page.getByRole("heading", { name: "Tu inventario está vacío" })).toBeVisible();
});
