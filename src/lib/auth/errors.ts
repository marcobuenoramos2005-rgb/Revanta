import type { AuthError } from "@supabase/supabase-js";

/** Traduce los errores de Supabase Auth a mensajes claros en español. */
export function authErrorMessage(error: Pick<AuthError, "code" | "message"> | null): string {
  switch (error?.code) {
    case "invalid_credentials":
      return "El email o la contraseña no son correctos.";
    case "email_not_confirmed":
      return "Todavía no has confirmado tu email. Revisa tu bandeja de entrada (y la carpeta de spam).";
    case "weak_password":
      return "La contraseña es demasiado débil. Usa al menos 8 caracteres.";
    case "same_password":
      return "La nueva contraseña debe ser distinta de la actual.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
    case "signup_disabled":
      return "El registro de nuevas cuentas está desactivado temporalmente.";
    case "otp_expired":
      return "El enlace ha caducado o ya se ha usado. Solicita uno nuevo.";
    case "session_not_found":
    case "session_expired":
      return "Tu sesión ha caducado. Vuelve a iniciar sesión.";
    default:
      return "Ha ocurrido un error inesperado. Inténtalo de nuevo.";
  }
}
