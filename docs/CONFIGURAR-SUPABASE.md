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
