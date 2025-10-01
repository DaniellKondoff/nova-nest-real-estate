import { NextRequest } from "next/server";
import { isAdminUserServer } from "@/lib/auth-server";
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
    const isAdmin = await isAdminUserServer();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const supabase = await getSupabaseClient();

    // Get current month start date
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [propertiesRes, activeInquiriesRes, pendingTestimonialsRes, monthlyPropertiesRes] = await Promise.all([
      // Total properties (excluding archived)
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .neq("status", "archived"),
      
      // Active inquiries (new or in_progress status)
      supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "in_progress"]),
      
      // Pending testimonials (not published)
      supabase
        .from("testimonials")
        .select("id", { count: "exact", head: true })
        .eq("is_published", false),
      
      // Properties created this month
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart.toISOString()),
    ]);

    if (propertiesRes.error || activeInquiriesRes.error || pendingTestimonialsRes.error || monthlyPropertiesRes.error) {
      throw new DatabaseError("Неуспешно зареждане на статистики.");
    }

    const data = {
      totalProperties: propertiesRes.count ?? 0,
      activeInquiries: activeInquiriesRes.count ?? 0,
      pendingTestimonials: pendingTestimonialsRes.count ?? 0,
      propertiesThisMonth: monthlyPropertiesRes.count ?? 0,
    };

    const body: SuccessResponse<typeof data> = { data };
    return ok(body.data);
  } catch (err) {
    const status = err instanceof AuthError ? 401 : 500;
    return fail(formatErrorMessage(err), { status, code: status === 401 ? "UNAUTHORIZED" : "SERVER_ERROR" });
  }
}


