import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const NeighborhoodSchema = z.object({
  name_bg: z.string().min(1, "Българското име е задължително").max(100, "Българското име не може да бъде повече от 100 символа"),
  name_en: z.string().optional(),
  slug: z.string().min(1, "Slug е задължителен").regex(/^[a-z0-9-]+$/, "Slug може да съдържа само малки букви, цифри и тирета"),
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

    // Get all neighborhoods
    const { data: neighborhoods, error } = await supabase
      .from("neighborhoods")
      .select("*")
      .order("name_bg", { ascending: true });

    if (error) {
      console.error("Neighborhoods fetch error:", error);
      return NextResponse.json(
        { error: "Грешка при зареждане на квартали" },
        { status: 500 }
      );
    }

    return NextResponse.json({ neighborhoods: neighborhoods || [] });
  } catch (error) {
    console.error("Error fetching neighborhoods:", error);
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
    const validationResult = NeighborhoodSchema.safeParse(body);

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

    // Check if slug already exists
    const { data: existingNeighborhood } = await supabase
      .from("neighborhoods")
      .select("id")
      .eq("slug", data.slug)
      .single();

    if (existingNeighborhood) {
      return NextResponse.json(
        { error: "Квартал с този slug вече съществува" },
        { status: 400 }
      );
    }

    // Insert neighborhood
    const { data: neighborhood, error: neighborhoodError } = await supabase
      .from("neighborhoods")
      .insert({
        name_bg: data.name_bg,
        name_en: data.name_en || null,
        slug: data.slug,
        description: data.description || null,
        center_lat: data.center_lat || null,
        center_lng: data.center_lng || null,
        amenities: data.amenities || null,
        transport_info: data.transport_info || null,
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
        seo_keywords: data.seo_keywords || null,
      })
      .select()
      .single();

    if (neighborhoodError) {
      console.error("Neighborhood insert error:", neighborhoodError);
      return NextResponse.json(
        { error: "Грешка при създаване на квартал" },
        { status: 500 }
      );
    }

    return NextResponse.json({ neighborhood }, { status: 201 });
  } catch (error) {
    console.error("Error creating neighborhood:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}
