import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle English locale redirects
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/" + pathname.slice(4);
    return NextResponse.redirect(url);
  }

  // Admin route protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && pathname !== "/admin/login/") {
    try {
      // Create Supabase client for middleware
      const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              // In middleware, we can't set cookies, so we'll handle this in the response
            },
            remove(name: string, options: any) {
              // In middleware, we can't remove cookies, so we'll handle this in the response
            },
          },
        }
      );

      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return NextResponse.redirect(new URL("/admin/login/", request.url));
      }

      // Check if user is admin
      const { data: adminProfile, error: adminError } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !adminProfile) {
        return NextResponse.redirect(new URL("/admin/login/", request.url));
      }

      // User is authenticated and is admin, allow access
      return NextResponse.next();
    } catch (error) {
      // If there's any error, redirect to login
      console.error("Admin middleware error:", error);
      return NextResponse.redirect(new URL("/admin/login/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, API routes, and Next.js internals
    "/((?!_next|api|static|.*\\..*).*)",
    // Specifically match admin routes
    "/admin/:path*"
  ],
};


