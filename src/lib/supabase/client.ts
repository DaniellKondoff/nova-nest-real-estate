import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated";
import { env } from "@/lib/env";

export function getBrowserClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}


