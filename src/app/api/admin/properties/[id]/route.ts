import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import { AdminPropertySchema } from "@/lib/validations";
import { syncPropertyEmbedding } from "@/lib/embeddings/sync";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Невалиден ID на имот" },
        { status: 400 }
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

    // Update property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .update({
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
      })
      .eq("id", propertyId)
      .select()
      .single();

    if (propertyError) {
      console.error("Property update error:", propertyError);
      return NextResponse.json(
        { error: "Грешка при обновяване на имот" },
        { status: 500 }
      );
    }

    // Update property features if provided
    if (body.features !== undefined) {
      // Delete existing features
      await supabase
        .from("property_property_features")
        .delete()
        .eq("property_id", propertyId);

      // Insert new features if any
      if (Array.isArray(body.features) && body.features.length > 0) {
        const featureRecords = body.features.map((featureId: number) => ({
          property_id: propertyId,
          feature_id: featureId,
        }));

        await supabase.from("property_property_features").insert(featureRecords);
      }
    }

    // Purge the ISR cache for this property page
    revalidatePath(`/properties/${propertyId}`);

    try {
      await syncPropertyEmbedding(propertyId);
    } catch (err) {
      console.error(`Failed to sync embedding for property ${propertyId}:`, err);
    }

    return NextResponse.json({ property }, { status: 200 });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Невалиден ID на имот" },
        { status: 400 }
      );
    }

    // Check if property exists
    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .single();

    if (fetchError || !property) {
      return NextResponse.json(
        { error: "Имотът не е намерен" },
        { status: 404 }
      );
    }

    // Soft delete: update status to archived
    // This preserves data and allows for potential recovery
    const { error: updateError } = await supabase
      .from("properties")
      .update({ status: "archived" })
      .eq("id", propertyId);

    if (updateError) {
      console.error("Property delete error:", updateError);
      return NextResponse.json(
        { error: "Грешка при изтриване на имот" },
        { status: 500 }
      );
    }

    // Note: Images are not deleted from storage in soft delete
    // They remain accessible in case of recovery
    // For hard delete, you would need to:
    // 1. Fetch all property images
    // 2. Delete from storage bucket
    // 3. Delete from property_images table
    // 4. Delete from properties table

    // Purge the ISR cache for this property page
    revalidatePath(`/properties/${propertyId}`);

    return NextResponse.json(
      { message: "Имотът е архивиран успешно" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

