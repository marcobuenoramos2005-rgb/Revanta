import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/** Rutas que requieren sesión. */
const PROTECTED_PREFIXES = [
  "/panel",
  "/inventario",
  "/ventas",
  "/gastos",
  "/estadisticas",
  "/ajustes",
  "/restablecer",
];

/** Rutas solo para visitantes sin sesión. */
const GUEST_ONLY = ["/login", "/registro", "/recuperar"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * 1. Refresca la sesión de Supabase y escribe las cookies actualizadas.
 * 2. Redirección optimista: sin sesión no se entra en la app, y con sesión
 *    no tiene sentido ver el login. La comprobación definitiva se repite
 *    cerca de los datos (DAL + RLS), así que esto es solo comodidad.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl(),
    publicEnv.supabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // No pongas código entre createServerClient y getClaims(): getClaims valida
  // el token y, si ha caducado, lo refresca.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = !!data?.claims?.sub;
  const { pathname, search } = request.nextUrl;

  if (!isSignedIn && matches(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (pathname !== "/restablecer") url.searchParams.set("next", pathname + search);
    return redirectWithCookies(url, response);
  }

  if (isSignedIn && matches(pathname, GUEST_ONLY)) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

/** Redirige conservando las cookies de sesión que se hayan refrescado. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
