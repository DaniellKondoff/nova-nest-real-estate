import { NextRequest } from "next/server";
import type { Tables } from "@/types/database.generated";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import { getSupabaseClient } from "@/lib/supabase";
import { getPublishedProperties } from "@/lib/queries/properties";
import { isAdminUser, getCurrentUser } from "@/lib/auth";
import { AdminPropertySchema } from "@/lib/validations";
import { formatErrorMessage, ValidationError, AuthError, DatabaseError } from "@/lib/errors";

type PropertyRow = Tables<"properties">;

function parseNumber(value: string | null): number | undefined {
  if (value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams;

    const status = search.get("status") as Tables<"properties">["status"] | null;
    const categoryId = parseNumber(search.get("categoryId"));
    const neighborhoodId = parseNumber(search.get("neighborhoodId"));
    const minPrice = parseNumber(search.get("minPrice"));
    const maxPrice = parseNumber(search.get("maxPrice"));
    const limit = parseNumber(search.get("limit")) ?? 10;
    const offset = parseNumber(search.get("offset")) ?? 0;

    // Fetch published properties using shared query util
    const all = await getPublishedProperties();

    // In-memory filtering based on query params
    let filtered = all as PropertyRow[];
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (typeof categoryId === "number") {
      filtered = filtered.filter((p) => p.category_id === categoryId);
    }
    if (typeof neighborhoodId === "number") {
      filtered = filtered.filter((p) => p.neighborhood_id === neighborhoodId);
    }
    if (typeof minPrice === "number" || typeof maxPrice === "number") {
      filtered = filtered.filter((p) => {
        // Prefer EUR price when available; fallback to BGN when EUR missing
        const price = (p.price_eur ?? undefined) ?? (p.price_bgn ?? undefined);
        if (price == null) return false;
        if (typeof minPrice === "number" && price < minPrice) return false;
        if (typeof maxPrice === "number" && price > maxPrice) return false;
        return true;
      });
    }

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);

    const body: SuccessResponse<{ items: PropertyRow[]; meta: { total: number; limit: number; offset: number } }> = {
      data: { items, meta: { total, limit, offset } },
    };
    return Response.json(body, { status: 200 });
  } catch (err) {
    const message = formatErrorMessage(err);
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      throw new AuthError("Неоторизиран достъп. Само администратори могат да създават имоти.");
    }

    const json = await req.json();
    const parsed = await AdminPropertySchema.parseAsync(json);

    const user = await getCurrentUser();
    if (!user) {
      throw new AuthError("Неуспешно удостоверяване на потребителя.");
    }

    const supabase = getSupabaseClient();
    const insertPayload = {
      ...parsed,
      created_by: user.id,
    } as const;

    const { data, error } = await supabase
      .from("properties")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError("Неуспешно създаване на имот.");
    }

    const body: SuccessResponse<PropertyRow> = { data: data as PropertyRow };
    return Response.json(body, { status: 201 });
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : err instanceof AuthError ? 401 : 500;
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status });
  }
}


