import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { AdminPropertySchema } from "@/lib/validations";
import { syncPropertyEmbedding } from "@/lib/embeddings/sync";

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
    const validationResult = AdminPropertySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Невалидни данни", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Insert property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        title_bg: data.title_bg,
        title_en: (body as any).title_en || null,
        description_bg: data.description_bg,
        description_en: (body as any).description_en || null,
        address_bg: data.address_bg,
        price_eur: data.price_eur,
        price_bgn: data.price_bgn,
        operation_type: data.operation_type,
        status: data.status,
        category_id: data.category_id,
        neighborhood_id: data.neighborhood_id,
        area_sqm: data.area_sqm,
        rooms: data.rooms,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        floor: data.floor,
        total_floors: (body as any).total_floors || null,
        year_built: data.year_built,
        latitude: data.latitude,
        longitude: data.longitude,
        created_by: user.id,
      })
      .select()
      .single();

    if (propertyError) {
      console.error("Property insert error:", propertyError);
      return NextResponse.json(
        { error: "Грешка при създаване на имот" },
        { status: 500 }
      );
    }

    // Insert property features if provided
    if (body.features && Array.isArray(body.features) && body.features.length > 0) {
      const featureRecords = body.features.map((featureId: number) => ({
        property_id: property.id,
        feature_id: featureId,
      }));

      const { error: featuresError } = await supabase
        .from("property_property_features")
        .insert(featureRecords);

      if (featuresError) {
        console.error("Features insert error:", featuresError);
        // Don't fail the request, just log the error
      }
    }

    // Sync embedding in the background — must not block the create response
    syncPropertyEmbedding(property.id).catch((err) =>
      console.error(`Failed to sync embedding for property ${property.id}:`, err)
    );

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

