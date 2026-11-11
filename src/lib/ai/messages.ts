import type { ListingErrorCode } from "./generate";

export type ListingFailureCode = ListingErrorCode | "limit_reached" | "not_found";

/** Mensajes para el usuario. No revelan detalles técnicos ni de configuración. */
export const LISTING_ERROR_MESSAGES: Record<ListingFailureCode, string> = {
  not_configured: "La generación de anuncios con IA no está disponible en este momento.",
  rate_limited: "Hay muchas peticiones ahora mismo. Espera un minuto y vuelve a intentarlo.",
  unavailable: "No se ha podido conectar con el servicio de IA. Inténtalo de nuevo en unos minutos.",
  refused: "La IA no ha podido generar un anuncio para este artículo. Revisa los datos e inténtalo de nuevo.",
  truncated: "La respuesta ha quedado incompleta. Inténtalo de nuevo.",
  invalid_output: "La respuesta de la IA no es válida. Inténtalo de nuevo.",
  limit_reached: "Has alcanzado el límite de anuncios de las últimas 24 horas. Vuelve a intentarlo más tarde.",
  not_found: "Este producto ya no existe.",
};
