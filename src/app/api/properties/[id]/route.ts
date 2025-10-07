import { NextRequest } from "next/server";
import type { Tables } from "@/types/database.generated";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { getSupabaseClient } from "@/lib/supabase";
import { getPropertyById } from "@/lib/queries/properties";
import { isAdminUserServer } from "@/lib/auth-server";
import { AdminPropertySchema } from "@/lib/validations";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import { ok, fail, notFound, unauthorized } from "@/lib/api";

type PropertyRow = Tables<"properties">;
type NeighborhoodRow = Tables<"neighborhoods">;
type CategoryRow = Tables<"property_categories">;
type ImageRow = Tables<"property_images">;

/**
 * Get property details by ID, enriched with category and neighborhood
 *
 * Authentication: not required
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const idNum = Number(idParam);
    if (!Number.isFinite(idNum)) {
      throw new ValidationError("Невалидно ID.");
    }

    const property = await getPropertyById(idNum);
    if (!property) {
      return notFound("Имотът не е намерен.");
    }

    // Fetch category and neighborhood
    const supabase = await getSupabaseClient();
    const categoryId = (property as any)?.category_id as number | undefined;
    const neighborhoodId = (property as any)?.neighborhood_id as number | undefined;
    
    let category: Pick<CategoryRow, "id" | "name_bg" | "slug"> | null = null;
    if (typeof categoryId === "number") {
      const { data: cat } = await supabase
        .from("property_categories")
        .select("id,name_bg,slug")
        .eq("id", categoryId)
        .maybeSingle();
      category = (cat as any) ?? null;
    }

    let neighborhood: Pick<NeighborhoodRow, "id" | "name_bg" | "slug"> | null = null;
    if (typeof neighborhoodId === "number") {
      const { data: neigh } = await supabase
        .from("neighborhoods")
        .select("id,name_bg,slug")
        .eq("id", neighborhoodId)
        .maybeSingle();
      neighborhood = (neigh as any) ?? null;
    }

    const body: SuccessResponse<{
      property: PropertyRow;
      neighborhood: Pick<NeighborhoodRow, "id" | "name_bg" | "slug"> | null;
      category: Pick<CategoryRow, "id" | "name_bg" | "slug"> | null;
      images: ImageRow[];
    }> = {
      data: {
        property: property as unknown as PropertyRow,
        neighborhood,
        category,
        images: (property.images as any) ?? [],
      },
    };
    return ok(body.data);
  } catch (err) {
    const message = formatErrorMessage(err);
    const body: ErrorResponse = { error: message };
    return fail(body.error, { status: err instanceof ValidationError ? 400 : 500 });
  }
}

/**
 * Update a property by ID (admin only)
 *
 * Authentication: admin required
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUserServer();
    if (!isAdmin) {
      return unauthorized("Неоторизиран достъп. Само администратори могат да редактират имоти.");
    }

    const { id: idParam } = await params;
    const idNum = Number(idParam);
    if (!Number.isFinite(idNum)) {
      throw new ValidationError("Невалидно ID.");
    }

    const payload = await req.json();
    const parsed = await AdminPropertySchema.partial().parseAsync(payload);

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("properties")
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq("id", idNum)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new DatabaseError("Неуспешно обновяване на имот.");
    }

    if (!data) {
      return Response.json({ error: "Имотът не е намерен." } satisfies ErrorResponse, { status: 404 });
    }

    const body: SuccessResponse<PropertyRow> = { data: data as PropertyRow };
    return ok(body.data);
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : err instanceof AuthError ? 401 : 500;
    const body: ErrorResponse = { error: message };
    return fail(body.error, { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}

/**
 * Delete a property by ID (admin only)
 *
 * Authentication: admin required
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await isAdminUserServer();
    if (!isAdmin) {
      return unauthorized("Неоторизиран достъп. Само администратори могат да изтриват имоти.");
    }

    const { id: idParam } = await params;
    const idNum = Number(idParam);
    if (!Number.isFinite(idNum)) {
      throw new ValidationError("Невалидно ID.");
    }

    const supabase = await getSupabaseClient();
    const { error, count } = await supabase
      .from("properties")
      .delete({ count: "exact" })
      .eq("id", idNum);

    if (error) {
      throw new DatabaseError("Неуспешно изтриване на имот.");
    }

    if (!count) {
      return notFound("Имотът не е намерен.");
    }

    return ok(true);
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : err instanceof AuthError ? 401 : 500;
    const body: ErrorResponse = { error: message };
    return fail(body.error, { status, code: status === 401 ? "UNAUTHORIZED" : status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}


