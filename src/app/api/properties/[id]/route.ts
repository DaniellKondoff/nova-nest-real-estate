import { NextRequest } from "next/server";
import type { Tables } from "@/types/database.generated";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { getSupabaseClient } from "@/lib/supabase";
import { getPropertyById } from "@/lib/queries/properties";
import { isAdminUser } from "@/lib/auth";
import { AdminPropertySchema } from "@/lib/validations";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";

type PropertyRow = Tables<"properties">;
type NeighborhoodRow = Tables<"neighborhoods">;
type CategoryRow = Tables<"property_categories">;
type ImageRow = Tables<"property_images">;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) {
      throw new ValidationError("Невалидно ID.");
    }

    const property = await getPropertyById(idNum);
    if (!property) {
      return Response.json({ error: "Имотът не е намерен." } satisfies ErrorResponse, { status: 404 });
    }

    // Fetch category
    const supabase = getSupabaseClient();
    const categoryId = (property as any)?.category_id as number | undefined;
    let category: Pick<CategoryRow, "id" | "name_bg" | "slug"> | null = null;
    if (typeof categoryId === "number") {
      const { data: cat } = await supabase
        .from("property_categories")
        .select("id,name_bg,slug")
        .eq("id", categoryId)
        .maybeSingle();
      category = (cat as any) ?? null;
    }

    const body: SuccessResponse<{
      property: PropertyRow;
      neighborhood: Pick<NeighborhoodRow, "id" | "name_bg" | "slug"> | null;
      category: Pick<CategoryRow, "id" | "name_bg" | "slug"> | null;
      images: ImageRow[];
    }> = {
      data: {
        property: property as unknown as PropertyRow,
        neighborhood: (property.neighborhood as any) ?? null,
        category,
        images: (property.images as any) ?? [],
      },
    };
    return Response.json(body, { status: 200 });
  } catch (err) {
    const message = formatErrorMessage(err);
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status: err instanceof ValidationError ? 400 : 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      throw new AuthError("Неоторизиран достъп. Само администратори могат да редактират имоти.");
    }

    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) {
      throw new ValidationError("Невалидно ID.");
    }

    const payload = await req.json();
    const parsed = await AdminPropertySchema.partial().parseAsync(payload);

    const supabase = getSupabaseClient();
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
    return Response.json(body, { status: 200 });
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : err instanceof AuthError ? 401 : 500;
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      throw new AuthError("Неоторизиран достъп. Само администратори могат да изтриват имоти.");
    }

    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) {
      throw new ValidationError("Невалидно ID.");
    }

    const supabase = getSupabaseClient();
    const { error, count } = await supabase
      .from("properties")
      .delete({ count: "exact" })
      .eq("id", idNum);

    if (error) {
      throw new DatabaseError("Неуспешно изтриване на имот.");
    }

    if (!count) {
      return Response.json({ error: "Имотът не е намерен." } satisfies ErrorResponse, { status: 404 });
    }

    return Response.json({ data: true } satisfies SuccessResponse<boolean>, { status: 200 });
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : err instanceof AuthError ? 401 : 500;
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status });
  }
}


