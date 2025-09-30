import { NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { deletePropertyImage } from "@/lib/storage";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail, notFound, unauthorized } from "@/lib/api";

/**
 * Delete a property image by ID
 *
 * Authentication: admin required
 * Side-effects: attempts to remove the physical file; DB row is always removed if possible
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      return unauthorized("Неоторизиран достъп. Само администратори могат да изтриват снимки.");
    }

    const { id: idParam } = await params;
    const imageId = Number(idParam);
    if (!Number.isFinite(imageId) || imageId <= 0) {
      throw new ValidationError("Невалидно ID на изображение.");
    }

    const supabase = await getSupabaseClient();
    const { data: image, error: imgErr } = await supabase
      .from("property_images")
      .select("id, property_id, url, is_primary, sort_order")
      .eq("id", imageId)
      .maybeSingle();
    if (imgErr) throw new DatabaseError("Неуспешно зареждане на изображение.");
    if (!image) {
      return notFound("Изображението не е намерено.");
    }

    // Delete from storage: derive path from URL by splitting after bucket public URL
    // If URLs are public, we may not have direct path; for simplicity, store full URL and cannot infer path reliably.
    // If path was stored elsewhere, adjust. Here we attempt remove by using the URL path after bucket name.
    try {
      const url = new URL(image.url);
      const idx = url.pathname.indexOf("/property-images/");
      if (idx >= 0) {
        const imagePath = url.pathname.substring(idx + "/property-images/".length);
        await deletePropertyImage(imagePath);
      }
    } catch {
      // if parsing fails, continue with DB delete to avoid orphan rows
    }

    const { error: delErr } = await supabase.from("property_images").delete().eq("id", imageId);
    if (delErr) throw new DatabaseError("Неуспешно изтриване на изображение от базата.");

    if ((image as any).is_primary) {
      // Auto-promote the next image by lowest sort_order
      const { data: nextImg } = await supabase
        .from("property_images")
        .select("id")
        .eq("property_id", (image as any).property_id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (nextImg) {
        await supabase.from("property_images").update({ is_primary: true }).eq("id", (nextImg as any).id);
      }
    }

    return ok(true);
  } catch (err) {
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: formatErrorMessage(err) };
    return fail(body.error, { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}


