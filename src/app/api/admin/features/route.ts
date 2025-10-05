import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const FeatureSchema = z.object({
  name_bg: z.string().min(1, "Българското име е задължително").max(100, "Българското име не може да бъде повече от 100 символа"),
  name_en: z.string().optional(),
  category: z.enum(["interior", "exterior", "building", "location", "buildingType"], {
    message: "Невалидна категория"
  }),
  icon: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Неоторизиран достъп" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json(
        { error: "Нямате администраторски права" },
        { status: 403 }
      );
    }

    // Get all features
    const { data: features, error } = await supabase
      .from("property_features")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Features fetch error:", error);
      return NextResponse.json(
        { error: "Грешка при зареждане на характеристики" },
        { status: 500 }
      );
    }

    return NextResponse.json({ features: features || [] });
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Неоторизиран достъп" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json(
        { error: "Нямате администраторски права" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = FeatureSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Невалидни данни", 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Insert feature
    const { data: feature, error: featureError } = await supabase
      .from("property_features")
      .insert({
        name_bg: data.name_bg,
        name_en: data.name_en || null,
        category: data.category,
        icon: data.icon || null,
        is_active: data.is_active,
        sort_order: data.sort_order,
      })
      .select()
      .single();

    if (featureError) {
      console.error("Feature insert error:", featureError);
      return NextResponse.json(
        { error: "Грешка при създаване на характеристика" },
        { status: 500 }
      );
    }

    return NextResponse.json({ feature }, { status: 201 });
  } catch (error) {
    console.error("Error creating feature:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}
