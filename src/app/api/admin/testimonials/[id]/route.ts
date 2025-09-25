import { NextRequest } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail, notFound, unauthorized } from "@/lib/api";

const UpdateSchema = z.object({
  client_name: z.string().min(2).optional(),
  client_initial: z.string().max(5).optional(),
  client_role: z.string().max(120).optional(),
  content_bg: z.string().min(10).optional(),
  content_en: z.string().min(10).optional(),
  rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
  property_id: z.coerce.number().int().positive().nullable().optional(),
  service_type: z.string().max(120).nullable().optional(),
  review_date: z.coerce.date().optional(),
  is_published: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

/**
 * Get a testimonial by ID (admin)
 *
 * Authentication: admin required
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) throw new ValidationError("Невалидно ID на отзив.");

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*, property:properties(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new DatabaseError("Неуспешно зареждане на отзив.");
    if (!data) return notFound("Отзивът не е намерен.");

    const body: SuccessResponse<any> = { data };
    return ok(body.data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return fail("Невалидни параметри.", { status: 400, code: "VALIDATION_ERROR", details: { issues: err.issues } });
    }
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    return fail(formatErrorMessage(err), { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}

/**
 * Update a testimonial by ID (admin)
 *
 * Authentication: admin required
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) throw new ValidationError("Невалидно ID на отзив.");

    const payload = await req.json();
    const parsed = await UpdateSchema.parseAsync(payload);

    const supabase = getSupabaseClient();

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    Object.assign(updateFields, parsed);
    if (parsed.review_date) updateFields.review_date = parsed.review_date.toISOString();

    const { data, error } = await supabase
      .from("testimonials")
      .update(updateFields)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new DatabaseError("Неуспешно обновяване на отзив.");
    if (!data) return notFound("Отзивът не е намерен.");

    // Optionally auto-approve high ratings when updated
    if ((parsed.rating ?? null) !== null && (parsed.rating as number) >= 5) {
      await getSupabaseClient().rpc("auto_approve_testimonial", { testimonial_id: id, min_rating: 5 });
    }

    const body: SuccessResponse<any> = { data };
    return ok(body.data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return fail("Невалидни данни.", { status: 400, code: "VALIDATION_ERROR", details: { issues: err.issues } });
    }
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    return fail(formatErrorMessage(err), { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}


