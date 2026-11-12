<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reglas del proyecto Revanta

- Interfaz y textos para el usuario en **español**. Código, nombres de tablas y columnas en inglés.
- Diseño **mobile-first** (iPhone e iPad). Objetivos táctiles de al menos 40–44 px.
- Los componentes de shadcn usan **Base UI**: se usa `render` en lugar de `asChild`. Para enlaces con aspecto de botón, aplica `buttonVariants()` a `<Link>`.
- Todo acceso a datos pasa por Supabase con la clave pública y la sesión del usuario: **la seguridad la garantiza RLS**. No uses la clave `service_role` en la app.
- Cualquier cambio en la base de datos va en una migración nueva en `supabase/migrations/`, con RLS y pruebas en `supabase/tests/database/`. Después ejecuta `npm run db:types`.
- Cache Components está activado: las lecturas de sesión/cookies deben ir dentro de `<Suspense>`; no uses `new Date()` en componentes prerenderizados sin `"use cache"`.
- En rutas dinámicas (`[id]`), los componentes que usan `usePathname`/`useSearchParams` o leen `params` deben ir dentro de `<Suspense>`. Las páginas con carga progresiva responden 200 aunque llamen a `notFound()`.
- Next.js conserva el estado de las páginas visitadas (Activity): envuelve cada formulario en `<ResetOnNavigate>` y envíalo con `onSubmit` + `startTransition` para no perder lo escrito tras un error. En las pruebas, usa selectores exactos o `.filter({ visible: true })`: las páginas ocultas siguen en el DOM.
- Beneficio neto de un producto = venta − comisión − envío − compra − gastos asociados. Beneficio del mes = beneficio de las ventas del mes − gastos generales (sin producto) del mes. Suma siempre en céntimos (`sumMoney`).
- Las fotos se comprimen en el navegador y se suben directamente a Storage (`<usuario>/<producto>/<foto>.jpg`); el servidor valida las rutas. Se muestran con URLs firmadas.
- IA de anuncios (`src/lib/ai/`): solo servidor (`service.ts` es `server-only`), modelo `claude-haiku-5-5`, clave en `ANTHROPIC_API_KEY` (nunca `NEXT_PUBLIC_`, nunca en registros). Las pruebas no llaman jamás a la API real: cliente falso en las unitarias y `AI_MOCK=1` sin clave en las de navegador. Cada generación se registra en `ai_generations` (límite por usuario cada 24 h).
- No inventes datos en la interfaz: si una función no existe aún, muéstralo con `ComingSoonBadge`.
- Antes de subir cambios: `npm run lint && npm run typecheck && npm run test:unit && npm run build && npm run test:e2e && npm run db:test`.
- Sin conexión de red a Docker Hub en el entorno de Claude: usa `SUPABASE_INTERNAL_IMAGE_REGISTRY=ghcr.io` con los comandos de Supabase.
