import { NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail, notFound, unauthorized } from "@/lib/api";

/**
 * Promote an image to primary for its property
 *
 * Authentication: admin required
 * Consistency: relies on DB constraint/trigger to keep a single primary
 */
export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      return unauthorized("Неоторизиран достъп. Само администратори могат да задават основно изображение.");
    }

    const { id: idParam } = await params;
    const imageId = Number(idParam);
    if (!Number.isFinite(imageId) || imageId <= 0) {
      throw new ValidationError("Невалидно ID на изображение.");
    }

    const supabase = await getSupabaseClient();
    const { data: image, error: imgErr } = await supabase
      .from("property_images")
      .select("id, property_id")
      .eq("id", imageId)
      .maybeSingle();
    if (imgErr) throw new DatabaseError("Неуспешно зареждане на изображение.");
    if (!image) {
      return notFound("Изображението не е намерено.");
    }

    // Rely on DB trigger/constraint to ensure only one primary per property
    const { error: updErr } = await supabase
      .from("property_images")
      .update({ is_primary: true })
      .eq("id", imageId);
    if (updErr) throw new DatabaseError("Неуспешно обновяване на изображение.");

    const { data: updated, error: refetchErr } = await supabase
      .from("property_images")
      .select("id, property_id, is_primary")
      .eq("id", imageId)
      .maybeSingle();
    if (refetchErr || !updated) throw new DatabaseError("Неуспешно извличане на обновено изображение.");

    const body: SuccessResponse<typeof updated> = { data: updated as any };
    return ok(body.data);
  } catch (err) {
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: formatErrorMessage(err) };
    return fail(body.error, { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}


