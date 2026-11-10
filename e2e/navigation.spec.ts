import { expect, test } from "@playwright/test";

const sections = [
  { label: "Inventario", heading: "Inventario" },
  { label: "Ventas", heading: "Ventas" },
  { label: "Gastos", heading: "Gastos" },
  { label: "Panel", heading: "Panel" },
];

test("la página de inicio carga y lleva al panel", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Revanta/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("bajo control");
  await page.getByRole("link", { name: /Empezar ahora/ }).click();
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.getByRole("heading", { level: 1, name: "Panel" })).toBeVisible();
});

test("la navegación principal funciona en todos los tamaños", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/panel");
  const nav = page.getByRole("navigation", { name: "Principal" }).filter({ visible: true });

  for (const { label, heading } of sections) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
  }

  expect(errors).toEqual([]);
});

test("en iPhone, el menú «Más» da acceso a Estadísticas y Ajustes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone", "Solo aplica a la barra inferior del iPhone");

  await page.goto("/panel");
  await page.getByRole("button", { name: "Más" }).click();
  await page.getByRole("link", { name: "Estadísticas" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Estadísticas" })).toBeVisible();

  await page.getByRole("button", { name: "Más" }).click();
  await page.getByRole("link", { name: "Ajustes" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Ajustes" })).toBeVisible();
});

test("las rutas inexistentes muestran una página 404 en español", async ({ page }) => {
  const response = await page.goto("/no-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
});
