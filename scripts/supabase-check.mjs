// Comprueba un proyecto de Supabase usando SOLO la clave pública (publishable).
// No modifica nada: actúa como visitante anónimo y confirma que no puede leer ni escribir.
// (Que el almacén de fotos es privado se comprueba en la prueba con sesión.)
//
// Uso:  npm run supabase:check            → proyecto de .env.real.local
//       npm run supabase:check -- --local → Supabase local (.env.local)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("✗ Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}
if (/^sb_secret_|service_role/.test(key)) {
  console.error("✗ Esa clave parece SECRETA. Usa la publishable (sb_publishable_…).");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const results = [];
const record = (ok, name, detail = "") => results.push({ ok, name, detail });

async function request(path, init = {}) {
  const response = await fetch(`${url}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  let body = null;
  try {
    body = await response.json();
  } catch {}
  if (response.status >= 500) {
    throw new Error(`el servicio respondió ${response.status} (¿está arrancando o pausado?)`);
  }
  return { status: response.status, body };
}

/** Un visitante anónimo no debe poder leer: o permiso denegado, o (como mínimo) cero filas. */
async function checkTable(name) {
  const { status, body } = await request(`/rest/v1/${name}?select=*&limit=1`);
  const code = body?.code;
  if (status === 404 || code === "PGRST205" || code === "42P01") {
    return record(false, `Tabla ${name}`, "no existe: ¿se ejecutó el archivo SQL 1?");
  }
  if (status === 401 || status === 403 || code === "42501") {
    return record(true, `Tabla ${name}`, "existe; visitantes anónimos sin permiso");
  }
  if (status === 200 && Array.isArray(body) && body.length === 0) {
    return record(true, `Tabla ${name}`, "existe; visitantes anónimos no ven filas");
  }
  record(false, `Tabla ${name}`, `respuesta inesperada (${status}${code ? ` ${code}` : ""})`);
}

async function checkAnonCannotWrite() {
  const { status, body } = await request("/rest/v1/products", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ title: "comprobación" }),
  });
  const denied = status === 401 || status === 403 || body?.code === "42501";
  record(denied, "Escritura anónima bloqueada", denied ? "" : `¡se aceptó una escritura anónima! (${status})`);
}

async function checkDeleteFunction() {
  const { status, body } = await request("/rest/v1/rpc/delete_own_account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const code = body?.code;
  if (status === 404 || code === "PGRST202") {
    return record(false, "Función delete_own_account", "no existe: falta ejecutar el archivo SQL 2");
  }
  const denied = status === 401 || status === 403 || code === "42501";
  record(denied, "Función delete_own_account", denied ? "existe; anónimos no pueden usarla" : `respuesta inesperada (${status})`);
}

async function checkAnonCannotListPhotos() {
  const { status, body } = await request("/storage/v1/object/list/product-photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1 }),
  });
  const empty = Array.isArray(body) && body.length === 0;
  const ok = status >= 400 || empty;
  record(ok, "Fotos no listables por anónimos", ok ? "" : "un visitante anónimo puede listar fotos");
}

async function checkAuthSettings() {
  const { status, body } = await request("/auth/v1/settings");
  if (status !== 200 || !body) return record(false, "Configuración de Auth", `no se pudo leer (${status})`);
  record(body.external?.email === true, "Registro con email activado");
  record(body.mailer_autoconfirm === false, "Confirmación de email obligatoria", body.mailer_autoconfirm ? "está DESACTIVADA: actívala (Confirm email)" : "");
  record(body.disable_signup === false, "Registro de nuevas cuentas abierto");
  const others = Object.entries(body.external ?? {}).filter(([name, on]) => on && name !== "email");
  record(others.length === 0, "Sin otros proveedores de acceso", others.map(([n]) => n).join(", "));
}

try {
  for (const table of ["profiles", "products", "expenses", "sales", "ai_generations", "product_profit"]) {
    await checkTable(table);
  }
  await checkAnonCannotWrite();
  await checkDeleteFunction();
  await checkAnonCannotListPhotos();
  await checkAuthSettings();
} catch (error) {
  console.error(`✗ No se pudo conectar con ${new URL(url).host}: ${error.cause?.code ?? error.message}`);
  process.exit(1);
}

console.log(`\nProyecto: ${new URL(url).host}\n`);
for (const { ok, name, detail } of results) {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n${failed} comprobación(es) con problemas.` : "\nTodo correcto.");
process.exit(failed ? 1 : 0);
