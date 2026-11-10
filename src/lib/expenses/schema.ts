import { z } from "zod";

import { money, optionalText, UUID_RE } from "@/lib/products/schema";
import { requiredDate } from "@/lib/sales/schema";
import { EXPENSE_CATEGORIES } from "./labels";

export const expenseSchema = z.object({
  id: z
    .string()
    .refine((v) => v === "" || UUID_RE.test(v))
    .transform((v) => v || null),
  productId: z
    .string()
    .refine((v) => v === "" || UUID_RE.test(v), "Producto no válido.")
    .transform((v) => v || null),
  category: z.enum(EXPENSE_CATEGORIES, "Elige una categoría."),
  description: optionalText(500),
  amount: money(true).refine((v) => v !== null && v > 0, "El importe debe ser mayor que 0."),
  expenseDate: requiredDate,
});
