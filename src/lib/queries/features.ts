import type { Database } from "@/types/database.generated";
import { getBrowserClient } from "@/lib/supabase/client";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

type PropertyFeature = Database["public"]["Tables"]["property_features"]["Row"];

export async function getAllPropertyFeatures(): Promise<PropertyFeature[]> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase
    .from("property_features")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error("Неуспешно зареждане на характеристики.");
  return data ?? [];
}

export interface FeatureOption {
  id: number;
  name_bg: string;
  category: string;
}

/** Lean, cached feature list for public filter UIs (server-side). */
export const getCachedFeatureOptions = unstable_cache(
  async (): Promise<FeatureOption[]> => {
    const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from("property_features")
      .select("id, name_bg, category")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Неуспешно зареждане на характеристики.");
    return (data ?? []) as FeatureOption[];
  },
  ["public-feature-options"],
  { tags: ["features"], revalidate: 3600 }
);
