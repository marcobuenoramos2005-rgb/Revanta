import "server-only";

import { requireUser } from "@/lib/auth/dal";
import { currentMonthRange, sumMoney } from "@/lib/format";
import { idSchema } from "@/lib/products/schema";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import type { SalesPlatform } from "./labels";

export type Sale = Database["public"]["Tables"]["sales"]["Row"];

export type SaleListItem = {
  productId: string;
  title: string;
  platform: SalesPlatform;
  saleDate: string;
  salePrice: number;
  netProfit: number;
};

export const SALES_LIMIT = 200;

/** Ventas con su beneficio neto (vista product_profit, protegida por RLS). */
export async function listSales(): Promise<SaleListItem[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_profit")
    .select("product_id, title, platform, sale_date, sale_price, net_profit")
    .not("sale_id", "is", null)
    .order("sale_date", { ascending: false })
    .limit(SALES_LIMIT);
  if (error) throw new Error("No se han podido cargar las ventas.");

  return data.map((row) => ({
    productId: row.product_id!,
    title: row.title!,
    platform: row.platform!,
    saleDate: row.sale_date!,
    salePrice: row.sale_price ?? 0,
    netProfit: row.net_profit ?? 0,
  }));
}

export async function getSaleByProduct(productId: string): Promise<Sale | null> {
  await requireUser();
  if (!idSchema.safeParse(productId).success) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("sales").select("*").eq("product_id", productId).maybeSingle();
  return data;
}

export type MonthSummary = {
  salesCount: number;
  revenue: number;
  /** Beneficio de los productos vendidos este mes. */
  productProfit: number;
  /** Gastos generales (no asociados a un producto) de este mes. */
  generalExpenses: number;
  /** productProfit − generalExpenses */
  netProfit: number;
};

export async function getMonthSummary(): Promise<MonthSummary> {
  await requireUser();
  const supabase = await createClient();
  const { start, end } = currentMonthRange();

  const [sales, expenses] = await Promise.all([
    supabase
      .from("product_profit")
      .select("sale_price, net_profit")
      .gte("sale_date", start)
      .lt("sale_date", end),
    supabase
      .from("expenses")
      .select("amount")
      .is("product_id", null)
      .gte("expense_date", start)
      .lt("expense_date", end),
  ]);
  if (sales.error || expenses.error) throw new Error("No se ha podido cargar el resumen del mes.");

  const productProfit = sumMoney(sales.data.map((s) => s.net_profit));
  const generalExpenses = sumMoney(expenses.data.map((e) => e.amount));
  return {
    salesCount: sales.data.length,
    revenue: sumMoney(sales.data.map((s) => s.sale_price)),
    productProfit,
    generalExpenses,
    netProfit: sumMoney([productProfit, -generalExpenses]),
  };
}
