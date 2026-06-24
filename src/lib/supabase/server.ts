import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";
import { env } from "@/lib/env";

export async function getServerClient() {
  // In Next.js 15+, cookies() must be awaited before use (dynamic API)
  const cookieStore = await cookies();

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // In edge/runtime without mutable cookies, ignore set during RSC
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // ignore
        }
      },
    },
  });
}

/**
 * Returns a Supabase client suitable for use inside `unstable_cache` callbacks.
 * Does NOT call cookies() so it can be used in cached contexts without
 * "Dynamic data source inside cache scope" errors. Only use for public,
 * non-user-specific read queries.
 */
export function getStaticServerClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}


