import { expect, test } from "@playwright/test";

import {
  formError,
  getEmailLink,
  signIn,
  signOut,
  signUpAndConfirm,
  TEST_PASSWORD,
  uniqueEmail,
} from "./support/auth";

test.describe("Acceso a la aplicación", () => {
  test("sin sesión, las páginas privadas redirigen al login y luego vuelven a la página pedida", async ({ page }) => {
    const { email, password } = await signUpAndConfirm(page);
    await signOut(page);

    await page.goto("/gastos");
    await expect(page).toHaveURL(/\/login\?next=%2Fgastos$/);

    await signIn(page, email, password, { navigate: false });
    await expect(page).toHaveURL(/\/gastos$/);
    await expect(page.getByRole("heading", { level: 1, name: "Gastos" })).toBeVisible();
  });

  test("con sesión, el login redirige al panel", async ({ page }) => {
    await signUpAndConfirm(page);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/panel$/);
  });

  test("no permite redirecciones a otros dominios", async ({ page }) => {
    const { email, password } = await signUpAndConfirm(page);
    await signOut(page);
    await page.goto("/login?next=//evil.example.com");
    await signIn(page, email, password, { navigate: false });
    await expect(page).toHaveURL(/localhost:3000\/panel$/);
  });
});

test.describe("Registro", () => {
  test("crea la cuenta, pide confirmar el email y entra en el panel", async ({ page }) => {
    await signUpAndConfirm(page);
    await expect(page.getByRole("heading", { level: 1, name: "Panel" })).toBeVisible();
  });

  test("valida el email y la longitud de la contraseña", async ({ page }) => {
    await page.goto("/registro");
    await page.getByLabel("Email").fill("no-es-un-email");
    await page.getByLabel("Contraseña", { exact: true }).fill("corta");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByText("Introduce un email válido.")).toBeVisible();
    await expect(page.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("no-es-un-email");
  });

  test("sin confirmar el email no se puede entrar", async ({ page }) => {
    const email = uniqueEmail("sinconfirmar");
    await page.goto("/registro");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByRole("heading", { name: "Revisa tu email" })).toBeVisible();

    await signIn(page, email, TEST_PASSWORD);
    await expect(formError(page, "Todavía no has confirmado tu email")).toBeVisible();
  });

  test("un enlace inválido muestra un error claro", async ({ page }) => {
    await page.goto("/auth/confirm?token_hash=falso&type=email&next=/panel");
    await expect(page).toHaveURL(/\/login\?error=enlace$/);
    await expect(formError(page, "El enlace no es válido o ha caducado")).toBeVisible();
  });
});

test.describe("Inicio de sesión", () => {
  test("muestra un error con una contraseña incorrecta", async ({ page }) => {
    const { email } = await signUpAndConfirm(page);
    await signOut(page);
    await signIn(page, email, "contraseña-incorrecta");
    await expect(formError(page, "El email o la contraseña no son correctos.")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue(email);
  });

  test("cerrar sesión impide volver a entrar en la app", async ({ page }) => {
    await signUpAndConfirm(page);
    await signOut(page);
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Recuperar contraseña", () => {
  test("envía el enlace, permite elegir una nueva contraseña y entrar con ella", async ({ page }) => {
    const { email } = await signUpAndConfirm(page);
    await signOut(page);

    await page.getByRole("link", { name: "¿Olvidaste tu contraseña?" }).click();
    await expect(page.getByRole("heading", { name: "¿Olvidaste tu contraseña?" })).toBeVisible();
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Enviar enlace" }).click();
    await expect(page.getByRole("status")).toContainText("recibirás un enlace");

    await page.goto(await getEmailLink(email, "Restablece tu contraseña"));
    await expect(page).toHaveURL(/\/restablecer$/);

    const newPassword = "Nueva-clave-456";
    await page.getByLabel("Nueva contraseña").fill(newPassword);
    await page.getByLabel("Repite la contraseña").fill("otra-cosa-789");
    await page.getByRole("button", { name: "Guardar contraseña" }).click();
    await expect(page.getByText("Las contraseñas no coinciden.")).toBeVisible();

    await page.getByLabel("Nueva contraseña").fill(newPassword);
    await page.getByLabel("Repite la contraseña").fill(newPassword);
    await page.getByRole("button", { name: "Guardar contraseña" }).click();
    await expect(page).toHaveURL(/\/panel$/);

    await signOut(page);
    await signIn(page, email, TEST_PASSWORD);
    await expect(formError(page, "no son correctos")).toBeVisible();
    await signIn(page, email, newPassword);
    await expect(page).toHaveURL(/\/panel$/);
  });

  test("no revela si un email está registrado", async ({ page }) => {
    await page.goto("/recuperar");
    await page.getByLabel("Email").fill(uniqueEmail("noexiste"));
    await page.getByRole("button", { name: "Enviar enlace" }).click();
    await expect(page.getByRole("status")).toContainText("Si existe una cuenta con ese email");
  });

  test("/restablecer sin enlace válido redirige al login", async ({ page }) => {
    await page.goto("/restablecer");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("Ajustes", () => {
  test("guarda el nombre del negocio y la moneda", async ({ page }) => {
    await signUpAndConfirm(page);
    await page.goto("/ajustes");

    await page.getByLabel("Nombre del negocio").fill("Vintage de Prueba");
    await page.getByRole("combobox", { name: "Moneda" }).click();
    await page.getByRole("option", { name: "Libra esterlina (£)" }).click();
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("status")).toContainText("Cambios guardados.");

    await page.reload();
    await expect(page.getByLabel("Nombre del negocio")).toHaveValue("Vintage de Prueba");
    await expect(page.getByRole("combobox", { name: "Moneda" })).toContainText("Libra esterlina");

    await page.goto("/panel");
    await expect(page.getByText("Hola, Vintage de Prueba.")).toBeVisible();
  });

  test("cambia la contraseña desde los ajustes", async ({ page }) => {
    const { email } = await signUpAndConfirm(page);
    await page.goto("/ajustes");
    await page.getByLabel("Nueva contraseña").fill("Otra-clave-789");
    await page.getByLabel("Repite la contraseña").fill("Otra-clave-789");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByRole("status")).toContainText("Contraseña actualizada.");

    await signOut(page);
    await signIn(page, email, "Otra-clave-789");
    await expect(page).toHaveURL(/\/panel$/);
  });

  test("elimina la cuenta tras confirmar y ya no se puede entrar", async ({ page }) => {
    const { email, password } = await signUpAndConfirm(page);
    await page.goto("/ajustes");
    await page.getByRole("button", { name: "Eliminar cuenta" }).click();

    const dialog = page.getByRole("dialog");
    const confirm = dialog.getByRole("button", { name: "Eliminar definitivamente" });
    await expect(confirm).toBeDisabled();
    await dialog.getByLabel(/Escribe ELIMINAR/).fill("ELIMINAR");
    await confirm.click();

    await expect(page).toHaveURL("http://localhost:3000/");
    await signIn(page, email, password);
    await expect(formError(page, "El email o la contraseña no son correctos.")).toBeVisible();
  });
});
