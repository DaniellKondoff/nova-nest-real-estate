import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import {
  linkNeighborhoodToContact,
  unlinkNeighborhoodFromContact,
} from "@/lib/queries/crm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });
    }

    const { id: contactId } = await params;
    const body = await request.json();

    if (typeof body.neighborhood_id !== "number") {
      return NextResponse.json(
        { error: "Полето 'neighborhood_id' е задължително и трябва да е число" },
        { status: 400 }
      );
    }

    await linkNeighborhoodToContact(contactId, body.neighborhood_id);

    return NextResponse.json({ message: "Кварталът е свързан успешно" });
  } catch (error) {
    console.error("POST /api/admin/crm/contacts/[id]/neighborhoods error:", error);
    return NextResponse.json(
      { error: "Грешка при свързване на квартала" },
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: "Нямате администраторски права" }, { status: 403 });
    }

    const { id: contactId } = await params;
    const body = await request.json();

    if (typeof body.neighborhood_id !== "number") {
      return NextResponse.json(
        { error: "Полето 'neighborhood_id' е задължително и трябва да е число" },
        { status: 400 }
      );
    }

    await unlinkNeighborhoodFromContact(contactId, body.neighborhood_id);

    return NextResponse.json({ message: "Кварталът е премахнат успешно" });
  } catch (error) {
    console.error("DELETE /api/admin/crm/contacts/[id]/neighborhoods error:", error);
    return NextResponse.json(
      { error: "Грешка при премахване на квартала" },
      { status: 500 }
    );
  }
}
