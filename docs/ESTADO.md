# Estado del proyecto y cómo continuar

> Este archivo se actualiza al terminar cada fase (y en cada parada intermedia).
> Sirve para retomar el trabajo exactamente donde se dejó, también en una sesión nueva.

**Última actualización:** 11/11/2026 — Conectando el proyecto real de Supabase; iniciada la Fase 7 (preparación para producción).

## Dónde está el código

- Repositorio: `marcobuenoramos2005-rgb/Revanta`
- Rama de trabajo: `claude/revanta-saas-planning-cibbqs` (todo está subido; no hay `main` todavía)
- Plan completo: [`PLAN.md`](PLAN.md) · Reglas técnicas: [`../AGENTS.md`](../AGENTS.md)

## Terminado y probado

| Fase | Contenido | Estado |
|---|---|---|
| 1. Fundaciones | App, diseño, base de datos con RLS, CI | ✅ |
| 2. Autenticación | Registro, login, recuperar contraseña, ajustes, borrar cuenta | ✅ |
| 3. Inventario | Productos con fotos, búsqueda, filtros, situación | ✅ |
| 4. Gastos y ventas | Ventas, gastos, beneficio neto por producto y por mes | ✅ |
| 5. Panel y estadísticas | Beneficio por mes, plataforma y categoría; margen; días hasta la venta; stock parado; últimas ventas | ✅ |
| 6. IA de anuncios | Integración con Claude Haiku 5.5 solo en servidor, límite diario, registro de consumo y coste, modo simulado | ✅ construida · ⏳ sin probar con la IA real |

Pruebas en el último commit: 27 unitarias (IA con cliente simulado), 112 de navegador (iPhone, iPad, escritorio) y 37 de base de datos, todas en verde, también en GitHub Actions.

## Supabase real (en curso)

- Proyecto: `https://moiohmhnvymuiucdxtpg.supabase.co` (acceso de red ya permitido en el entorno de Claude «Revanta»).
- ✅ Archivo SQL 1 (`20261110000000_initial_schema.sql`) ejecutado por el propietario en el SQL Editor. **Nota:** se ejecutó antes o después del commit `454d449` (permisos explícitos); `npm run supabase:check` lo aclara.
- ✅ Archivo SQL 2 ejecutado por el propietario (Success).
- ✅ URL y *Publishable key* guardadas en `.env.real.local` (no se sube a git; si falta, pedírselas de nuevo: son públicas).
- ✅ `npm run supabase:check` contra el proyecto real: 13 de 13 correctas (tablas, función, anónimos sin acceso, confirmación de email activada).
- ⏳ Pendiente de confirmar qué versión del archivo 1 se ejecutó (permisos explícitos o no): consulta de solo lectura entregada al propietario.
- ⏳ Después: configurar Auth (paso 4 de `CONFIGURAR-SUPABASE.md`) y prueba completa con sesión (incluye confirmar que el almacén de fotos es privado).
- El propietario eligió la opción A: ejecuta él el SQL; **no** quiere tokens de acceso ni claves secretas.

## Fase 7 (en curso)

- ✅ Cabeceras de seguridad, sin `X-Powered-By`, pantallas de error (`error.tsx`), pruebas de seguridad.
- ⏳ Pendiente: textos legales (necesitan los datos del titular), paginación, limpieza de fotos huérfanas, email de producción, despliegue en Vercel.

## Ampliaciones pedidas por el propietario (11/11/2026)

- Suscripciones y planes de pago (Stripe): **pendiente de decisiones** (precios, límites del plan gratuito, forma jurídica para facturar). No construir sin su respuesta.
- «IA para analizar productos»: pendiente de definir el alcance con él.
- Objetivo comercial: primeros 20 usuarios en España.

## Pendiente

| Fase | Contenido | Necesita del propietario |
|---|---|---|
| 6b. Pruebas con IA real | Conectar la clave, generar 5–10 anuncios reales y ajustar el texto | Cuenta de Anthropic, crédito de 5 $ sin recarga automática y su visto bueno ([`CONFIGURAR-ANTHROPIC.md`](CONFIGURAR-ANTHROPIC.md)) |
| 7. Pulido y despliegue | PWA, textos legales, email de producción, Vercel | Cuenta de Vercel y autorizar publicación |

**Acción pendiente del propietario:** crear el proyecto de Supabase y pasar la *Project URL* y la *Publishable key* (pasos en [`CONFIGURAR-SUPABASE.md`](CONFIGURAR-SUPABASE.md)). Después hay que aplicar las migraciones y la configuración de Auth al proyecto (requiere su aprobación).

## Gastos y cuentas

- Gasto total hasta ahora: **0 €**.
- Presupuesto autorizado para pruebas de IA: **máximo 5 €, aún sin gastar, sin recarga automática**. No se ha hecho ninguna llamada real a la API.
- Cuentas externas creadas: ninguna (solo GitHub, que ya existía).

## Problemas conocidos y limitaciones

- Listas (inventario, ventas, gastos) limitadas a los 200 registros más recientes, sin paginación; los totales de Ventas y Gastos suman solo lo mostrado.
- Si falla el guardado de un producto tras subir fotos, pueden quedar fotos huérfanas en el almacenamiento (limpieza prevista en la Fase 7).
- Una venta por producto (sin lotes ni cantidades).
- IA: calidad real de los textos sin probar; el límite es por usuario (el tope global es el crédito prepago y el límite de gasto en la consola de Anthropic).
- Las estadísticas se calculan en la app con un máximo de 1.000 ventas por periodo (se muestra un aviso si se supera). Para más volumen habrá que agregar en la base de datos.
- «Tiempo medio hasta vender» solo cuenta productos con fecha de compra. El «stock parado» usa la fecha de compra o, si falta, la de alta.
- Probado en Chromium con tamaños de iPhone/iPad, no en Safari real: cámara y fotos HEIC pendientes de probar en un dispositivo.
- El plan gratuito de Vercel no permite uso comercial y el email gratuito de Supabase es solo para pruebas (decisiones para la Fase 7).

## Cómo continuar (para Claude en una sesión nueva)

1. Trabaja en la rama `claude/revanta-saas-planning-cibbqs` y lee `AGENTS.md` y este archivo.
2. Prepara el entorno:
   ```bash
   npm ci
   (dockerd > /tmp/dockerd.log 2>&1 &)        # si Docker no está arrancado
   SUPABASE_INTERNAL_IMAGE_REGISTRY=ghcr.io npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,supavisor,realtime
   # .env.local (no se sube a git): URL http://127.0.0.1:54321 y la PUBLISHABLE_KEY que muestra `npx supabase status`
   ```
   Si Docker se detiene a mitad de sesión, arráncalo con `setsid nohup dockerd > /tmp/dockerd.log 2>&1 < /dev/null &`.
   El entorno de Claude «Revanta» ya permite `ui.shadcn.com` y `pkg-containers.githubusercontent.com`.
3. Comprueba que todo sigue en verde antes de tocar nada:
   `npm run lint && npm run typecheck && npm run test:unit && npm run build && npm run test:e2e && npm run db:test`
4. Continúa por la primera fase pendiente de la tabla de arriba. Si hay una sección «Trabajo en curso» más abajo, empieza por ahí.
5. No gastes dinero, no publiques y no conectes servicios externos sin aprobación del propietario.
