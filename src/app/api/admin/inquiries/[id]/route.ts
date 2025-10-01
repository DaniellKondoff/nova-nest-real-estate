import { NextRequest } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
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
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      return unauthorized("Неоторизиран достъп.");
    }

    // Validate inquiry ID
    const inquiryId = parseInt(params.id);
    if (isNaN(inquiryId)) {
      return fail("Невалидно ID на запитване.", { status: 400, code: "VALIDATION_ERROR" });
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = await UpdateStatusSchema.parseAsync(body);

    const supabase = await getSupabaseClient();

    // Update inquiry status and updated_at timestamp
    const { data: updatedInquiry, error } = await supabase
      .from("inquiries")
      .update({
        status: parsed.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inquiryId)
      .select("*, property:properties(*), assigned:admin_profiles(*)")
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