import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const FeatureUpdateSchema = z.object({
  name_bg: z.string().min(1, "Българското име е задължително").max(100, "Българското име не може да бъде повече от 100 символа").optional(),
  name_en: z.string().optional(),
  category: z.enum(["interior", "exterior", "building", "location"], {
    errorMap: () => ({ message: "Невалидна категория" })
  }).optional(),
  icon: z.string().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const featureId = parseInt(params.id);
    if (isNaN(featureId)) {
      return NextResponse.json(
        { error: "Невалиден ID на характеристика" },
        { status: 400 }
      );
    }

    // Get feature by ID
    const { data: feature, error } = await supabase
      .from("property_features")
      .select("*")
      .eq("id", featureId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Характеристиката не е намерена" },
          { status: 404 }
        );
      }
      console.error("Feature fetch error:", error);
      return NextResponse.json(
        { error: "Грешка при зареждане на характеристика" },
        { status: 500 }
      );
    }

    return NextResponse.json({ feature });
  } catch (error) {
    console.error("Error fetching feature:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const featureId = parseInt(params.id);
    if (isNaN(featureId)) {
      return NextResponse.json(
        { error: "Невалиден ID на характеристика" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = FeatureUpdateSchema.safeParse(body);

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

    // Check if feature exists
    const { data: existingFeature, error: fetchError } = await supabase
      .from("property_features")
      .select("id")
      .eq("id", featureId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Характеристиката не е намерена" },
          { status: 404 }
        );
      }
      console.error("Feature fetch error:", fetchError);
      return NextResponse.json(
        { error: "Грешка при зареждане на характеристика" },
        { status: 500 }
      );
    }

    // Update feature
    const { data: feature, error: updateError } = await supabase
      .from("property_features")
      .update({
        ...(data.name_bg !== undefined && { name_bg: data.name_bg }),
        ...(data.name_en !== undefined && { name_en: data.name_en || null }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.icon !== undefined && { icon: data.icon || null }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
      })
      .eq("id", featureId)
      .select()
      .single();

    if (updateError) {
      console.error("Feature update error:", updateError);
      return NextResponse.json(
        { error: "Грешка при обновяване на характеристика" },
        { status: 500 }
      );
    }

    return NextResponse.json({ feature });
  } catch (error) {
    console.error("Error updating feature:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const featureId = parseInt(params.id);
    if (isNaN(featureId)) {
      return NextResponse.json(
        { error: "Невалиден ID на характеристика" },
        { status: 400 }
      );
    }

    // Check if feature exists
    const { data: existingFeature, error: fetchError } = await supabase
      .from("property_features")
      .select("id")
      .eq("id", featureId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Характеристиката не е намерена" },
          { status: 404 }
        );
      }
      console.error("Feature fetch error:", fetchError);
      return NextResponse.json(
        { error: "Грешка при зареждане на характеристика" },
        { status: 500 }
      );
    }

    // Check if feature is used in any properties
    const { data: propertyFeatures, error: checkError } = await supabase
      .from("property_property_features")
      .select("property_id")
      .eq("feature_id", featureId)
      .limit(1);

    if (checkError) {
      console.error("Property features check error:", checkError);
      return NextResponse.json(
        { error: "Грешка при проверка на използване на характеристика" },
        { status: 500 }
      );
    }

    if (propertyFeatures && propertyFeatures.length > 0) {
      return NextResponse.json(
        { error: "Не можете да изтриете характеристика, която се използва в имоти" },
        { status: 400 }
      );
    }

    // Delete feature
    const { error: deleteError } = await supabase
      .from("property_features")
      .delete()
      .eq("id", featureId);

    if (deleteError) {
      console.error("Feature delete error:", deleteError);
      return NextResponse.json(
        { error: "Грешка при изтриване на характеристика" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Характеристиката е изтрита успешно" });
  } catch (error) {
    console.error("Error deleting feature:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}
