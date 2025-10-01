import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

interface ImageRecord {
  property_id: number;
  url: string;
  alt_text_bg?: string | null;
  is_primary: boolean;
  sort_order: number;
}

export async function POST(
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

    // Parse request body
    const body = await request.json();
    const { images } = body;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Моля предоставете снимки" },
        { status: 400 }
      );
    }

    // Verify property exists and belongs to the admin or admin has access
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Имотът не е намерен" },
        { status: 404 }
      );
    }

    // Insert images
    const imageRecords: ImageRecord[] = images.map((img: ImageRecord) => ({
      property_id: propertyId,
      url: img.url,
      alt_text_bg: img.alt_text_bg || null,
      is_primary: img.is_primary || false,
      sort_order: img.sort_order || 0,
    }));

    const { data: insertedImages, error: insertError } = await supabase
      .from("property_images")
      .insert(imageRecords)
      .select();

    if (insertError) {
      console.error("Images insert error:", insertError);
      return NextResponse.json(
        { error: "Грешка при запазване на снимките" },
        { status: 500 }
      );
    }

    return NextResponse.json({ images: insertedImages }, { status: 201 });
  } catch (error) {
    console.error("Error saving images:", error);
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
    const body = await request.json();
    const { imageIds } = body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "Моля предоставете ID на снимки за изтриване" },
        { status: 400 }
      );
    }

    // Delete images
    const { error: deleteError } = await supabase
      .from("property_images")
      .delete()
      .in("id", imageIds);

    if (deleteError) {
      console.error("Images delete error:", deleteError);
      return NextResponse.json(
        { error: "Грешка при изтриване на снимките" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting images:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

