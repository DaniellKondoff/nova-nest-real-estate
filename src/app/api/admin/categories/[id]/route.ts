import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const CategoryUpdateSchema = z.object({
  name_bg: z.string().min(1, "Българското име е задължително").max(50, "Българското име не може да бъде повече от 50 символа").optional(),
  name_en: z.string().optional(),
  slug: z.string().min(1, "Slug е задължителен").regex(/^[a-z0-9-]+$/, "Slug може да съдържа само малки букви, цифри и тирета").optional(),
  icon: z.string().optional(),
  is_active: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getServerClient();
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Невалиден ID на категория" },
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
    const validationResult = CategoryUpdateSchema.safeParse(body);

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

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from("property_categories")
      .select("id")
      .eq("id", categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: "Категорията не е намерена" },
        { status: 404 }
      );
    }

    // Check if slug already exists (if slug is being updated)
    if (data.slug) {
      const { data: slugConflict } = await supabase
        .from("property_categories")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", categoryId)
        .single();

      if (slugConflict) {
        return NextResponse.json(
          { error: "Категория с този slug вече съществува" },
          { status: 400 }
        );
      }
    }

    // Update category
    const { data: category, error: updateError } = await supabase
      .from("property_categories")
      .update({
        ...(data.name_bg && { name_bg: data.name_bg }),
        ...(data.name_en !== undefined && { name_en: data.name_en || null }),
        ...(data.slug && { slug: data.slug }),
        ...(data.icon !== undefined && { icon: data.icon || null }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (updateError) {
      console.error("Category update error:", updateError);
      return NextResponse.json(
        { error: "Грешка при обновяване на категория" },
        { status: 500 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
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
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Невалиден ID на категория" },
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

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from("property_categories")
      .select("id, name_bg")
      .eq("id", categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: "Категорията не е намерена" },
        { status: 404 }
      );
    }

    // Check if category has properties
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id")
      .eq("category_id", categoryId)
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
        { error: "Не можете да изтриете категория, която има свързани имоти" },
        { status: 400 }
      );
    }

    // Delete category
    const { error: deleteError } = await supabase
      .from("property_categories")
      .delete()
      .eq("id", categoryId);

    if (deleteError) {
      console.error("Category delete error:", deleteError);
      return NextResponse.json(
        { error: "Грешка при изтриване на категория" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Категорията е изтрита успешно" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}
