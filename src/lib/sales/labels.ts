import type { Database } from "@/lib/supabase/database.types";

export type SalesPlatform = Database["public"]["Enums"]["sales_platform"];

export const PLATFORM_LABELS: Record<SalesPlatform, string> = {
  vinted: "Vinted",
  wallapop: "Wallapop",
  ebay: "eBay",
  milanuncios: "Milanuncios",
  todocoleccion: "Todocolección",
  in_person: "En mano",
  other: "Otra",
};

export const PLATFORMS = Object.keys(PLATFORM_LABELS) as SalesPlatform[];
