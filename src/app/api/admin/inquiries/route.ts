import { NextRequest } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";

const QuerySchema = z.object({
  status: z
    .enum(["new", "in_progress", "responded", "closed"]) 
    .optional(),
  inquiry_type: z
    .enum(["general", "property_interest", "viewing_request", "valuation", "selling", "renting"]) 
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      throw new AuthError("Неоторизиран достъп.");
    }

    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = await QuerySchema.parseAsync(raw);

    const supabase = getSupabaseClient();

    // Base query
    let query = supabase
      .from("inquiries")
      .select("*, property:properties(*), assigned:admin_profiles(*)", { count: "exact" });

    if (parsed.status) query = query.eq("status", parsed.status);
    if (parsed.inquiry_type) query = query.eq("inquiry_type", parsed.inquiry_type);
    if (parsed.from) query = query.gte("created_at", parsed.from.toISOString());
    if (parsed.to) query = query.lte("created_at", parsed.to.toISOString());

    query = query.order("created_at", { ascending: parsed.sort === "oldest" });

    const start = (parsed.page - 1) * parsed.limit;
    const end = start + parsed.limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;
    if (error) throw new DatabaseError("Неуспешно зареждане на запитвания.");

    const body: SuccessResponse<{ items: any[]; total: number; page: number; limit: number }> = {
      data: {
        items: (data as any[]) ?? [],
        total: count ?? 0,
        page: parsed.page,
        limit: parsed.limit,
      },
    };
    return Response.json(body, { status: 200 });
  } catch (err) {
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: formatErrorMessage(err) };
    return Response.json(body, { status });
  }
}


