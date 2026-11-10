# Estado del proyecto y cómo continuar

> Este archivo se actualiza al terminar cada fase (y en cada parada intermedia).
> Sirve para retomar el trabajo exactamente donde se dejó, también en una sesión nueva.

**Última actualización:** 10/11/2026 — antes de empezar la Fase 5.

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

Pruebas en el último commit: 91 de navegador (iPhone, iPad, escritorio) y 37 de base de datos, todas en verde, también en GitHub Actions.

## Pendiente

| Fase | Contenido | Necesita del propietario |
|---|---|---|
| 5. Panel y estadísticas | Gráficas por mes/plataforma/categoría, margen medio, días hasta la venta, avisos de stock parado | Nada |
| 6. IA de anuncios | Título y descripción con la API de Claude, límite diario | Cuenta de Anthropic y autorizar ~5 € |
| 7. Pulido y despliegue | PWA, textos legales, email de producción, Vercel | Cuenta de Vercel y autorizar publicación |

**Acción pendiente del propietario:** crear el proyecto de Supabase y pasar la *Project URL* y la *Publishable key* (pasos en [`CONFIGURAR-SUPABASE.md`](CONFIGURAR-SUPABASE.md)). Después hay que aplicar las migraciones y la configuración de Auth al proyecto (requiere su aprobación).

## Gastos y cuentas

- Gasto total hasta ahora: **0 €**.
- Cuentas externas creadas: ninguna (solo GitHub, que ya existía).

## Problemas conocidos y limitaciones

- Listas (inventario, ventas, gastos) limitadas a los 200 registros más recientes, sin paginación; los totales de Ventas y Gastos suman solo lo mostrado.
- Si falla el guardado de un producto tras subir fotos, pueden quedar fotos huérfanas en el almacenamiento (limpieza prevista en la Fase 7).
- Una venta por producto (sin lotes ni cantidades).
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
   El entorno de Claude «Revanta» ya permite `ui.shadcn.com` y `pkg-containers.githubusercontent.com`.
3. Comprueba que todo sigue en verde antes de tocar nada:
   `npm run lint && npm run typecheck && npm run build && npm run test:e2e && npm run db:test`
4. Continúa por la primera fase pendiente de la tabla de arriba. Si hay una sección «Trabajo en curso» más abajo, empieza por ahí.
5. No gastes dinero, no publiques y no conectes servicios externos sin aprobación del propietario.
