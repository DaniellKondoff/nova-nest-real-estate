import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import type { Database } from "@/types/database.generated";
import { ContactInquirySchema } from "@/lib/validations";

const InquiryCreateSchema = ContactInquirySchema.extend({
  inquiryType: z.enum(["general", "property_interest", "viewing_request", "valuation", "selling", "renting"]),
  subject: z.string().min(3).max(200).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const parsed = await InquiryCreateSchema.parseAsync(payload);

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("inquiries")
      .insert({
        full_name: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone,
        message: parsed.message,
        property_id: parsed.propertyId ?? null,
        inquiry_type: parsed.inquiryType as Database["public"]["Enums"]["inquiry_type"],
        status: "new" as Database["public"]["Enums"]["inquiry_status"],
        subject: (payload?.subject as string | undefined) ?? null,
        utm_source: parsed.utm_source ?? null,
        utm_medium: parsed.utm_medium ?? null,
        utm_campaign: parsed.utm_campaign ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    if (error) {
      throw new DatabaseError("Неуспешно изпращане на запитване. Опитайте отново.");
    }

    const body: SuccessResponse<{ success: true }> = { data: { success: true } };
    return Response.json(body, { status: 201 });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: formatErrorMessage(err) };
    return Response.json(body, { status });
  }
}


