# Conectar la IA de anuncios (Anthropic)

Estado actual: **todo construido y probado con respuestas simuladas. No hay clave, no se ha hecho ninguna llamada real y no se ha gastado nada.**

Presupuesto autorizado: **máximo 5 €**, sin recarga automática. No hagas estos pasos hasta que decidas empezar las pruebas reales.

## Qué cuesta

| Concepto | Valor |
|---|---|
| Modelo | Claude Haiku 5.5 (`claude-haiku-5-5`) |
| Precio | 0,10 $ por millón de tokens de entrada · 0,50 $ por millón de salida |
| Coste típico por anuncio | ≈ 0,0005 $ (medio céntimo de dólar cada 10 anuncios) |
| Coste máximo posible por anuncio | < 0,003 $ (tope de 4.096 tokens de salida) |
| Límite por usuario | 20 anuncios cada 24 horas (configurable con `AI_DAILY_LIMIT`) |
| Peor caso por usuario y día | < 0,06 $ |

Con 5 € hay margen para miles de anuncios. Precios comprobados el 11/11/2026 en la documentación oficial; pueden cambiar.

## Paso 1 — Crear la cuenta y el crédito (tú, ~10 min)

1. Entra en **console.anthropic.com** (también funciona platform.claude.com) y crea una cuenta.
2. Ve a **Settings → Billing** y compra **5 $ de crédito** (el mínimo). 
3. **Desactiva la recarga automática** («Auto reload» debe quedar apagado). Así, cuando se acabe el crédito, la IA simplemente deja de funcionar: no puede cobrarte más.
4. Ve a **Settings → Limits** y fija un **límite de gasto mensual de 5 $**.
5. Ve a **Settings → API Keys → Create Key**. Nombre: `revanta`. Copia la clave (empieza por `sk-ant-…`). Solo se muestra una vez: guárdala en tu Llavero de iCloud.

> ⚠️ **No pegues la clave en el chat, ni en GitHub, ni en ningún documento.** Si alguna vez se filtra, bórrala en la consola y crea otra.

## Paso 2 — Dársela a la aplicación

Hay dos sitios posibles, según el momento:

- **Para que Claude haga las primeras pruebas reales en este entorno:** Claude te mostrará un formulario seguro donde pegar la clave. Claude nunca ve su valor.
- **Para la app publicada (Fase 7):** en Vercel → tu proyecto → **Settings → Environment Variables**, añade `ANTHROPIC_API_KEY` con la clave, marcada como **Sensitive**, y vuelve a desplegar. No añadas `AI_MOCK` en producción.

## Paso 3 — Comprobar la conexión (sin coste)

```bash
npm run ai:check
```

Consulta la ficha del modelo (gratis) y confirma que la clave es válida y que la cuenta tiene acceso a `claude-haiku-5-5`. No genera texto ni consume crédito.

## Paso 4 — Primeras pruebas reales (con tu visto bueno)

1. Generar 5–10 anuncios de productos reales tuyos y revisar la calidad contigo.
2. Comprobar en la consola de Anthropic (**Usage**) que el coste coincide con la estimación de Ajustes → «Anuncios con IA».
3. Ajustar las instrucciones del modelo si los textos no te convencen.

Coste previsto de estas pruebas: **menos de 0,05 $**.

## Cómo funciona por dentro (resumen)

- La clave vive solo en una variable de entorno del servidor (`ANTHROPIC_API_KEY`, sin prefijo `NEXT_PUBLIC_`). El código que la usa está marcado como «solo servidor»: si alguien intentara usarlo desde el navegador, la app no compilaría.
- Sin clave, la app **no puede** hacer llamadas de pago. Con `AI_MOCK=1` devuelve textos de ejemplo marcados como simulados; sin nada, muestra «no disponible».
- A la IA solo se le envían los datos del anuncio (nombre, marca, categoría, talla, color, estado, precio de venta y los detalles que escribas). **Nunca** el precio de compra, dónde lo compraste ni tus notas privadas.
- Antes de cada llamada se comprueba la sesión, que el producto es tuyo y que no has superado el límite. Cada generación queda registrada con sus tokens para calcular el coste; ese registro no se puede borrar ni modificar desde la app.
- Los errores (clave inválida, sin crédito, límite de Anthropic, caída del servicio, respuesta incompleta o negativa del modelo) se convierten en mensajes claros en español. En los registros del servidor solo queda el tipo de error y un identificador de la petición: nunca la clave ni el contenido.

## Limitaciones conocidas

- La calidad real de los textos está **sin probar** (solo se han usado respuestas simuladas).
- El límite es por usuario. El tope global lo pone el crédito prepago y el límite de gasto de la consola de Anthropic (pasos 1.3 y 1.4): por eso son importantes.
- Dos pulsaciones exactamente simultáneas podrían superar el límite diario en una unidad.
