import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database.generated";
import { ContactFormSchema } from "@/lib/validations";
import { env, getServerEnv } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const data = await ContactFormSchema.parseAsync(payload);

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
        inquiry_type: "general" as Database["public"]["Enums"]["inquiry_type"],
        message: data.message,
        subject: null,
        property_id: null,
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

    return NextResponse.json(
      { success: true, message: "Вашето запитване беше изпратено успешно!", inquiryId: inserted?.id },
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


