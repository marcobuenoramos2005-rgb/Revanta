import { z } from "zod";

import { CONDITIONS, EDITABLE_STATUSES } from "./labels";

export const MAX_PHOTOS = 8;

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
export const UUID_RE = new RegExp(`^${UUID}$`);

/** Ruta de una foto en el almacenamiento: <usuario>/<producto>/<foto>.jpg */
export function photoPath(userId: string, productId: string, photoId: string) {
  return `${userId}/${productId}/${photoId}.jpg`;
}

export function isOwnPhotoPath(path: string, userId: string, productId: string) {
  return new RegExp(`^${userId}/${productId}/${UUID}\\.jpg$`).test(path);
}

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((value) => value || null);

/** Importe con coma o punto decimal: "12", "12,5", "12.50". */
export const money = (required: boolean) =>
  z
    .string()
    .trim()
    .transform((value) => value.replace(",", "."))
    .refine((value) => (required ? value !== "" : true), "Introduce un importe.")
    .refine(
      (value) => value === "" || /^\d{1,9}(\.\d{1,2})?$/.test(value),
      "Introduce un importe válido, por ejemplo 12,50.",
    )
    .transform((value) => (value === "" ? null : Number(value)));

export const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Fecha no válida.")
  .transform((value) => value || null);

export const productSchema = z.object({
  id: z.string().regex(UUID_RE, "Identificador no válido."),
  title: z.string().trim().min(1, "Escribe un título.").max(200, "Máximo 200 caracteres."),
  brand: optionalText(100),
  category: optionalText(100),
  size: optionalText(50),
  color: optionalText(50),
  condition: z
    .string()
    .refine((value) => value === "" || (CONDITIONS as string[]).includes(value), "Estado no válido.")
    .transform((value) => (value === "" ? null : (value as (typeof CONDITIONS)[number]))),
  status: z.enum(EDITABLE_STATUSES, "Situación no válida."),
  purchasePrice: money(true),
  purchaseDate: optionalDate,
  purchaseSource: optionalText(200),
  listedPrice: money(false),
  notes: optionalText(5000),
  photoPaths: z.array(z.string()).max(MAX_PHOTOS, `Máximo ${MAX_PHOTOS} fotos.`),
});

export const statusSchema = z.object({
  id: z.string().regex(UUID_RE),
  status: z.enum(EDITABLE_STATUSES),
});

export const idSchema = z.string().regex(UUID_RE);
