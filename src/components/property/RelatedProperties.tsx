import React from "react";
import { unstable_cache } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.generated";
import type { PropertyWithDetails } from "@/types/property";
import PropertyCard from "@/components/property/PropertyCard";

interface RelatedPropertiesProps {
  currentPropertyId: number;
  categoryId: number;
  neighborhoodId: number;
}

async function fetchRelated(
  currentPropertyId: number,
  categoryId: number,
  neighborhoodId: number
): Promise<PropertyWithDetails[]> {
  const supabase = await getServerClient();

  // First try: same category + same neighborhood
  let { data } = await supabase
    .from("properties")
    .select(`
      *,
      images:property_images(id, url, is_primary, sort_order, alt_text_bg),
      neighborhood:neighborhoods(*),
      category:property_categories(*)
    `)
    .eq("category_id", categoryId)
    .eq("neighborhood_id", neighborhoodId)
    .eq("status", "available")
    .neq("id", currentPropertyId)
    .order("created_at", { ascending: false })
    .limit(3);

  // Fallback: same category only
  if (!data || data.length < 3) {
    const needed = 3 - (data?.length ?? 0);
    const existingIds = [currentPropertyId, ...(data ?? []).map((p) => p.id)];

    const { data: fallback } = await supabase
      .from("properties")
      .select(`
        *,
        images:property_images(id, url, is_primary, sort_order, alt_text_bg),
        neighborhood:neighborhoods(*),
        category:property_categories(*)
      `)
      .eq("category_id", categoryId)
      .eq("status", "available")
      .not("id", "in", `(${existingIds.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(needed);

    data = [...(data ?? []), ...(fallback ?? [])];
  }

  return (data ?? []).map((row) => ({
    property: row as unknown as Tables<"properties">,
    neighborhood: (row.neighborhood as Tables<"neighborhoods"> | null) ?? null,
    category: (row.category as Tables<"property_categories"> | null) ?? null,
    images: (row.images as Tables<"property_images">[]) ?? [],
  }));
}

const fetchRelatedCached = unstable_cache(
  async (currentPropertyId: number, categoryId: number, neighborhoodId: number) =>
    fetchRelated(currentPropertyId, categoryId, neighborhoodId),
  ["related-properties"],
  { tags: ["properties"], revalidate: 3600 }
);

export default async function RelatedProperties({
  currentPropertyId,
  categoryId,
  neighborhoodId,
}: RelatedPropertiesProps): Promise<React.ReactElement | null> {
  const related = await fetchRelatedCached(currentPropertyId, categoryId, neighborhoodId);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-[#1a2642] font-bold text-2xl mb-8 flex items-center gap-3">
        <div className="h-1 w-8 bg-[#d4af37] rounded-full"></div>
        Подобни имоти
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((prop) => (
          <PropertyCard key={prop.property.id} property={prop} />
        ))}
      </div>
    </section>
  );
}
