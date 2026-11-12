import { createBrowserClient } from "@supabase/ssr";

import { sessionCookieOptions } from "./cookie-options";
import type { Database } from "./database.types";

/** Cliente de Supabase para componentes de cliente ("use client"). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookieOptions: sessionCookieOptions() },
  );
}
