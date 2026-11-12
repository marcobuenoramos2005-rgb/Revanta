import { expect, test, type Page } from "@playwright/test";

import { signUpAndConfirm } from "./support/auth";

const isoDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

async function createProduct(
  page: Page,
  product: { title: string; price: string; category?: string; purchaseDate?: string },
) {
  await page.goto("/inventario/nuevo");
  await expect(page.getByRole("heading", { level: 1, name: "Añadir producto" })).toBeVisible();
  await page.getByLabel("Título").fill(product.title);
  if (product.category) await page.getByLabel("Categoría").fill(product.category);
  await page.getByLabel(/Precio de compra/).fill(product.price);
  if (product.purchaseDate) await page.getByLabel("Fecha de compra").fill(product.purchaseDate);
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await expect(page.getByRole("heading", { level: 1, name: product.title })).toBeVisible();
}

async function sell(page: Page, platform: string, price: string) {
  await page.getByRole("link", { name: "Registrar venta" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Registrar venta" })).toBeVisible();
  await page.getByRole("combobox", { name: "¿Dónde lo has vendido?" }).click();
  await page.getByRole("option", { name: platform, exact: true }).click();
  await page.getByLabel("Fecha de venta").fill(isoDaysAgo(0));
  await page.getByLabel(/^Precio de venta \(/).fill(price);
  await page.getByRole("button", { name: "Registrar venta" }).click();
  await expect(page.getByTestId("net-profit")).toBeVisible();
}

const stat = (page: Page, label: string) => page.locator("dl > div").filter({ hasText: label });
const panel = (page: Page, title: string) => page.getByRole("region", { name: title });

test("estadísticas: totales, margen, días hasta la venta, plataformas y categorías", async ({ page }) => {
  await signUpAndConfirm(page);

  await page.goto("/estadisticas");
  await expect(page.getByRole("heading", { name: "Todavía no hay datos en este periodo" })).toBeVisible();

  // Chaqueta: 30 − 10 = +20 (Vinted, Ropa, comprada hace 5 días)
  await createProduct(page, { title: "Chaqueta", price: "10", category: "Ropa", purchaseDate: isoDaysAgo(5) });
  await sell(page, "Vinted", "30");
  // Lámpara: 5 − 8 = −3 (Wallapop, sin categoría ni fecha de compra)
  await createProduct(page, { title: "Lámpara", price: "8" });
  await sell(page, "Wallapop", "5");
  // Gasto general: 5
  await page.goto("/gastos/nuevo");
  await page.getByLabel(/Importe/).fill("5");
  await page.getByRole("combobox", { name: "Categoría" }).click();
  await page.getByRole("option", { name: "Otros", exact: true }).click();
  await page.getByRole("button", { name: "Guardar gasto" }).click();
  await expect(page).toHaveURL(/\/gastos$/);

  await page.goto("/estadisticas");
  // 20 − 3 − 5 = 12
  await expect(stat(page, "Beneficio neto")).toContainText(/12,00\s€/);
  await expect(stat(page, "Beneficio neto")).toContainText(/Tras 5,00\s€ de gastos generales/);
  await expect(stat(page, "Ingresos por ventas")).toContainText(/35,00\s€/);
  await expect(stat(page, "Ingresos por ventas")).toContainText("2 ventas");
  // 17 / 35 = 48,6 %
  await expect(stat(page, "Margen medio")).toContainText(/48,6\s%/);
  await expect(stat(page, "Tiempo medio hasta vender")).toContainText("5 días");

  const platforms = panel(page, "Beneficio por plataforma").getByRole("listitem");
  await expect(platforms).toHaveCount(2);
  await expect(platforms.nth(0)).toContainText(/Vinted · 1 venta.*20,00\s€/);
  await expect(platforms.nth(1)).toContainText(/Wallapop · 1 venta.*-3,00\s€/);

  const categories = panel(page, "Beneficio por categoría").getByRole("listitem");
  await expect(categories.nth(0)).toContainText(/Ropa.*20,00\s€/);
  await expect(categories.nth(1)).toContainText(/Sin categoría.*-3,00\s€/);

  // Gráfica mensual: 6 meses, y el actual (última fila de la tabla accesible) vale 12,00 €.
  const rows = panel(page, "Beneficio neto por mes").locator("tbody tr");
  await expect(rows).toHaveCount(6);
  await expect(rows.last()).toContainText(/12,00\s€/);

  await page.getByRole("link", { name: "Últimos 12 meses" }).click();
  await expect(page).toHaveURL(/periodo=12/);
  await expect(panel(page, "Beneficio neto por mes").locator("tbody tr")).toHaveCount(12);
  await expect(stat(page, "Beneficio neto")).toContainText(/12,00\s€/);
});

test("panel: primeros pasos para cuentas nuevas; stock parado y últimas ventas después", async ({ page }) => {
  await signUpAndConfirm(page);
  await expect(page.getByRole("heading", { name: "Primeros pasos" })).toBeVisible();

  await createProduct(page, { title: "Abrigo antiguo", price: "20", purchaseDate: isoDaysAgo(45) });
  await createProduct(page, { title: "Camisa reciente", price: "5", purchaseDate: isoDaysAgo(2) });
  await createProduct(page, { title: "Bolso vendido", price: "8", purchaseDate: isoDaysAgo(60) });
  await sell(page, "En mano", "20");

  await page.goto("/panel");
  await expect(page.getByRole("heading", { name: "Primeros pasos" })).toHaveCount(0);

  const stale = panel(page, "Stock parado");
  await expect(stale).toContainText("1 producto lleva más de 30 días sin venderse");
  await expect(stale).toContainText(/20,00\s€ inmovilizados/);
  await expect(stale.getByRole("link", { name: /Abrigo antiguo/ })).toContainText("45 días");
  await expect(stale.getByText("Camisa reciente")).toHaveCount(0);
  await expect(stale.getByText("Bolso vendido")).toHaveCount(0);

  const recent = panel(page, "Últimas ventas");
  await expect(recent.getByRole("link", { name: /Bolso vendido/ })).toContainText(/\+12,00\s€/);
  await recent.getByRole("link", { name: "Ver todas" }).click();
  await expect(page).toHaveURL(/\/ventas$/);
});
