import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

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

    // Soft delete approach: update status to archived
    for (const propertyId of numericIds) {
      try {
        const { error: updateError } = await supabase
          .from("properties")
          .update({ status: "archived" })
          .eq("id", propertyId);

        if (updateError) {
          console.error(`Failed to archive property ${propertyId}:`, updateError);
          failedIds.push(propertyId);
        } else {
          deletedCount++;
        }
      } catch (err) {
        console.error(`Error processing property ${propertyId}:`, err);
        failedIds.push(propertyId);
      }
    }

    // Return results
    if (failedIds.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: deletedCount,
        message: `Успешно архивирани ${deletedCount} имота`,
      });
    } else if (deletedCount > 0) {
      return NextResponse.json({
        success: true,
        deleted: deletedCount,
        failed: failedIds.length,
        message: `Архивирани ${deletedCount} от ${numericIds.length} имота`,
      });
    } else {
      return NextResponse.json(
        {
          error: "Грешка при архивиране на имотите",
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

