import { NextRequest } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, AuthError, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";

const QuerySchema = z.object({
  is_published: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true")
    .optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});

const CreateSchema = z.object({
  client_name: z.string().min(2),
  client_initial: z.string().max(5).optional(),
  client_role: z.string().max(120).optional(),
  content_bg: z.string().min(10),
  content_en: z.string().min(10).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  property_id: z.coerce.number().int().positive().optional(),
  service_type: z.string().max(120).optional(),
  review_date: z.coerce.date().optional(),
  is_published: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) throw new AuthError("Неоторизиран достъп.");

    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = await QuerySchema.parseAsync(raw);

    const supabase = getSupabaseClient();
    let query = supabase
      .from("testimonials")
      .select("*, property:properties(*)", { count: "exact" });

    if (typeof parsed.is_published === "boolean") query = query.eq("is_published", parsed.is_published);
    if (parsed.rating) query = query.gte("rating", parsed.rating);
    if (parsed.from) query = query.gte("review_date", parsed.from.toISOString());
    if (parsed.to) query = query.lte("review_date", parsed.to.toISOString());

    query = query.order("review_date", { ascending: parsed.sort === "oldest" });

    const start = (parsed.page - 1) * parsed.limit;
    const end = start + parsed.limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;
    if (error) throw new DatabaseError("Неуспешно зареждане на отзиви.");

    const body: SuccessResponse<{ items: any[]; total: number; page: number; limit: number }> = {
      data: { items: (data as any[]) ?? [], total: count ?? 0, page: parsed.page, limit: parsed.limit },
    };
    return Response.json(body, { status: 200 });
  } catch (err) {
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    return Response.json({ error: formatErrorMessage(err) } satisfies ErrorResponse, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminUser();
    if (!isAdmin) throw new AuthError("Неоторизиран достъп.");

    const payload = await req.json();
    const parsed = await CreateSchema.parseAsync(payload);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        client_name: parsed.client_name,
        client_initial: parsed.client_initial ?? null,
        client_role: parsed.client_role ?? null,
        content_bg: parsed.content_bg,
        content_en: parsed.content_en ?? null,
        rating: parsed.rating ?? null,
        property_id: parsed.property_id ?? null,
        service_type: parsed.service_type ?? null,
        review_date: (parsed.review_date ?? new Date()).toISOString(),
        is_published: parsed.is_published ?? false,
        is_featured: parsed.is_featured ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .maybeSingle();
    if (error) throw new DatabaseError("Неуспешно създаване на отзив.");

    // Auto-approve high ratings via RPC if provided
    if ((data as any)?.id && (parsed.rating ?? 0) >= 5) {
      await getSupabaseClient().rpc("auto_approve_testimonial", { testimonial_id: (data as any).id, min_rating: 5 });
    }

    const body: SuccessResponse<any> = { data: data as any };
    return Response.json(body, { status: 201 });
  } catch (err) {
    const status = err instanceof AuthError ? 401 : err instanceof ValidationError ? 400 : 500;
    return Response.json({ error: formatErrorMessage(err) } satisfies ErrorResponse, { status });
  }
}


