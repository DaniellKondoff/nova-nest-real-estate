import { NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail, unauthorized } from "@/lib/api";

/**
 * Admin dashboard summary statistics
 *
 * Authentication: admin required
 */
export async function GET(_req: NextRequest) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const supabase = await getSupabaseClient();

    const [propertiesRes, inquiriesRes, testimonialsRes, featuredRes] = await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase.from("inquiries").select("id", { count: "exact", head: true }).neq("status", "closed"),
      supabase
        .from("testimonials")
        .select("id, content_bg, client_name, review_date", { count: "exact" })
        .order("review_date", { ascending: false })
        .limit(5),
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);

    if (propertiesRes.error || inquiriesRes.error || testimonialsRes.error || featuredRes.error) {
      throw new DatabaseError("Неуспешно зареждане на статистики.");
    }

    const data = {
      totals: {
        properties: propertiesRes.count ?? 0,
        activeInquiries: inquiriesRes.count ?? 0,
        featuredProperties: featuredRes.count ?? 0,
      },
      recentTestimonials: (testimonialsRes.data as any[]) ?? [],
    };

    const body: SuccessResponse<typeof data> = { data };
    return ok(body.data);
  } catch (err) {
    const status = err instanceof AuthError ? 401 : 500;
    return fail(formatErrorMessage(err), { status, code: status === 401 ? "UNAUTHORIZED" : "SERVER_ERROR" });
  }
}


