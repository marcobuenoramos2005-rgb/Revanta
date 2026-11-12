import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
};

/**
 * Capa de acceso a datos: devuelve el usuario de la sesión actual o null.
 * Valida el token (getClaims) en lugar de confiar en la cookie sin verificar.
 * `cache` evita repetir la comprobación dentro de una misma petición.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // La validación del token depende de la hora actual: siempre en tiempo de petición,
  // nunca dentro de un prerenderizado (evita mostrar una sesión caducada).
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: data.claims.email ?? "" };
});

/** Igual que getCurrentUser, pero redirige al login si no hay sesión. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export const getProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("business_name, currency")
    .eq("id", user.id)
    .single();
  return {
    businessName: data?.business_name ?? "",
    currency: data?.currency ?? "EUR",
  };
});
