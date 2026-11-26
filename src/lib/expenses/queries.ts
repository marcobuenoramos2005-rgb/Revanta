import "server-only";

import { requireUser } from "@/lib/auth/dal";
import { idSchema } from "@/lib/products/schema";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseListItem = Expense & { productTitle: string | null };

export const EXPENSES_LIMIT = 200;

export async function listExpenses(): Promise<ExpenseListItem[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(EXPENSES_LIMIT);
  if (error) throw new Error("No se han podido cargar los gastos.");

  const productIds = [...new Set(data.map((e) => e.product_id).filter((id): id is string => !!id))];
  const titles = new Map<string, string>();
  if (productIds.length) {
    const { data: products } = await supabase.from("products").select("id, title").in("id", productIds);
    products?.forEach((p) => titles.set(p.id, p.title));
  }

  return data.map((e) => ({ ...e, productTitle: (e.product_id && titles.get(e.product_id)) || null }));
}

export async function listProductExpenses(productId: string): Promise<Expense[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("product_id", productId)
    .order("expense_date", { ascending: false });
  if (error) throw new Error("No se han podido cargar los gastos del producto.");
  return data;
}

export async function getExpense(id: string): Promise<Expense | null> {
  await requireUser();
  if (!idSchema.safeParse(id).success) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("expenses").select("*").eq("id", id).maybeSingle();
  return data;
}

/** Productos para el desplegable "asociar a un producto". */
export async function listProductOptions(): Promise<{ id: string; title: string }[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, title")
    .order("created_at", { ascending: false })
    .limit(300);
  return data ?? [];
}
