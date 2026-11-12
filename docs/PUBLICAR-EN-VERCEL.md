# Publicar Revanta en Vercel (preparado, sin ejecutar)

> **No se ha publicado nada.** Este documento deja listos los pasos para cuando el propietario lo autorice.

## Antes de empezar: dos avisos

- El plan gratuito de Vercel (**Hobby**) es solo para uso personal **no comercial**. Sirve para que el propietario pruebe la app desde su iPad. Antes de cobrar a clientes hay que pasar a Vercel Pro (~20 $/mes) o usar otro alojamiento.
- Con el email por defecto de Supabase solo reciben correos los miembros del proyecto de Supabase y con un límite muy bajo por hora. Para invitar a usuarios reales hace falta un proveedor de email propio (ver `CONFIGURAR-SUPABASE.md`).

## Paso 1 — Crear el proyecto en Vercel (propietario, ~5 min)

1. Entra en **vercel.com** → **Continue with GitHub**.
2. **Add New… → Project** → importa el repositorio `Revanta`.
3. En **Environment Variables** añade estas dos (son públicas):

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://moiohmhnvymuiucdxtpg.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la *Publishable key* (`sb_publishable_…`) |

4. Pulsa **Deploy**. Al terminar, Vercel muestra la dirección de la app, del tipo `https://revanta-xxxx.vercel.app`.

No añadas `ANTHROPIC_API_KEY` todavía: sin ella, la pantalla de IA aparece como «no disponible» y no puede generar gasto. No añadas nunca claves `sb_secret_…`.

## Paso 2 — Decirle a Supabase cuál es la dirección (propietario, ~2 min)

En Supabase → **Authentication → URL Configuration**:

1. **Site URL**: cambia `http://localhost:3000` por la dirección de Vercel.
2. **Redirect URLs**: añade `https://LA-DIRECCION-DE-VERCEL/**` (deja también la de localhost).

Sin este paso, los enlaces de los emails seguirían apuntando a `localhost`.

## Paso 3 — Probar desde el iPad

1. Abre la dirección de Vercel en Safari y pulsa **Crear cuenta** con el mismo email con el que entras en Supabase.
2. Abre el email de confirmación **en el mismo iPad y en Safari** y pulsa el enlace.
3. Debes entrar en el Panel. Cierra sesión e inicia sesión de nuevo.
4. Opcional: Compartir → **Añadir a pantalla de inicio** para usarla como app.

## Cómo sabe la app su propia dirección

No hay que configurar nada: en Vercel la app usa automáticamente la dirección de producción (o la del despliegue de prueba). Solo si más adelante se usa un dominio propio conviene añadir la variable `SITE_URL=https://tudominio.com`.

## Rama de publicación

El trabajo está en la rama `claude/revanta-saas-planning-cibbqs`. Antes de publicar conviene crear la rama `main` a partir de ella (mediante un *pull request*) y que Vercel publique desde `main`.
