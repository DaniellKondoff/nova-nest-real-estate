import { NextRequest } from "next/server";
import { z } from "zod";
import { getAllPropertyCategories } from "@/lib/queries/categories";
import { formatErrorMessage, ValidationError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";

const QuerySchema = z.object({
  is_active: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true")
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = await QuerySchema.parseAsync(raw);

    let categories = await getAllPropertyCategories();
    if (typeof parsed.is_active === "boolean") {
      categories = categories.filter((c: any) => c.is_active === parsed.is_active);
    }

    // Ensure response includes both BG and EN names with icons if present in table
    const mapped = categories.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name_bg: c.name_bg,
      name_en: c.name_en ?? c.slug,
      icon: c.icon ?? null,
      is_active: c.is_active,
      sort_order: c.sort_order ?? 0,
    }));

    const body: SuccessResponse<{ categories: typeof mapped }> = {
      data: { categories: mapped },
    };
    return Response.json(body, { status: 200 });
  } catch (err) {
    const message = formatErrorMessage(err);
    const status = err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status });
  }
}


