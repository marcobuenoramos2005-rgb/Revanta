import { expect, test } from "@playwright/test";

import {
  formError,
  getEmailLink,
  signIn,
  signOut,
  TEST_PASSWORD,
  toDefaultTemplateLink,
  uniqueEmail,
} from "./support/auth";

// Estos tests recorren el camino de las plantillas de email POR DEFECTO de Supabase
// (el enlace pasa por Supabase y vuelve a /auth/callback con un código).

async function signUp(page: import("@playwright/test").Page, email: string) {
  await page.goto("/registro");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu email" })).toBeVisible();
  return toDefaultTemplateLink(await getEmailLink(email, "Confirma tu cuenta"), "signup");
}

test("registro: el enlace por defecto confirma la cuenta, entra en el panel y después se puede iniciar sesión", async ({
  page,
}) => {
  const email = uniqueEmail("porDefecto");
  await page.goto(await signUp(page, email));
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.getByRole("heading", { level: 1, name: "Panel" })).toBeVisible();

  await signOut(page);
  await signIn(page, email, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/panel$/);
});

test("registro: si el enlace se abre en otro navegador, la cuenta queda confirmada y se puede iniciar sesión", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail("otroNavegador");
  const link = await signUp(page, email);

  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.goto(link);
  await expect(otherPage).toHaveURL(/\/login\?error=navegador$/);
  await expect(formError(otherPage, "ya está confirmada")).toBeVisible();

  await otherPage.getByLabel("Email").fill(email);
  await otherPage.getByLabel("Contraseña", { exact: true }).fill(TEST_PASSWORD);
  await otherPage.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(otherPage).toHaveURL(/\/panel$/);
  await other.close();
});

test("recuperación: el enlace por defecto abre /restablecer y la nueva contraseña funciona", async ({ page }) => {
  const email = uniqueEmail("recuperar");
  await page.goto(await signUp(page, email));
  await expect(page).toHaveURL(/\/panel$/);
  await signOut(page);

  await page.goto("/recuperar");
  await expect(page.getByRole("heading", { name: "¿Olvidaste tu contraseña?" })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await expect(page.getByRole("status")).toContainText("recibirás un enlace");

  await page.goto(toDefaultTemplateLink(await getEmailLink(email, "Restablece tu contraseña"), "recovery"));
  await expect(page).toHaveURL(/\/restablecer$/);
  const newPassword = "Nueva-clave-456";
  await page.getByLabel("Nueva contraseña").fill(newPassword);
  await page.getByLabel("Repite la contraseña").fill(newPassword);
  await page.getByRole("button", { name: "Guardar contraseña" }).click();
  await expect(page).toHaveURL(/\/panel$/);

  await signOut(page);
  await signIn(page, email, newPassword);
  await expect(page).toHaveURL(/\/panel$/);
});

test("un enlace por defecto ya usado o inválido muestra un error claro", async ({ page }) => {
  const email = uniqueEmail("usado");
  const link = await signUp(page, email);
  await page.goto(link);
  await expect(page).toHaveURL(/\/panel$/);
  await signOut(page);

  await page.goto(link); // segunda vez: Supabase lo rechaza
  await expect(page).toHaveURL(/\/login\?error=enlace/);
  await expect(formError(page, "El enlace no es válido o ha caducado")).toBeVisible();

  await page.goto("/auth/callback?code=codigo-falso&next=//evil.example.com");
  await expect(page).toHaveURL(/localhost:3000\/login\?error=navegador$/);
});
