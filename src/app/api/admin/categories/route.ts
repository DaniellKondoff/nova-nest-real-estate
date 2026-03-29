import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const CategorySchema = z.object({
  name_bg: z.string().min(1, "Българското име е задължително").max(50, "Българското име не може да бъде повече от 50 символа"),
  name_en: z.string().optional(),
  slug: z.string().min(1, "Slug е задължителен").regex(/^[a-z0-9-]+$/, "Slug може да съдържа само малки букви, цифри и тирета"),
  icon: z.string().optional(),
  is_active: z.boolean().default(true),
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

    // Get all categories
    const { data: categories, error } = await supabase
      .from("property_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Categories fetch error:", error);
      return NextResponse.json(
        { error: "Грешка при зареждане на категории" },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error("Error fetching categories:", error);
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
    const validationResult = CategorySchema.safeParse(body);

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
    const { data: existingCategory } = await supabase
      .from("property_categories")
      .select("id")
      .eq("slug", data.slug)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { error: "Категория с този slug вече съществува" },
        { status: 400 }
      );
    }

    // Insert category
    const { data: category, error: categoryError } = await supabase
      .from("property_categories")
      .insert({
        name_bg: data.name_bg,
        name_en: data.name_en || null,
        slug: data.slug,
        icon: data.icon || null,
        is_active: data.is_active,
      })
      .select()
      .single();

    if (categoryError) {
      console.error("Category insert error:", categoryError);
      return NextResponse.json(
        { error: "Грешка при създаване на категория" },
        { status: 500 }
      );
    }

    revalidateTag("categories");
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}
