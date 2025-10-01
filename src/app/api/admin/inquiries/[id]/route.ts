import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail, unauthorized } from "@/lib/api";

const UpdateStatusSchema = z.object({
  status: z.enum(["new", "in_progress", "responded", "closed"]),
});

/**
 * Update inquiry status
 *
 * Authentication: admin required
 * Path params:
 * - id: inquiry ID
 * Body:
 * - status: one of new|in_progress|responded|closed
 *
 * Returns updated inquiry with joined property and assigned agent.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing its properties
    const resolvedParams = await params;

    const supabase = await getServerClient();

    // Check authentication using server client
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized("Неоторизиран достъп.");
    }

    // Check if user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return unauthorized("Нямате администраторски права.");
    }

    // Validate inquiry ID
    const inquiryId = parseInt(resolvedParams.id);
    if (isNaN(inquiryId)) {
      return fail("Невалидно ID на запитване.", { status: 400, code: "VALIDATION_ERROR" });
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = await UpdateStatusSchema.parseAsync(body);

    // Check if inquiry exists before updating
    const { data: existingInquiry, error: fetchError } = await supabase
      .from("inquiries")
      .select("id, status")
      .eq("id", inquiryId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return fail("Запитването не е намерено.", { status: 404, code: "NOT_FOUND" });
      }
      return fail("Грешка при зареждане на запитването.", { status: 500, code: "SERVER_ERROR" });
    }

    // First try a simple update without joins to see if that works
    const { data: updatedInquiry, error } = await supabase
      .from("inquiries")
      .update({
        status: parsed.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inquiryId)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return fail("Запитването не е намерено.", { status: 404, code: "NOT_FOUND" });
      }
      throw new DatabaseError("Неуспешно обновяване на статуса на запитването.");
    }

    const response: SuccessResponse<typeof updatedInquiry> = {
      data: updatedInquiry,
    };

    return ok(response.data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return fail("Невалидни данни.", { 
        status: 400, 
        code: "VALIDATION_ERROR", 
        details: { issues: err.issues } 
      });
    }
    
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: formatErrorMessage(err) };
    return fail(body.error, { 
      status, 
      code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" 
    });
  }
}