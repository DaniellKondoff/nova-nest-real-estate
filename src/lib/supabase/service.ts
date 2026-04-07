import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";
import { env } from "@/lib/env";
import { getServerEnv } from "@/lib/env";

/**
 * Supabase client using the service role key.
 * Bypasses RLS — use only in server-side code that needs to act without a user session.
 * Never expose to the browser.
 */
export function getServiceClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
