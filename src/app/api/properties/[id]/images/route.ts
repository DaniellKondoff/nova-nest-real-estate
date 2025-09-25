import { NextRequest } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth";
import { uploadPropertyImage } from "@/lib/storage";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { Database } from "@/types/database.generated";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { ok, fail, notFound, unauthorized } from "@/lib/api";

const MaxFiles = 12;

const FormSchema = z.object({
  files: z
    .array(
      z.custom<File>((v) => v instanceof File)
    )
    .min(1)
    .max(MaxFiles),
  alt_text_bg: z.string().trim().min(0).optional(),
});

/**
 * Upload one or more images for a property (admin)
 *
 * Authentication: admin required
 * Upload constraints: max 12 files. TODO: enforce content-type and max size on edge.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      return unauthorized("Неоторизиран достъп. Само администратори могат да качват снимки.");
    }

    const propertyId = Number(params.id);
    if (!Number.isFinite(propertyId) || propertyId <= 0) {
      throw new ValidationError("Невалидно ID на имот.");
    }

    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    const altTextBg = (formData.get("alt_text_bg") as string) || undefined;

    const parsed = await FormSchema.parseAsync({ files, alt_text_bg: altTextBg });

    const supabase = getSupabaseClient();

    // Check if property exists
    const { data: prop, error: propErr } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .maybeSingle();
    if (propErr) throw new DatabaseError("Проблем при проверка на имота.");
    if (!prop) {
      return notFound("Имотът не е намерен.");
    }

    // Existing images to determine primary/order
    const { data: existingImages, error: imgErr } = await supabase
      .from("property_images")
      .select("id,is_primary,sort_order")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });
    if (imgErr) throw new DatabaseError("Проблем при зареждане на снимки.");

    const hasPrimary = (existingImages ?? []).some((i: any) => i.is_primary);
    let sortBase = ((existingImages ?? []).at(-1)?.sort_order as number | undefined) ?? -1;

    const uploaded: Array<Database["public"]["Tables"]["property_images"]["Row"]> = [];

    for (let i = 0; i < parsed.files.length; i++) {
      const file = parsed.files[i];
      const upload = await uploadPropertyImage(propertyId, file);

      sortBase += 1;
      const isPrimary = !hasPrimary && i === 0; // make first uploaded primary if none exists

      const { data, error } = await supabase
        .from("property_images")
        .insert({
          property_id: propertyId,
          url: upload.url,
          filename: (file as any)?.name ?? null,
          file_size: (file as any)?.size ?? null,
          width: null,
          height: null,
          sort_order: sortBase,
          is_primary: isPrimary,
          alt_text_bg: altTextBg ?? null,
        })
        .select("*")
        .single();
      if (error) {
        throw new DatabaseError("Неуспешно записване на метаданни за изображението.");
      }
      uploaded.push(data as any);
    }

    const body: SuccessResponse<{ images: typeof uploaded }> = {
      data: { images: uploaded },
    };
    return ok(body.data, { status: 201 });
  } catch (err) {
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: formatErrorMessage(err) };
    return fail(body.error, { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}


