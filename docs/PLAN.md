# REVANTA — Plan de producto y arquitectura (MVP)

> Estado: **plan aprobado (10/11/2026). Fase 1 completada.** No se ha creado ninguna cuenta externa ni se ha realizado ningún gasto.
> Fecha: 10/11/2026

## 1. Inspección del entorno

| Elemento | Resultado |
|---|---|
| Entorno de trabajo | Contenedor Linux en la nube (Claude Code). Se borra al terminar la sesión: todo se guarda en GitHub. |
| Repositorios | `Revanta` y `Revanta-` en GitHub. **Ambos vacíos** (sin commits). No existe proyecto previo. |
| Node.js / npm / pnpm | 22.23 / 10.9 / 10.28 ✅ |
| Git + GitHub | ✅ Puedo hacer commits y push a la rama de trabajo. |
| Docker | ✅ Funciona → previsiblemente puedo ejecutar Supabase en local para probar sin crear cuentas (a confirmar en Fase 1). |
| Navegador (Playwright + Chromium) | ✅ Puedo hacer pruebas automáticas y capturas de pantalla en tamaño iPhone/iPad. |
| Supabase CLI / Vercel CLI | No instalados; se usan con `npx` cuando haga falta. |

## 2. Tecnología elegida (versiones comprobadas en npm hoy)

| Capa | Elección | Versión | Motivo |
|---|---|---|---|
| Framework | **Next.js** (App Router) | 16.4.x | Estándar de facto para SaaS con React; despliegue trivial. |
| Lenguaje | **TypeScript** | la que instale `create-next-app` (TS 7.0 es la última; verificaré compatibilidad) | Menos errores, código mantenible. |
| UI | **Tailwind CSS 4** + **shadcn/ui** | 4.3.x / CLI 4.x | Aspecto de SaaS profesional, componentes accesibles, fácil en móvil. |
| Base de datos + login | **Supabase** (Postgres + Auth + Storage) | supabase-js 2.119, @supabase/ssr 0.12 | Plan gratuito, RLS nativo para aislar datos por usuario. |
| Validación | Zod | — | Validar todos los formularios en servidor. |
| Gráficas | Recharts | — | Estadísticas del panel. |
| IA | **API de Claude (Anthropic)** vía SDK oficial `@anthropic-ai/sdk` | 1.x | Solo desde el servidor; la clave nunca llega al navegador. |
| Hosting | **Vercel** | — | El más sencillo para Next.js, despliegue automático desde GitHub, URL de prueba por cada cambio (ideal para supervisar desde el iPad). |
| App en iPhone/iPad | **PWA** (“Añadir a pantalla de inicio”) | — | Experiencia tipo app sin App Store ni coste. |

### ⚠️ Advertencia importante sobre Vercel
El plan gratuito (**Hobby**) de Vercel es **solo para uso personal no comercial**. Sirve para desarrollar y probar el MVP, pero **antes de cobrar a clientes** hay que:
- pasar a **Vercel Pro (~20 $/mes)**, o
- migrar a un hosting gratuito que permita uso comercial (p. ej. Cloudflare Workers con OpenNext; más complejo).

Decidiremos esto al llegar a la fase de lanzamiento. No se contratará nada sin tu autorización.

## 3. Arquitectura mínima viable

```
iPhone / iPad (navegador o PWA)
        │ HTTPS
        ▼
Next.js en Vercel
  ├─ Páginas (Server Components) ── leen datos con la sesión del usuario
  ├─ Server Actions ─────────────── crean/editan productos, gastos, ventas
  └─ /api/ai/listing ───────────── llama a Claude (clave secreta solo en servidor)
        │                                   │
        ▼                                   ▼
Supabase (Postgres + RLS + Auth + Storage)   API de Anthropic
```

**Principio de seguridad:** la app usa siempre la clave *pública* (anon) de Supabase + la sesión del usuario. Las políticas **RLS** de Postgres garantizan que cada usuario solo ve y modifica sus filas, aunque haya un fallo en el código. La clave `service_role` no se usa en la app.

### Modelo de datos

| Tabla | Campos principales |
|---|---|
| `profiles` | id (= usuario), nombre del negocio, moneda (EUR) |
| `products` | user_id, título, marca, categoría, talla, estado (nuevo/como nuevo/bueno/usado), **situación** (en stock / publicado / reservado / vendido / archivado), precio de compra, fecha y origen de compra, notas, fotos |
| `expenses` | user_id, product_id (opcional), categoría (envío, embalaje, transporte, comisiones, suscripciones, otros), importe, fecha |
| `sales` | user_id, product_id, plataforma (Vinted, Wallapop, eBay, otra), precio de venta, comisión de la plataforma, coste de envío pagado por ti, fecha |
| `ai_generations` | user_id, product_id, resultado, tokens usados (para controlar el gasto y limitar uso diario) |

**Beneficio neto por producto** = precio de venta − comisión − envío − precio de compra − gastos asociados al producto.
**Beneficio neto del negocio** = suma de beneficios por producto − gastos generales.
Se calcula en vistas SQL con `security_invoker` (respetan RLS). Importes guardados como `numeric(12,2)`, nunca como decimales flotantes.

**RLS en todas las tablas:** `select/insert/update/delete` solo si `user_id = auth.uid()`. Fotos en un bucket **privado** con una carpeta por usuario. Incluiré **pruebas automáticas** que comprueban que el usuario A no puede leer ni modificar datos del usuario B.

### Pantallas del MVP
1. Registro / inicio de sesión (email + contraseña, recuperación de contraseña).
2. **Panel**: beneficio del mes, ventas, stock inmovilizado (€), productos sin vender > 30 días, últimas ventas.
3. **Inventario**: lista con búsqueda y filtros, ficha de producto, alta rápida desde el móvil (con foto).
4. **Gastos**: alta rápida y listado.
5. **Ventas**: registrar venta desde la ficha del producto (marca el producto como vendido).
6. **Estadísticas**: beneficio por mes, por plataforma y por categoría; margen medio; días medios hasta la venta.
7. **Generador de anuncios IA**: desde la ficha del producto genera título + descripción para copiar y pegar (sin publicación automática en plataformas).
8. Ajustes: perfil, moneda, cerrar sesión, borrar cuenta.

Diseño mobile-first: navegación inferior en iPhone, barra lateral en iPad/escritorio, modo claro/oscuro, botones grandes, formularios cortos.

## 4. Costes previstos

| Concepto | Desarrollo / MVP | Notas |
|---|---|---|
| GitHub | 0 € | Ya disponible. |
| Supabase Free | 0 € | 2 proyectos, 500 MB de base de datos, 1 GB de archivos, 50.000 usuarios/mes. **Se pausa tras 7 días sin actividad** (se reactiva con un clic, sin perder datos). Pro: 25 $/mes cuando haya clientes. |
| Vercel Hobby | 0 € | Solo no comercial (ver advertencia). Pro: ~20 $/mes al comercializar. |
| API de Claude | **~5 € de crédito prepago** (único gasto real del MVP) | Coste por anuncio generado (estimación, ~600 tokens de entrada + ~1.500 de salida incluyendo razonamiento): **Haiku 5.5 ≈ 0,001 $**, Sonnet 5.5 ≈ 0,016 $, Opus 5.5 ≈ 0,03 $. Con 5 € se generan miles de anuncios con Haiku. Se fijará un límite diario por usuario y un límite de gasto en la consola de Anthropic. |
| Dominio propio (opcional) | ~10–15 €/año | No necesario para el MVP (se usa `*.vercel.app`). |
| **Total MVP** | **≈ 5–20 €** | Muy por debajo del presupuesto de 100 €. |

Precios verificados el 10/11/2026 en fuentes públicas; pueden cambiar. Se volverán a comprobar antes de cualquier pago.

## 5. Cuentas y credenciales necesarias

| Cuenta | Cuándo | Qué necesito de ti | Coste |
|---|---|---|---|
| GitHub | Ya está | Nada | 0 € |
| Supabase | Fase 1 (final) | Crear cuenta y un proyecto (región UE, p. ej. Frankfurt). Darme la **URL del proyecto** y la **clave anon/publishable** (públicas por diseño). | 0 € |
| Vercel | Fase 7 (o antes, para previsualizar) | Crear cuenta con GitHub, importar el repo y pegar variables de entorno. | 0 € |
| Anthropic (Claude API) | Fase 6 | Crear cuenta en la consola, **autorizar la recarga de ~5 €**, crear una API key y pegarla **directamente en Vercel** (nunca en el chat ni en el código). Configurar límite de gasto. | ~5 € |

Las claves secretas **nunca** se escriben en el código ni en el repositorio. `.env.local` estará en `.gitignore`.

## 6. Plan de construcción por fases

Cada fase termina con: código en GitHub, pruebas ejecutadas por mí, capturas de pantalla en iPhone/iPad y un resumen corto para que lo revises.

| Fase | Contenido | Requiere de ti |
|---|---|---|
| **0. Aprobación** | Este documento. | Aprobar plan y responder preguntas abiertas. |
| **1. Fundaciones** ✅ | Proyecto Next.js + TS + Tailwind + shadcn, sistema de diseño (colores, tipografía, logo provisional), layout responsive, Supabase local, migraciones SQL con RLS, pruebas de aislamiento entre usuarios, CI básica en GitHub Actions (lint + tests). | Nada (todo local). |
| **2. Autenticación** | Registro, login, recuperación de contraseña, protección de rutas, perfil. | Crear proyecto Supabase al final de la fase. |
| **3. Inventario** | CRUD de productos, fotos, búsqueda, filtros, estados. | Revisar capturas. |
| **4. Gastos y ventas** | Registro de gastos y ventas, cálculo de beneficio neto por producto. | Revisar con 2–3 ejemplos reales tuyos. |
| **5. Panel y estadísticas** | KPIs, gráficas, alertas de stock parado. | Revisar. |
| **6. IA de anuncios** | Generador de título/descripción, límite diario, registro de consumo. | Cuenta Anthropic + autorizar ~5 €. |
| **7. Pulido y despliegue** | PWA, estados vacíos, errores, accesibilidad, rendimiento, textos legales básicos (privacidad/RGPD), despliegue en Vercel. | Cuenta Vercel + autorizar publicación. |
| **Post-MVP** (no ahora) | Suscripciones con Stripe, exportar CSV, multiusuario/equipo, importación masiva, dominio propio. | — |

## 7. Preguntas abiertas
1. ¿Qué repositorio usamos como principal: `Revanta` o `Revanta-`? (Propongo `Revanta` y dejar el otro sin usar o borrarlo tú.)
2. ¿Qué modelo de IA para los anuncios? Propongo empezar con **Haiku 5.5** (el más barato) y comparar calidad con Sonnet 5.5 con ejemplos reales antes de decidir.
3. ¿Idioma de la interfaz: solo español al principio? (Propuesta: sí, preparado para añadir inglés después.)
4. ¿Alguna preferencia de color o estilo de marca? Si no, propondré una identidad visual en la Fase 1.
