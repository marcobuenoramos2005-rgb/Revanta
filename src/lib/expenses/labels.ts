import type { Database } from "@/lib/supabase/database.types";

export type ExpenseCategory = Database["public"]["Enums"]["expense_category"];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  shipping: "Envío",
  packaging: "Embalaje",
  transport: "Transporte",
  platform_fees: "Comisiones",
  subscriptions: "Suscripciones",
  supplies: "Material",
  other: "Otros",
};

export const EXPENSE_CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];
