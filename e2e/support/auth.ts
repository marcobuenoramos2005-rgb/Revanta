import { expect, type Page } from "@playwright/test";

/**
 * Utilidades de prueba. Leen los emails que envía Supabase en local a través
 * de Mailpit (http://127.0.0.1:54324), igual que haría un usuario real.
 */
const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

export const TEST_PASSWORD = "Clave-de-prueba-123";

export function uniqueEmail(prefix = "test") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/** Espera al último email para `to` cuyo asunto contiene `subject` y devuelve el enlace de acción. */
export async function getEmailLink(to: string, subject: string): Promise<string> {
  const query = encodeURIComponent(`to:"${to}" subject:"${subject}"`);
  let link: string | undefined;

  await expect
    .poll(
      async () => {
        const search = await fetch(`${MAILPIT_URL}/api/v1/search?query=${query}&limit=1`);
        const { messages } = (await search.json()) as { messages: { ID: string }[] };
        if (!messages?.length) return undefined;
        const message = await fetch(`${MAILPIT_URL}/api/v1/message/${messages[0].ID}`);
        const { HTML } = (await message.json()) as { HTML: string };
        link = HTML.match(/href="([^"]*\/auth\/confirm[^"]*)"/)?.[1]?.replaceAll("&amp;", "&");
        return link;
      },
      { message: `email "${subject}" para ${to}`, timeout: 20_000 },
    )
    .toBeTruthy();

  return link!;
}

/** Crea una cuenta por la interfaz y la confirma con el enlace del email. Termina en /panel. */
export async function signUpAndConfirm(page: Page, email = uniqueEmail(), password = TEST_PASSWORD) {
  await page.goto("/registro");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu email" })).toBeVisible();

  const link = await getEmailLink(email, "Confirma tu cuenta");
  await page.goto(link);
  await expect(page).toHaveURL(/\/panel$/);
  return { email, password };
}

export async function signIn(
  page: Page,
  email: string,
  password: string,
  { navigate = true }: { navigate?: boolean } = {},
) {
  if (navigate) await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Bienvenido de nuevo" })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Menú de la cuenta" }).filter({ visible: true }).click();
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

/** Mensaje de error del formulario (ignora el anunciador de rutas de Next.js, que también es role=alert). */
export function formError(page: Page, text: string | RegExp) {
  return page.getByRole("alert").filter({ hasText: text });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";

/**
 * Convierte el enlace de nuestra plantilla (token_hash → /auth/confirm) en el enlace
 * que generan las plantillas POR DEFECTO de Supabase ({{ .ConfirmationURL }}):
 * primero pasa por Supabase y este redirige a /auth/callback con un código.
 */
export function toDefaultTemplateLink(link: string, type: "signup" | "recovery") {
  const tokenHash = new URL(link).searchParams.get("token_hash");
  if (!tokenHash) throw new Error("El enlace no contiene token_hash");
  const next = type === "signup" ? "/panel" : "/restablecer";
  const redirectTo = `http://localhost:3000/auth/callback?next=${encodeURIComponent(next)}`;
  return `${SUPABASE_URL}/auth/v1/verify?token=${tokenHash}&type=${type}&redirect_to=${encodeURIComponent(redirectTo)}`;
}
