# Crear el proyecto de Supabase (gratis)

Tiempo estimado: 10 minutos. Coste: **0 €** (plan Free, sin tarjeta).

## 1. Crear la cuenta y el proyecto

1. Entra en **supabase.com** y pulsa **Start your project**.
2. Regístrate con **Continue with GitHub** (usa tu cuenta de GitHub, así no necesitas otra contraseña).
3. Si te pide crear una organización: nombre `Revanta`, tipo **Personal**, plan **Free**.
4. Pulsa **New project** y rellena:
   - **Project name:** `revanta`
   - **Database password:** pulsa **Generate a password** y **guárdala en tu gestor de contraseñas** (Llaveros de iCloud vale). **No me la envíes.**
   - **Region:** `Central EU (Frankfurt)` — tus datos se quedan en la UE (RGPD).
5. Pulsa **Create new project** y espera 1–2 minutos.

## 2. Copiar los dos datos públicos que necesito

En el proyecto: **Project Settings** (rueda dentada) → **API Keys**.

- **Project URL** (algo como `https://abcdefgh.supabase.co`)
- **Publishable key** (empieza por `sb_publishable_…`)

Estos dos valores son **públicos por diseño** (los ve cualquier navegador que use la app), así que puedes pegármelos en el chat.

> ⚠️ **No** me envíes nunca la **secret key** (`sb_secret_…`), la contraseña de la base de datos ni ningún *access token*. Si algún día hace falta uno, te pediré que lo pegues en un formulario seguro, no en el chat.

## 3. Qué haré yo después

Con la URL y la clave pública:

- Prepararé la conexión de la app con tu proyecto.
- Te propondré la forma de aplicar la base de datos (tablas y políticas de seguridad) y la configuración de autenticación (plantillas de email en español, contraseña mínima de 8 caracteres, URLs permitidas).

## Nota sobre los emails

El plan gratuito de Supabase incluye un servicio de email **solo para pruebas** (muy pocos emails por hora). Para el MVP privado es suficiente. **Antes de abrir la app a clientes** habrá que conectar un proveedor de email (por ejemplo Resend, con plan gratuito). Te lo plantearé en la Fase 7 y no se contratará nada sin tu autorización.

---

# Estado y lista completa de lo que falta (actualizado el 11/11/2026)

**Estado: el proyecto de Supabase aún no está creado o no se han compartido sus datos.** Toda la app funciona y está probada contra una copia local de Supabase, así que el código ya está listo; solo falta el proyecto real.

| # | Paso | Quién | Estado |
|---|---|---|---|
| 1 | Crear cuenta y proyecto (secciones 1 y 2 de arriba) | Tú | ⏳ Pendiente |
| 2 | Pasar a Claude la *Project URL* y la *Publishable key* | Tú | ⏳ Pendiente |
| 3 | Crear las tablas y la seguridad (pegar 2 archivos SQL) | Tú, guiado | ⏳ Pendiente |
| 4 | Configurar la autenticación (URLs, contraseña, emails) | Tú, guiado | ⏳ Pendiente |
| 5 | Comprobar desde la app que todo funciona | Claude | ⏳ Pendiente |
| 6 | Email de producción (proveedor propio) | Fase 7 | Más adelante |

## Paso 3 — Crear las tablas y la seguridad

No hace falta compartir ninguna contraseña: se hace pegando el SQL en el panel de Supabase.

1. En tu proyecto de Supabase abre **SQL Editor → New query**.
2. Abre en GitHub el archivo `supabase/migrations/20261110000000_initial_schema.sql`, pulsa **Raw**, selecciona todo, cópialo, pégalo en el editor y pulsa **Run**. Debe decir *Success*.
3. Repite con `supabase/migrations/20261110120000_delete_own_account.sql`.
4. Comprueba en **Table Editor** que existen las tablas `profiles`, `products`, `expenses`, `sales` y `ai_generations`, todas con el candado «RLS enabled», y en **Storage** el bucket privado `product-photos`.

Ejecuta cada archivo **una sola vez** y en ese orden. Si alguno da error, no sigas: copia el mensaje y pásaselo a Claude.

## Paso 4 — Configurar la autenticación

En **Authentication**:

1. **URL Configuration**
   - *Site URL*: la dirección de la app publicada (se sabrá en la Fase 7; mientras tanto `http://localhost:3000`).
   - *Redirect URLs*: añade `http://localhost:3000/**` y, cuando exista, `https://TU-APP.vercel.app/**`.
2. **Sign In / Providers → Email**
   - *Confirm email*: activado.
   - *Minimum password length*: 8.
3. **Emails → Templates** (copia el contenido de los archivos de `supabase/templates/`):
   - *Confirm signup*: asunto «Confirma tu cuenta de Revanta», contenido de `confirmation.html`.
   - *Reset password*: asunto «Restablece tu contraseña de Revanta», contenido de `recovery.html`.

   Es importante usar estas plantillas: los enlaces por defecto de Supabase no funcionan con esta app.

## Paso 5 — Comprobación (Claude)

Con la URL y la clave pública, Claude:

1. Pedirá tu aprobación para permitir en su entorno el acceso a `TU-PROYECTO.supabase.co`.
2. Conectará la app a tu proyecto y probará el flujo completo: registro, email de confirmación, producto con foto, gasto, venta y borrado de cuenta.
3. Ejecutará la revisión de seguridad de Supabase (*Security Advisor*) contigo.

## Avisos

- **Email:** el servicio gratuito de Supabase envía muy pocos emails por hora y solo sirve para pruebas. Antes de abrir la app a clientes hay que conectar un proveedor (Fase 7).
- **Pausa por inactividad:** el plan Free pausa el proyecto tras 7 días sin uso; se reactiva con un clic y sin perder datos.
- **Copias de seguridad:** el plan Free no incluye copias automáticas descargables. Habrá que decidirlo antes de tener clientes.
