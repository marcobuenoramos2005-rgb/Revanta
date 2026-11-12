"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { authErrorMessage } from "@/lib/auth/errors";
import { safeNextPath } from "@/lib/auth/redirect";
import {
  emailSchema,
  newPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/schemas";
import type { FormState } from "@/lib/form-state";
import { authCallbackUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const parsed = signInSchema.safeParse({ email, password: text(formData, "password") });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: authErrorMessage(error), values: { email } };
  }

  redirect(safeNextPath(text(formData, "next")));
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const parsed = signUpSchema.safeParse({ email, password: text(formData, "password") });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { email } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    // Usado por las plantillas por defecto de Supabase; las propias (token_hash) lo ignoran.
    options: { emailRedirectTo: await authCallbackUrl("/panel") },
  });
  if (error) {
    return { error: authErrorMessage(error), values: { email } };
  }

  // Si la confirmación por email está desactivada, ya hay sesión.
  if (data.session) redirect("/panel");

  // Mismo mensaje exista o no la cuenta, para no revelar qué emails están registrados.
  return { success: parsed.data.email, values: { email: parsed.data.email } };
}

export async function resendConfirmation(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse({ email: text(formData, "email") });
  if (!parsed.success) return { error: "Email no válido." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: await authCallbackUrl("/panel") },
  });
  if (error) return { error: authErrorMessage(error) };
  return { success: "Te hemos enviado un nuevo email de confirmación." };
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const parsed = emailSchema.safeParse({ email });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: await authCallbackUrl("/restablecer"),
  });
  // Solo informamos de límites de envío; cualquier otro caso responde igual
  // para no revelar si el email está registrado.
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { error: authErrorMessage(error), values: { email } };
  }

  return {
    success:
      "Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña en unos minutos.",
    values: { email },
  };
}

export async function setNewPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse({
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) {
    return { error: "El enlace ha caducado. Solicita uno nuevo desde «¿Olvidaste tu contraseña?»." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: authErrorMessage(error) };

  redirect("/panel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
