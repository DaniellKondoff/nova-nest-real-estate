import type { Database } from "@/types/database.generated";
import { getBrowserClient } from "@/lib/supabase/client";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

type CategoryRow = Database["public"]["Tables"]["property_categories"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

export async function getAllPropertyCategories(): Promise<CategoryRow[]> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase
    .from("property_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error("Неуспешно зареждане на типове имоти.");
  return data ?? [];
}

export async function getPropertiesByCategory(categoryId: number): Promise<PropertyRow[]> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", "available");
  if (error) throw new Error("Неуспешно зареждане на имоти по категория.");
  return data ?? [];
}

function getCategoriesStaticClient() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const getCachedPropertyCategories = unstable_cache(
  async (): Promise<CategoryRow[]> => {
    const supabase = getCategoriesStaticClient();
    const { data, error } = await supabase
      .from("property_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Неуспешно зареждане на типове имоти.");
    return data ?? [];
  },
  ["all-property-categories"],
  { tags: ["categories"] }
);


