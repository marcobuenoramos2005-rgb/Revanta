import { expect, test, type Page } from "@playwright/test";

import { signOut, signUpAndConfirm } from "./support/auth";

async function createProduct(page: Page, title: string, price: string) {
  await page.goto("/inventario/nuevo");
  await expect(page.getByRole("heading", { level: 1, name: "Añadir producto" })).toBeVisible();
  await page.getByLabel("Título").fill(title);
  await page.getByLabel(/Precio de compra/).fill(price);
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
}

async function choose(page: Page, label: string | RegExp, option: string) {
  await page.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function addExpense(
  page: Page,
  expense: { amount: string; category: string; description?: string },
) {
  await expect(page.getByRole("heading", { level: 1, name: "Añadir gasto" })).toBeVisible();
  await page.getByLabel(/Importe/).fill(expense.amount);
  await choose(page, "Categoría", expense.category);
  if (expense.description) await page.getByLabel("Descripción").fill(expense.description);
  await page.getByRole("button", { name: "Guardar gasto" }).click();
}

const kpi = (page: Page, label: string) => page.locator("[data-slot=card]").filter({ hasText: label });

test("calcula el beneficio neto real: compra, gasto del producto, venta y gasto general", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, "Chaqueta vaquera", "10");
  const productUrl = page.url();

  // Gasto asociado al producto: 1,50 €
  await page.getByRole("link", { name: "Añadir gasto" }).click();
  await addExpense(page, { amount: "1,50", category: "Embalaje", description: "Caja y cinta" });
  await expect(page).toHaveURL(productUrl);
  await expect(page.getByRole("link", { name: /Caja y cinta/ })).toContainText(/1,50\s€/);

  // Venta: 30 − 2 (comisión) − 3 (envío) − 10 (compra) − 1,50 (gasto) = 13,50
  await page.getByRole("link", { name: "Registrar venta" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Registrar venta" })).toBeVisible();
  await choose(page, "¿Dónde lo has vendido?", "Vinted");
  await page.getByLabel(/^Precio de venta \(/).fill("30");
  await page.getByLabel(/Comisión de la plataforma/).fill("2");
  await page.getByLabel(/Envío pagado por ti/).fill("3");
  await expect(page.getByTestId("profit-preview")).toHaveText(/13,50\s€/);
  await page.getByRole("button", { name: "Registrar venta" }).click();

  // Ficha del producto
  await expect(page).toHaveURL(productUrl);
  await expect(page.getByTestId("net-profit")).toHaveText(/13,50\s€/);
  await expect(page.getByText("Vendido", { exact: true })).toBeVisible();
  await expect(page.getByText(/Vinted ·/)).toBeVisible();

  // Lista de ventas
  await page.goto("/ventas");
  const row = page.getByRole("link", { name: /Chaqueta vaquera/ });
  await expect(row).toContainText(/\+13,50\s€/);
  await expect(row).toContainText(/Venta 30,00\s€/);

  // Inventario: aparece en «Vendido» y ya no en los activos
  await page.goto("/inventario?estado=sold");
  await expect(page.getByRole("link", { name: /Chaqueta vaquera/ })).toBeVisible();

  // Panel
  await page.goto("/panel");
  await expect(kpi(page, "Beneficio neto del mes")).toContainText(/13,50\s€/);
  await expect(kpi(page, "Ventas del mes")).toContainText(/30,00\s€/);
  await expect(kpi(page, "Ventas del mes")).toContainText("1 venta");
  await expect(kpi(page, "Productos en stock")).toContainText("0");

  // Gasto general de 4,99 € → beneficio del mes 13,50 − 4,99 = 8,51
  await page.goto("/gastos/nuevo");
  await addExpense(page, { amount: "4.99", category: "Suscripciones", description: "Vinted Pro" });
  await expect(page).toHaveURL(/\/gastos$/);
  await expect(page.getByRole("status").filter({ hasText: "2 gastos" })).toBeVisible();
  await page.goto("/panel");
  await expect(kpi(page, "Beneficio neto del mes")).toContainText(/8,51\s€/);
});

test("edita y anula una venta; el producto vuelve a estar en stock", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, "Bolso de piel", "8");

  await page.getByRole("link", { name: "Registrar venta" }).click();
  await choose(page, "¿Dónde lo has vendido?", "Wallapop");
  await page.getByLabel(/^Precio de venta \(/).fill("25");
  await page.getByRole("button", { name: "Registrar venta" }).click();
  await expect(page.getByTestId("net-profit")).toHaveText(/17,00\s€/);

  // Editar: vendido más barato de lo que costó → pérdida en rojo
  await page.getByRole("link", { name: "Editar venta" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Editar venta" })).toBeVisible();
  await expect(page.getByLabel(/^Precio de venta \(/)).toHaveValue("25,00");
  await expect(page.getByRole("combobox", { name: "¿Dónde lo has vendido?" })).toContainText("Wallapop");
  await page.getByLabel(/^Precio de venta \(/).fill("5");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByTestId("net-profit")).toHaveText(/-3,00\s€/);

  // Anular
  await page.getByRole("button", { name: "Anular venta" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Anular venta" }).click();
  await expect(page.getByRole("link", { name: "Registrar venta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "En stock" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/ventas");
  await expect(page.getByRole("heading", { name: "Aún no hay ventas" })).toBeVisible();
});

test("valida la venta y conserva lo escrito", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, "Lámpara", "15");
  await page.getByRole("link", { name: "Registrar venta" }).click();
  await page.getByLabel(/^Precio de venta \(/).fill("abc");
  await page.getByLabel("Notas").fill("Comprador de Madrid");
  await page.getByRole("button", { name: "Registrar venta" }).click();
  await expect(page.getByText("Elige dónde lo has vendido.")).toBeVisible();
  await expect(page.getByText("Introduce un importe válido, por ejemplo 12,50.")).toBeVisible();
  await expect(page.getByLabel("Notas")).toHaveValue("Comprador de Madrid");
});

test("crea, edita y elimina un gasto", async ({ page }) => {
  await signUpAndConfirm(page);
  await page.goto("/gastos");
  await expect(page.getByRole("heading", { name: "Aún no hay gastos" })).toBeVisible();

  // Validación
  await page.goto("/gastos/nuevo");
  await page.getByLabel(/Importe/).fill("0");
  await page.getByRole("button", { name: "Guardar gasto" }).click();
  await expect(page.getByText("El importe debe ser mayor que 0.")).toBeVisible();
  await expect(page.getByText("Elige una categoría.")).toBeVisible();

  await addExpense(page, { amount: "12", category: "Transporte", description: "Gasolina mercadillo" });
  await expect(page).toHaveURL(/\/gastos$/);
  const row = page.getByRole("link", { name: /Gasolina mercadillo/ });
  await expect(row).toContainText(/12,00\s€/);
  await expect(row).toContainText("Transporte");

  // Editar
  await row.click();
  await expect(page.getByRole("heading", { level: 1, name: "Editar gasto" })).toBeVisible();
  await expect(page.getByLabel(/Importe/)).toHaveValue("12,00");
  await page.getByLabel(/Importe/).fill("14,30");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("link", { name: /Gasolina mercadillo/ })).toContainText(/14,30\s€/);

  // Eliminar
  await page.getByRole("link", { name: /Gasolina mercadillo/ }).click();
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar gasto" }).click();
  await expect(page.getByRole("heading", { name: "Aún no hay gastos" })).toBeVisible();
});

test("un usuario no puede ver ni modificar ventas y gastos de otro", async ({ page }) => {
  await signUpAndConfirm(page);
  await createProduct(page, "Producto de A", "10");
  const productUrl = page.url();
  await page.goto("/gastos/nuevo");
  await addExpense(page, { amount: "7", category: "Otros", description: "Gasto privado de A" });
  await page.getByRole("link", { name: /Gasto privado de A/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Editar gasto" })).toBeVisible();
  const expenseUrl = page.url();
  await signOut(page);

  await signUpAndConfirm(page);
  for (const url of [`${productUrl}/venta`, expenseUrl]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
  }
  // No puede preseleccionar un producto ajeno al crear un gasto.
  await page.goto(`/gastos/nuevo?producto=${productUrl.split("/").pop()}`);
  await expect(page.getByRole("heading", { level: 1, name: "Añadir gasto" })).toBeVisible();
  await expect(page.getByText("Producto de A")).toHaveCount(0);
  await page.goto("/gastos");
  await expect(page.getByRole("heading", { name: "Aún no hay gastos" })).toBeVisible();
});
