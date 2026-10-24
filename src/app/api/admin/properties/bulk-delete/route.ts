import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { deletePropertyImagesByUrls } from "@/lib/storage";
import { revalidatePublicPages } from "@/lib/revalidate";

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

    // Parse request body
    const body = await request.json();
    const { propertyIds } = body;

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json(
        { error: "Моля предоставете ID на имоти за изтриване" },
        { status: 400 }
      );
    }

    // Convert string IDs to numbers
    const numericIds = propertyIds.map((id) => parseInt(id)).filter((id) => !isNaN(id));

    if (numericIds.length === 0) {
      return NextResponse.json(
        { error: "Невалидни ID на имоти" },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    const failedIds: number[] = [];

    // Hard delete: remove images from storage, then delete each property row
    // (cascades to property_images, property_property_features, property_embeddings,
    // crm_contact_properties; sets inquiries.property_id / testimonials.property_id to NULL)
    for (const propertyId of numericIds) {
      try {
        const { data: images, error: imagesError } = await supabase
          .from("property_images")
          .select("url")
          .eq("property_id", propertyId);

        if (imagesError) {
          console.error(`Failed to fetch images for property ${propertyId}:`, imagesError);
          failedIds.push(propertyId);
          continue;
        }

        try {
          await deletePropertyImagesByUrls((images ?? []).map((img) => img.url));
        } catch (storageError) {
          console.error(`Failed to delete storage images for property ${propertyId}:`, storageError);
          failedIds.push(propertyId);
          continue;
        }

        const { error: deleteError } = await supabase
          .from("properties")
          .delete()
          .eq("id", propertyId);

        if (deleteError) {
          console.error(`Failed to delete property ${propertyId}:`, deleteError);
          failedIds.push(propertyId);
        } else {
          deletedCount++;
        }
      } catch (err) {
        console.error(`Error processing property ${propertyId}:`, err);
        failedIds.push(propertyId);
      }
    }

    if (deletedCount > 0) revalidatePublicPages();

    // Return results
    if (failedIds.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: deletedCount,
        message: `Успешно изтрити ${deletedCount} имота`,
      });
    } else if (deletedCount > 0) {
      return NextResponse.json({
        success: true,
        deleted: deletedCount,
        failed: failedIds.length,
        message: `Изтрити ${deletedCount} от ${numericIds.length} имота`,
      });
    } else {
      return NextResponse.json(
        {
          error: "Грешка при изтриване на имотите",
          failed: failedIds.length,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error bulk deleting properties:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

