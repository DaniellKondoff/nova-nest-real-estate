import { NextRequest } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail, notFound, unauthorized } from "@/lib/api";

const UpdateSchema = z.object({
  status: z
    .enum(["new", "in_progress", "responded", "closed"]) 
    .optional(),
  assign_to: z.string().uuid().optional(),
  admin_notes: z.string().max(2000).optional(),
});

/**
 * Retrieve a single inquiry by ID for admin
 *
 * Authentication: admin required
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) throw new ValidationError("Невалидно ID на запитване.");

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*, property:properties(*), assigned:admin_profiles(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new DatabaseError("Неуспешно зареждане на запитване.");
    if (!data) return notFound("Запитването не е намерено.");

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
 * Update inquiry status, assignment and admin notes
 *
 * Authentication: admin required
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) return unauthorized("Неоторизиран достъп.");

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) throw new ValidationError("Невалидно ID на запитване.");

    const payload = await req.json();
    const parsed = await UpdateSchema.parseAsync(payload);

    const supabase = await getSupabaseClient();

    // Assign if requested
    if (parsed.assign_to) {
      const { error: rpcErr } = await supabase.rpc("assign_inquiry_to_agent", {
        agent_id: parsed.assign_to,
        inquiry_id: id,
      });
      if (rpcErr) throw new DatabaseError("Неуспешно назначаване на агент.");
    }

    let respondedAt: string | null = null;
    if (parsed.status === "responded") {
      respondedAt = new Date().toISOString();
    }

    const updateFields: Record<string, unknown> = {};
    if (parsed.status) updateFields.status = parsed.status;
    if (parsed.admin_notes !== undefined) updateFields.admin_notes = parsed.admin_notes;
    if (respondedAt) updateFields.responded_at = respondedAt;
    updateFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("inquiries")
      .update(updateFields)
      .eq("id", id)
      .select("id,status,assigned_to,responded_at,admin_notes")
      .maybeSingle();
    if (error) throw new DatabaseError("Неуспешно обновяване на запитване.");
    if (!data) return notFound("Запитването не е намерено.");

    const body: SuccessResponse<typeof data> = { data: data as any };
    return ok(body.data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return fail("Невалидни данни.", { status: 400, code: "VALIDATION_ERROR", details: { issues: err.issues } });
    }
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    return fail(formatErrorMessage(err), { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}


