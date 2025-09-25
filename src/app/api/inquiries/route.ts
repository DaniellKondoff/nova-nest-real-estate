import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { formatErrorMessage, ValidationError, DatabaseError } from "@/lib/errors";
import type { ErrorResponse, SuccessResponse } from "@/types/api";
import type { Database } from "@/types/database.generated";
import { ContactInquirySchema } from "@/lib/validations";
import { ok, fail } from "@/lib/api";

const InquiryCreateSchema = ContactInquirySchema.extend({
  inquiryType: z.enum(["general", "property_interest", "viewing_request", "valuation", "selling", "renting"]),
  subject: z.string().min(3).max(200).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    /**
     * Create a new public inquiry
     *
     * Authentication: not required
     * Rate limiting: TODO - add IP-based throttling to protect against abuse
     *
     * Request body example:
     * {
     *   "fullName": "Иван Иванов",
     *   "email": "ivan@example.com",
     *   "phone": "+359 88 123 4567",
     *   "message": "Интересувам се от имота.",
     *   "propertyId": 123,
     *   "inquiryType": "property_interest",
     *   "subject": "Запитване за оглед",
     *   "utm_source": "google",
     *   "utm_medium": "cpc",
     *   "utm_campaign": "brand"
     * }
     *
     * Success response example (201):
     * { "data": { "success": true } }
     *
     * Error response example (400):
     * { "error": "Невалидни данни.", "code": "VALIDATION_ERROR", "details": { "issues": [...] } }
     */
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
    return ok(body.data, { status: 201 });
  } catch (err) {
    // Surface Zod validation issues for AI-friendly debugging
    if (err instanceof z.ZodError) {
      return fail("Невалидни данни.", { status: 400, code: "VALIDATION_ERROR", details: { issues: err.issues } });
    }
    const status = err instanceof ValidationError ? 400 : 500;
    const body: ErrorResponse = { error: formatErrorMessage(err) };
    return fail(body.error, { status, code: status === 400 ? "VALIDATION_ERROR" : "SERVER_ERROR" });
  }
}


