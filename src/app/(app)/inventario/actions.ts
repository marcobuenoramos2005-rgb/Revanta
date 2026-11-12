"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import type { FormState } from "@/lib/form-state";
import { idSchema, isOwnPhotoPath, productSchema, statusSchema } from "@/lib/products/schema";
import { createClient } from "@/lib/supabase/server";

const PHOTO_BUCKET = "product-photos";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseProduct(formData: FormData, userId: string) {
  let photoPaths: unknown = [];
  try {
    photoPaths = JSON.parse(text(formData, "photoPaths") || "[]");
  } catch {
    photoPaths = null;
  }

  const parsed = productSchema.safeParse({
    id: text(formData, "id"),
    title: text(formData, "title"),
    brand: text(formData, "brand"),
    category: text(formData, "category"),
    size: text(formData, "size"),
    color: text(formData, "color"),
    condition: text(formData, "condition"),
    status: text(formData, "status"),
    purchasePrice: text(formData, "purchasePrice"),
    purchaseDate: text(formData, "purchaseDate"),
    purchaseSource: text(formData, "purchaseSource"),
    listedPrice: text(formData, "listedPrice"),
    notes: text(formData, "notes"),
    photoPaths,
  });
  if (!parsed.success) {
    return { ok: false as const, state: { fieldErrors: z.flattenError(parsed.error).fieldErrors } };
  }

  // Las fotos deben estar en la carpeta de este usuario y de este producto.
  const { id, photoPaths: paths } = parsed.data;
  if (!paths.every((path) => isOwnPhotoPath(path, userId, id))) {
    return { ok: false as const, state: { error: "Alguna foto no es válida. Vuelve a subirla." } };
  }

  const d = parsed.data;
  return {
    ok: true as const,
    id,
    row: {
      title: d.title,
      brand: d.brand,
      category: d.category,
      size: d.size,
      color: d.color,
      condition: d.condition,
      purchase_price: d.purchasePrice ?? 0,
      purchase_date: d.purchaseDate,
      purchase_source: d.purchaseSource,
      listed_price: d.listedPrice,
      notes: d.notes,
      photo_paths: d.photoPaths,
    },
    status: d.status,
  };
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const result = parseProduct(formData, user.id);
  if (!result.ok) return result.state;

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .insert({ id: result.id, ...result.row, status: result.status });
  if (error) return { error: "No se ha podido guardar el producto. Inténtalo de nuevo." };

  revalidatePath("/inventario");
  revalidatePath("/panel");
  redirect(`/inventario/${result.id}`);
}

export async function updateProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const result = parseProduct(formData, user.id);
  if (!result.ok) return result.state;

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("products")
    .select("status, photo_paths")
    .eq("id", result.id)
    .maybeSingle();
  if (!current) return { error: "Este producto ya no existe." };

  // Un producto vendido conserva su situación: solo cambia al anular la venta.
  const status = current.status === "sold" ? "sold" : result.status;
  const { error } = await supabase
    .from("products")
    .update({ ...result.row, status })
    .eq("id", result.id);
  if (error) return { error: "No se han podido guardar los cambios. Inténtalo de nuevo." };

  // Borra del almacenamiento las fotos que se han quitado.
  const removed = current.photo_paths.filter((path) => !result.row.photo_paths.includes(path));
  if (removed.length) await supabase.storage.from(PHOTO_BUCKET).remove(removed);

  revalidatePath("/inventario");
  revalidatePath("/panel");
  redirect(`/inventario/${result.id}`);
}

export async function setProductStatus(formData: FormData): Promise<void> {
  await requireUser();
  const parsed = statusSchema.safeParse({ id: text(formData, "id"), status: text(formData, "status") });
  if (!parsed.success) return;

  const supabase = await createClient();
  // No se modifica a mano la situación de un producto vendido.
  await supabase
    .from("products")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .neq("status", "sold");

  revalidatePath("/inventario");
  revalidatePath("/panel");
}

export async function deleteProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const id = idSchema.safeParse(text(formData, "id"));
  if (!id.success) return { error: "Producto no válido." };

  const supabase = await createClient();
  const { data: deleted, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id.data)
    .select("photo_paths")
    .maybeSingle();
  if (error) return { error: "No se ha podido eliminar el producto. Inténtalo de nuevo." };

  if (deleted?.photo_paths.length) {
    await supabase.storage.from(PHOTO_BUCKET).remove(deleted.photo_paths);
  }

  revalidatePath("/inventario");
  revalidatePath("/panel");
  redirect("/inventario");
}
