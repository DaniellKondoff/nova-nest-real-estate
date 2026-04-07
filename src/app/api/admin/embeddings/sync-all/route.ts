import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";
import { syncAllPropertyEmbeddings, syncAllNeighborhoodEmbeddings } from "@/lib/embeddings/sync";

export async function POST() {
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

    const [properties, neighborhoods] = await Promise.all([
      syncAllPropertyEmbeddings(),
      syncAllNeighborhoodEmbeddings(),
    ]);

    return NextResponse.json({ properties, neighborhoods }, { status: 200 });
  } catch (error) {
    console.error("Error in sync-all embeddings:", error);
    return NextResponse.json({ error: "Вътрешна грешка на сървъра" }, { status: 500 });
  }
}
