import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const NeighborhoodUpdateSchema = z.object({
  name_bg: z.string().min(1, "Българското име е задължително").max(100, "Българското име не може да бъде повече от 100 символа").optional(),
  name_en: z.string().optional(),
  slug: z.string().min(1, "Slug е задължителен").regex(/^[a-z0-9-]+$/, "Slug може да съдържа само малки букви, цифри и тирета").optional(),
  description: z.string().optional(),
  center_lat: z.number().optional(),
  center_lng: z.number().optional(),
  amenities: z.any().optional(),
  transport_info: z.any().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
}).refine((data) => {
  // If one coordinate is provided, both must be provided
  if ((data.center_lat !== undefined) !== (data.center_lng !== undefined)) {
    return false;
  }
  return true;
}, {
  message: "Ако е предоставена една координата, трябва да бъдат предоставени и двете",
  path: ["center_lat", "center_lng"]
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    const { id } = await params;
    const neighborhoodId = parseInt(id);

    if (isNaN(neighborhoodId)) {
      return NextResponse.json(
        { error: "Невалиден ID на квартал" },
        { status: 400 }
      );
    }

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
    const validationResult = NeighborhoodUpdateSchema.safeParse(body);

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

    // Check if neighborhood exists
    const { data: existingNeighborhood, error: fetchError } = await supabase
      .from("neighborhoods")
      .select("id")
      .eq("id", neighborhoodId)
      .single();

    if (fetchError || !existingNeighborhood) {
      return NextResponse.json(
        { error: "Кварталът не е намерен" },
        { status: 404 }
      );
    }

    // Check if slug already exists (if slug is being updated)
    if (data.slug) {
      const { data: slugConflict } = await supabase
        .from("neighborhoods")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", neighborhoodId)
        .single();

      if (slugConflict) {
        return NextResponse.json(
          { error: "Квартал с този slug вече съществува" },
          { status: 400 }
        );
      }
    }

    // Update neighborhood
    const { data: neighborhood, error: updateError } = await supabase
      .from("neighborhoods")
      .update({
        ...(data.name_bg && { name_bg: data.name_bg }),
        ...(data.name_en !== undefined && { name_en: data.name_en || null }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.center_lat !== undefined && { center_lat: data.center_lat || null }),
        ...(data.center_lng !== undefined && { center_lng: data.center_lng || null }),
        ...(data.amenities !== undefined && { amenities: data.amenities || null }),
        ...(data.transport_info !== undefined && { transport_info: data.transport_info || null }),
        ...(data.seo_title !== undefined && { seo_title: data.seo_title || null }),
        ...(data.seo_description !== undefined && { seo_description: data.seo_description || null }),
        ...(data.seo_keywords !== undefined && { seo_keywords: data.seo_keywords || null }),
      })
      .eq("id", neighborhoodId)
      .select()
      .single();

    if (updateError) {
      console.error("Neighborhood update error:", updateError);
      return NextResponse.json(
        { error: "Грешка при обновяване на квартал" },
        { status: 500 }
      );
    }

    return NextResponse.json({ neighborhood });
  } catch (error) {
    console.error("Error updating neighborhood:", error);
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
    const { id } = await params;
    const neighborhoodId = parseInt(id);

    if (isNaN(neighborhoodId)) {
      return NextResponse.json(
        { error: "Невалиден ID на квартал" },
        { status: 400 }
      );
    }

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

    // Check if neighborhood exists
    const { data: existingNeighborhood, error: fetchError } = await supabase
      .from("neighborhoods")
      .select("id, name_bg")
      .eq("id", neighborhoodId)
      .single();

    if (fetchError || !existingNeighborhood) {
      return NextResponse.json(
        { error: "Кварталът не е намерен" },
        { status: 404 }
      );
    }

    // Check if neighborhood has properties
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id")
      .eq("neighborhood_id", neighborhoodId)
      .limit(1);

    if (propertiesError) {
      console.error("Properties check error:", propertiesError);
      return NextResponse.json(
        { error: "Грешка при проверка на имоти" },
        { status: 500 }
      );
    }

    if (properties && properties.length > 0) {
      return NextResponse.json(
        { error: "Не можете да изтриете квартал, който има свързани имоти" },
        { status: 400 }
      );
    }

    // Delete neighborhood
    const { error: deleteError } = await supabase
      .from("neighborhoods")
      .delete()
      .eq("id", neighborhoodId);

    if (deleteError) {
      console.error("Neighborhood delete error:", deleteError);
      return NextResponse.json(
        { error: "Грешка при изтриване на квартал" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Кварталът е изтрит успешно" });
  } catch (error) {
    console.error("Error deleting neighborhood:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}
