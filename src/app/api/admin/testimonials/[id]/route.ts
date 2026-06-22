import { NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { isAdminUserServer } from "@/lib/auth-server";
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
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUserServer();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) throw new ValidationError("Невалидно ID на отзив.");

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new DatabaseError("Неуспешно зареждане на отзив.");
    if (!data) return notFound("Отзивът не е намерен.");

    return ok(data);
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
 * Supports partial updates including approval status toggle
 *
 * Authentication: admin required
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUserServer();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) throw new ValidationError("Невалидно ID на отзив.");

    const payload = await req.json();
    const parsed = await UpdateSchema.parseAsync(payload);

    const supabase = await getSupabaseClient();

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
      const supa = await getSupabaseClient();
      await supa.rpc("auto_approve_testimonial", { testimonial_id: id, min_rating: 5 });
    }

    revalidateTag("testimonials");
    return ok(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return fail("Невалидни данни.", { status: 400, code: "VALIDATION_ERROR", details: { issues: err.issues } });
    }
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    return fail(formatErrorMessage(err), { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}

/**
 * Delete a testimonial by ID (admin)
 *
 * Authentication: admin required
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUserServer();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) throw new ValidationError("Невалидно ID на отзив.");

    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) throw new DatabaseError("Неуспешно изтриване на отзив.");

    revalidateTag("testimonials");
    return ok({ message: "Отзивът е изтрит успешно" });
  } catch (err) {
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    return fail(formatErrorMessage(err), { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}


