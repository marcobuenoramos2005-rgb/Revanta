import "server-only";

import { requireUser } from "@/lib/auth/dal";
import { daysBetween, lastMonths, sumMoney, todayISO } from "@/lib/format";
import { STOCK_STATUSES } from "@/lib/products/labels";
import { PLATFORM_LABELS } from "@/lib/sales/labels";
import { createClient } from "@/lib/supabase/server";

/** Máximo de filas que devuelve la API en una consulta. */
const ROW_LIMIT = 1000;

export type MonthStat = { key: string; profit: number; revenue: number; sales: number };
export type GroupStat = { label: string; profit: number; revenue: number; sales: number };

export type Stats = {
  months: MonthStat[];
  byPlatform: GroupStat[];
  byCategory: GroupStat[];
  salesCount: number;
  revenue: number;
  /** Beneficio de los productos vendidos en el periodo. */
  productProfit: number;
  /** Gastos generales (sin producto) del periodo. */
  generalExpenses: number;
  netProfit: number;
  /** Beneficio de las ventas / ingresos (null si no hay ingresos). */
  margin: number | null;
  /** Media de días entre la compra y la venta (solo productos con fecha de compra). */
  avgDaysToSell: number | null;
  /** true si se alcanzó el límite de filas y las cifras pueden estar incompletas. */
  truncated: boolean;
};

function group<T>(rows: T[], keyOf: (row: T) => string, profitOf: (row: T) => number, revenueOf: (row: T) => number) {
  const groups = new Map<string, { profits: number[]; revenues: number[] }>();
  for (const row of rows) {
    const key = keyOf(row);
    const entry = groups.get(key) ?? { profits: [], revenues: [] };
    entry.profits.push(profitOf(row));
    entry.revenues.push(revenueOf(row));
    groups.set(key, entry);
  }
  return [...groups.entries()]
    .map(([label, g]): GroupStat => ({
      label,
      profit: sumMoney(g.profits),
      revenue: sumMoney(g.revenues),
      sales: g.profits.length,
    }))
    .sort((a, b) => b.profit - a.profit);
}

/** Estadísticas de los últimos `monthCount` meses (incluido el actual). */
export async function getStats(monthCount: number): Promise<Stats> {
  await requireUser();
  const supabase = await createClient();
  const monthKeys = lastMonths(monthCount);
  const start = `${monthKeys[0]}-01`;

  const [salesResult, expensesResult] = await Promise.all([
    supabase
      .from("product_profit")
      .select("product_id, platform, sale_price, net_profit, days_to_sell, sale_date")
      .gte("sale_date", start)
      .limit(ROW_LIMIT),
    supabase
      .from("expenses")
      .select("amount, expense_date")
      .is("product_id", null)
      .gte("expense_date", start)
      .limit(ROW_LIMIT),
  ]);
  if (salesResult.error || expensesResult.error) {
    throw new Error("No se han podido cargar las estadísticas.");
  }
  const sales = salesResult.data;
  const expenses = expensesResult.data;

  // Categoría de cada producto vendido.
  const categories = new Map<string, string | null>();
  const productIds = sales.map((s) => s.product_id!).filter(Boolean);
  if (productIds.length) {
    const { data } = await supabase.from("products").select("id, category").in("id", productIds);
    data?.forEach((p) => categories.set(p.id, p.category));
  }

  const months = monthKeys.map((key): MonthStat => {
    const monthSales = sales.filter((s) => s.sale_date!.startsWith(key));
    const monthExpenses = expenses.filter((e) => e.expense_date.startsWith(key));
    return {
      key,
      sales: monthSales.length,
      revenue: sumMoney(monthSales.map((s) => s.sale_price)),
      profit: sumMoney([
        ...monthSales.map((s) => s.net_profit),
        ...monthExpenses.map((e) => -e.amount),
      ]),
    };
  });

  const revenue = sumMoney(sales.map((s) => s.sale_price));
  const productProfit = sumMoney(sales.map((s) => s.net_profit));
  const generalExpenses = sumMoney(expenses.map((e) => e.amount));
  const days = sales.map((s) => s.days_to_sell).filter((d): d is number => d !== null && d >= 0);

  return {
    months,
    byPlatform: group(sales, (s) => PLATFORM_LABELS[s.platform!], (s) => s.net_profit ?? 0, (s) => s.sale_price ?? 0),
    byCategory: group(
      sales,
      (s) => categories.get(s.product_id!)?.trim() || "Sin categoría",
      (s) => s.net_profit ?? 0,
      (s) => s.sale_price ?? 0,
    ),
    salesCount: sales.length,
    revenue,
    productProfit,
    generalExpenses,
    netProfit: sumMoney([productProfit, -generalExpenses]),
    margin: revenue > 0 ? productProfit / revenue : null,
    avgDaysToSell: days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null,
    truncated: sales.length === ROW_LIMIT || expenses.length === ROW_LIMIT,
  };
}

export const STALE_DAYS = 30;

export type StaleProduct = { id: string; title: string; days: number; purchasePrice: number };

/** Productos sin vender desde hace más de STALE_DAYS días (por fecha de compra o de alta). */
export async function getStaleStock(): Promise<{ count: number; value: number; oldest: StaleProduct[] }> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, title, purchase_price, purchase_date, created_at")
    .in("status", STOCK_STATUSES)
    .limit(ROW_LIMIT);
  if (error) throw new Error("No se ha podido cargar el stock.");

  const today = todayISO();
  const stale = data
    .map((p): StaleProduct => ({
      id: p.id,
      title: p.title,
      purchasePrice: p.purchase_price,
      days: daysBetween(p.purchase_date ?? p.created_at, today),
    }))
    .filter((p) => p.days > STALE_DAYS)
    .sort((a, b) => b.days - a.days);

  return {
    count: stale.length,
    value: sumMoney(stale.map((p) => p.purchasePrice)),
    oldest: stale.slice(0, 5),
  };
}
