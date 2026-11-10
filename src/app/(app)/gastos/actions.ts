"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { expenseSchema } from "@/lib/expenses/schema";
import type { FormState } from "@/lib/form-state";
import { idSchema } from "@/lib/products/schema";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function revalidateAll() {
  for (const path of ["/inventario", "/ventas", "/gastos", "/panel"]) revalidatePath(path);
}

/** Vuelve a la ficha del producto si el gasto se abrió desde ella; si no, a la lista. */
function returnPath(formData: FormData, productId: string | null) {
  return text(formData, "from") === "product" && productId ? `/inventario/${productId}` : "/gastos";
}

export async function saveExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = expenseSchema.safeParse({
    id: text(formData, "id"),
    productId: text(formData, "productId"),
    category: text(formData, "category"),
    description: text(formData, "description"),
    amount: text(formData, "amount"),
    expenseDate: text(formData, "expenseDate"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const d = parsed.data;
  const row = {
    product_id: d.productId,
    category: d.category,
    description: d.description,
    amount: d.amount!,
    expense_date: d.expenseDate,
  };

  const supabase = await createClient();
  const { error } = d.id
    ? await supabase.from("expenses").update(row).eq("id", d.id)
    : await supabase.from("expenses").insert(row);
  if (error) return { error: "No se ha podido guardar el gasto. Inténtalo de nuevo." };

  revalidateAll();
  redirect(returnPath(formData, d.productId));
}

export async function deleteExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const id = idSchema.safeParse(text(formData, "id"));
  if (!id.success) return { error: "Gasto no válido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id.data)
    .select("product_id")
    .maybeSingle();
  if (error) return { error: "No se ha podido eliminar el gasto. Inténtalo de nuevo." };

  revalidateAll();
  redirect(returnPath(formData, data?.product_id ?? null));
}
