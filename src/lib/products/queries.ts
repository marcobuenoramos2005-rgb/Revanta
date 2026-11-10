import "server-only";

import { requireUser } from "@/lib/auth/dal";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { STOCK_STATUSES, type ProductStatus } from "./labels";
import { idSchema } from "./schema";

export type Product = Database["public"]["Tables"]["products"]["Row"];

const PHOTO_BUCKET = "product-photos";
const SIGNED_URL_SECONDS = 60 * 60;
export const LIST_LIMIT = 200;

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Las fotos son privadas: se sirven con URLs firmadas temporales. */
async function signPhotos(supabase: Supabase, paths: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (paths.length === 0) return urls;
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS);
  data?.forEach((item) => {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  });
  return urls;
}

export type ProductListItem = Pick<
  Product,
  "id" | "title" | "brand" | "size" | "status" | "purchase_price" | "listed_price"
> & { coverUrl: string | null };

export type ProductFilter = { query?: string; status?: ProductStatus };

/** Quita los caracteres con significado especial en los filtros de PostgREST. */
function sanitizeSearch(query: string) {
  return query.replace(/[,()%*\\"]/g, " ").trim().slice(0, 100);
}

export async function listProducts(filter: ProductFilter): Promise<ProductListItem[]> {
  await requireUser();
  const supabase = await createClient();

  let request = supabase
    .from("products")
    .select("id, title, brand, size, status, purchase_price, listed_price, photo_paths")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);

  // Por defecto no se muestran los archivados.
  request = filter.status ? request.eq("status", filter.status) : request.neq("status", "archived");

  const search = filter.query ? sanitizeSearch(filter.query) : "";
  if (search) {
    request = request.or(
      `title.ilike.%${search}%,brand.ilike.%${search}%,category.ilike.%${search}%`,
    );
  }

  const { data, error } = await request;
  if (error) throw new Error("No se ha podido cargar el inventario.");

  const covers = data.map((p) => p.photo_paths[0]).filter(Boolean);
  const urls = await signPhotos(supabase, covers);

  return data.map(({ photo_paths, ...product }) => ({
    ...product,
    coverUrl: (photo_paths[0] && urls.get(photo_paths[0])) || null,
  }));
}

export type ProductDetail = Product & { photos: { path: string; url: string }[] };

export async function getProduct(id: string): Promise<ProductDetail | null> {
  await requireUser();
  if (!idSchema.safeParse(id).success) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) return null;

  const urls = await signPhotos(supabase, data.photo_paths);
  return {
    ...data,
    photos: data.photo_paths.flatMap((path) => {
      const url = urls.get(path);
      return url ? [{ path, url }] : [];
    }),
  };
}

/** Resumen del stock disponible (en stock, publicado o reservado). */
export async function getStockSummary(): Promise<{ count: number; value: number; total: number }> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("status, purchase_price");
  if (error) throw new Error("No se ha podido cargar el resumen del stock.");

  const stock = data.filter((p) => STOCK_STATUSES.includes(p.status));
  return {
    count: stock.length,
    // Suma en céntimos para evitar errores de redondeo.
    value: stock.reduce((sum, p) => sum + Math.round(p.purchase_price * 100), 0) / 100,
    total: data.length,
  };
}
