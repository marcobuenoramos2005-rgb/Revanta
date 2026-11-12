"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import type { FormState } from "@/lib/form-state";
import { idSchema } from "@/lib/products/schema";
import { saleSchema } from "@/lib/sales/schema";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function revalidateAll() {
  for (const path of ["/inventario", "/ventas", "/panel"]) revalidatePath(path);
}

/** Registra la venta de un producto, o la actualiza si ya existe (una venta por producto). */
export async function saveSale(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = saleSchema.safeParse({
    productId: text(formData, "productId"),
    platform: text(formData, "platform"),
    salePrice: text(formData, "salePrice"),
    platformFee: text(formData, "platformFee"),
    shippingCost: text(formData, "shippingCost"),
    saleDate: text(formData, "saleDate"),
    notes: text(formData, "notes"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const d = parsed.data;
  const supabase = await createClient();
  // RLS y la clave foránea compuesta impiden vender productos de otro usuario.
  const { error } = await supabase.from("sales").upsert(
    {
      product_id: d.productId,
      platform: d.platform,
      sale_price: d.salePrice ?? 0,
      platform_fee: d.platformFee ?? 0,
      shipping_cost: d.shippingCost ?? 0,
      sale_date: d.saleDate,
      notes: d.notes,
    },
    { onConflict: "product_id" },
  );
  if (error) return { error: "No se ha podido guardar la venta. Inténtalo de nuevo." };

  revalidateAll();
  redirect(`/inventario/${d.productId}`);
}

/** Anula la venta: el producto vuelve a «En stock». */
export async function deleteSale(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const productId = idSchema.safeParse(text(formData, "productId"));
  if (!productId.success) return { error: "Producto no válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().eq("product_id", productId.data);
  if (error) return { error: "No se ha podido anular la venta. Inténtalo de nuevo." };

  revalidateAll();
  redirect(`/inventario/${productId.data}`);
}
