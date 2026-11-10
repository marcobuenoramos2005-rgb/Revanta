import { z } from "zod";

import { money, optionalText, UUID_RE } from "@/lib/products/schema";
import { PLATFORMS } from "./labels";

const requiredDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha.");

export const saleSchema = z.object({
  productId: z.string().regex(UUID_RE),
  platform: z.enum(PLATFORMS, "Elige dónde lo has vendido."),
  salePrice: money(true),
  platformFee: money(false),
  shippingCost: money(false),
  saleDate: requiredDate,
  notes: optionalText(2000),
});

export { requiredDate };
