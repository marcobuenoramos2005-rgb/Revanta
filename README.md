# Revanta

SaaS para pequeños y medianos revendedores de segunda mano: inventario, compras y gastos,
ventas, beneficio neto, anuncios con IA y estadísticas, en un solo lugar.

> Estado: **Fases 1 (fundaciones), 2 (autenticación) y 3 (inventario) completadas**. Plan completo en [`docs/PLAN.md`](docs/PLAN.md).

## Tecnología

| Capa | Tecnología |
|---|---|
| Web | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Interfaz | Tailwind CSS 4, shadcn/ui (Base UI), lucide-react |
| Datos y login | Supabase (Postgres + RLS, Auth, Storage) |
| Pruebas | pgTAP (seguridad de la base de datos), Playwright (iPhone, iPad, escritorio) |
| CI | GitHub Actions |

## Estructura

```
src/
  app/
    page.tsx              Página de presentación
    (auth)/               Login, registro, recuperar y restablecer contraseña
    (app)/                Zona privada (panel, inventario, ventas, gastos, ajustes…)
    auth/confirm/         Destino de los enlaces de los emails
  components/
    ui/                   Componentes base (shadcn/ui)
    app-shell/            Navegación lateral (iPad/escritorio) e inferior (iPhone)
    brand/                Logo
  lib/
    auth/                 Sesión (DAL), validación y mensajes de error
    supabase/             Clientes de Supabase y tipos generados de la base de datos
  proxy.ts                Refresca la sesión y protege las rutas privadas
supabase/
  migrations/             Esquema de la base de datos y políticas RLS
  templates/              Emails de confirmación y recuperación (en español)
  tests/database/         Pruebas de aislamiento entre usuarios y borrado de cuenta
e2e/                      Pruebas de navegación en iPhone, iPad y escritorio
```

## Desarrollo local (requiere Node 22 y Docker)

```bash
npm install
cp .env.example .env.local   # y rellena la clave que muestra el paso siguiente
npm run db:start             # arranca Supabase en local
npm run dev                  # http://localhost:3000
```

Los emails que envía Supabase en local (confirmación, recuperación) se ven en
Mailpit: http://127.0.0.1:54324

| Comando | Qué hace |
|---|---|
| `npm run lint` | Revisa el estilo del código |
| `npm run typecheck` | Comprueba los tipos de TypeScript |
| `npm run build` | Compila la versión de producción |
| `npm run test:e2e` | Pruebas de navegación (iPhone, iPad, escritorio) |
| `npm run db:test` | Pruebas de seguridad RLS y de cálculo de beneficio |
| `npm run db:reset` | Recrea la base de datos local aplicando las migraciones |
| `npm run db:types` | Regenera los tipos TypeScript a partir de la base de datos |

## Seguridad

- **RLS activado en todas las tablas**: cada usuario solo puede leer y modificar sus filas.
- Las claves foráneas compuestas impiden enlazar gastos o ventas a productos de otro usuario.
- Las fotos se guardan en un bucket **privado**, con una carpeta por usuario.
- Los visitantes anónimos no tienen acceso a ningún dato.
- Las claves secretas nunca se suben al repositorio (`.env.local` está en `.gitignore`).
- Autenticación: confirmación por email obligatoria, contraseñas de 8+ caracteres, el proxy
  protege las rutas privadas y **cada página y acción vuelve a comprobar la sesión** en el
  servidor. Los mensajes de recuperación no revelan qué emails están registrados, y las
  redirecciones tras el login solo admiten rutas internas.
- Los usuarios pueden borrar su cuenta y todos sus datos (RGPD).
