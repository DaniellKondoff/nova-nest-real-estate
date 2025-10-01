import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated";
import { env } from "@/lib/env";

export function getBrowserClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
            return cookie ? cookie.split('=')[1] : undefined;
          }
          return undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=${value}`;
            if (options?.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
            if (options?.path) cookieString += `; Path=${options.path}`;
            if (options?.domain) cookieString += `; Domain=${options.domain}`;
            if (options?.secure) cookieString += `; Secure`;
            if (options?.httpOnly) cookieString += `; HttpOnly`;
            if (options?.sameSite) cookieString += `; SameSite=${options.sameSite}`;
            document.cookie = cookieString;
          }
        },
        remove(name: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            if (options?.path) cookieString += `; Path=${options.path}`;
            if (options?.domain) cookieString += `; Domain=${options.domain}`;
            document.cookie = cookieString;
          }
        },
      },
    }
  );
}


