import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino de los enlaces de las plantillas de email POR DEFECTO de Supabase.
 *
 * Flujo: el enlace del email abre primero Supabase, que valida el token y
 * redirige aquí con un `code` de un solo uso. Ese código se canjea por la
 * sesión usando un verificador guardado en una cookie del navegador donde se
 * pidió el email (PKCE), y después se redirige a `next`.
 *
 * Las plantillas propias (token_hash) siguen entrando por /auth/confirm.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const loginUrl = new URL("/login", request.url);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));

    // Supabase ya validó el enlace, pero no se pudo crear la sesión aquí
    // (normalmente porque se abrió en otro navegador o dispositivo).
    loginUrl.searchParams.set("error", "navegador");
    return NextResponse.redirect(loginUrl);
  }

  // Sin código: Supabase rechazó el enlace (caducado, ya usado o inválido).
  loginUrl.searchParams.set("error", "enlace");
  return NextResponse.redirect(loginUrl);
}
