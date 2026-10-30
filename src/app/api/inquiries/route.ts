import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database.generated";
import { ContactFormSchema } from "@/lib/validations";
import { env, getServerEnv } from "@/lib/env";
import { sendInquiryNotification } from "@/lib/email";
import { absoluteUrl } from "@/lib/seo/config";
import { propertyPath } from "@/lib/seo/property-slug";
import { displayTitle } from "@/lib/seo/property-metadata";

// Public inquiry payload: contact fields + optional context (which property / what kind of request)
const InquiryRequestSchema = ContactFormSchema.extend({
  property_id: z.number().int().positive().optional(),
  inquiry_type: z
    .enum(["general", "property_interest", "viewing_request", "valuation", "selling", "renting"])
    .optional(),
  // Anti-spam: honeypot (must stay empty) + when the form was rendered (ms since epoch)
  website: z.string().max(200).optional(),
  started_at: z.number().int().optional(),
});

/** Real visitors need a few seconds to fill the form; bots post instantly or fill the hidden field */
const MIN_FILL_MS = 3000;

const SUCCESS_BODY = { success: true, message: "Вашето запитване беше изпратено успешно!" };

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const data = await InquiryRequestSchema.parseAsync(payload);

    if (data.website || !data.started_at || Date.now() - data.started_at < MIN_FILL_MS) {
      // Same response as a real success so bots get no signal; nothing is stored or emailed
      console.warn("[inquiries] dropped as spam");
      return NextResponse.json(SUCCESS_BODY, { status: 201 });
    }

    const inquiryType = data.inquiry_type ?? (data.property_id ? "property_interest" : "general");

    // Use service role on the server to bypass RLS for safe server-only writes
    const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
    const supabase = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: inserted, error } = await supabase
      .from("inquiries")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone && data.phone.length > 0 ? data.phone : null,
        inquiry_type: inquiryType as Database["public"]["Enums"]["inquiry_type"],
        message: data.message,
        subject: null,
        property_id: data.property_id ?? null,
        status: "new" as Database["public"]["Enums"]["inquiry_status"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) {
      // Server-side log for debugging, but return friendly message to client
      console.error("Inquiries insert error:", error);
      return NextResponse.json(
        { success: false, error: "Възникна грешка при запазване. Моля, опитайте отново." },
        { status: 500 }
      );
    }

    // Sent after the response; after() keeps the serverless function alive until the email is out
    after(async () => {
      try {
        let property: { title: string; url: string } | null = null;
        if (data.property_id) {
          const { data: prop } = await supabase
            .from("properties")
            .select("id, slug, title_bg")
            .eq("id", data.property_id)
            .maybeSingle();
          if (prop) {
            property = { title: displayTitle(prop.title_bg), url: absoluteUrl(propertyPath(prop.id, prop.slug)) };
          }
        }
        await sendInquiryNotification({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          inquiryId: inserted.id,
          inquiryType,
          property,
        });
      } catch (err) {
        console.error("[Email] Failed to send inquiry notification:", err);
      }
    });

    return NextResponse.json(
      { ...SUCCESS_BODY, inquiryId: inserted?.id },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Невалидни данни" }, { status: 400 });
    }
    console.error("Inquiries route unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Възникна неочаквана грешка. Моля, опитайте отново." },
      { status: 500 }
    );
  }
}


