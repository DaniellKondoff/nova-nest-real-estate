import { NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";

export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      throw new AuthError("Неоторизиран достъп. Само администратори могат да задават основно изображение.");
    }

    const imageId = Number(params.id);
    if (!Number.isFinite(imageId) || imageId <= 0) {
      throw new ValidationError("Невалидно ID на изображение.");
    }

    const supabase = getSupabaseClient();
    const { data: image, error: imgErr } = await supabase
      .from("property_images")
      .select("id, property_id")
      .eq("id", imageId)
      .maybeSingle();
    if (imgErr) throw new DatabaseError("Неуспешно зареждане на изображение.");
    if (!image) {
      return Response.json({ error: "Изображението не е намерено." } satisfies ErrorResponse, { status: 404 });
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
    return Response.json(body, { status: 200 });
  } catch (err) {
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: formatErrorMessage(err) };
    return Response.json(body, { status });
  }
}


