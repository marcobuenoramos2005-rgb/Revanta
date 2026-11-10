import type { Database } from "@/lib/supabase/database.types";

export type ProductStatus = Database["public"]["Enums"]["product_status"];
export type ProductCondition = Database["public"]["Enums"]["product_condition"];

export const STATUS_LABELS: Record<ProductStatus, string> = {
  in_stock: "En stock",
  listed: "Publicado",
  reserved: "Reservado",
  sold: "Vendido",
  archived: "Archivado",
};

/** Estados que el usuario puede elegir a mano ("Vendido" se asigna al registrar una venta). */
export const EDITABLE_STATUSES = ["in_stock", "listed", "reserved", "archived"] as const;

/** Estados que cuentan como stock disponible. */
export const STOCK_STATUSES: ProductStatus[] = ["in_stock", "listed", "reserved"];

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new_with_tags: "Nuevo con etiquetas",
  new: "Nuevo sin etiquetas",
  very_good: "Muy bueno",
  good: "Bueno",
  fair: "Satisfactorio",
};

export const CONDITIONS = Object.keys(CONDITION_LABELS) as ProductCondition[];

export const CATEGORY_SUGGESTIONS = [
  "Ropa",
  "Calzado",
  "Bolsos y accesorios",
  "Joyería y relojes",
  "Electrónica",
  "Videojuegos y consolas",
  "Libros, cine y música",
  "Hogar y decoración",
  "Juguetes",
  "Deporte",
  "Coleccionismo",
  "Otros",
];
