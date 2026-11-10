"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { authErrorMessage } from "@/lib/auth/errors";
import { DELETE_CONFIRMATION, newPasswordSchema, profileSchema } from "@/lib/auth/schemas";
import type { FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    businessName: text(formData, "businessName"),
    currency: text(formData, "currency"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      business_name: parsed.data.businessName || null,
      currency: parsed.data.currency,
    })
    .eq("id", user.id);
  if (error) return { error: "No se han podido guardar los cambios. Inténtalo de nuevo." };

  revalidatePath("/", "layout");
  return { success: "Cambios guardados." };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = newPasswordSchema.safeParse({
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: authErrorMessage(error) };
  return { success: "Contraseña actualizada." };
}

export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  if (text(formData, "confirmation").trim().toUpperCase() !== DELETE_CONFIRMATION) {
    return { fieldErrors: { confirmation: [`Escribe ${DELETE_CONFIRMATION} para confirmar.`] } };
  }

  const supabase = await createClient();
  // Nota: cuando existan fotos (Fase 3), se borrarán del almacenamiento antes de este paso.
  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { error: "No se ha podido eliminar la cuenta. Inténtalo de nuevo." };

  await supabase.auth.signOut();
  redirect("/");
}
