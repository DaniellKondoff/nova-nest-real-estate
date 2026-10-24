import React from "react";
import { unstable_cache } from "next/cache";
import { getStaticServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.generated";
import type { PropertyWithDetails } from "@/types/property";
import PropertyCard from "@/components/property/PropertyCard";
import { LISTING_SELECT } from "@/lib/queries/listing-select";

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
  const supabase = getStaticServerClient();
  type ListingRow = Record<string, unknown> & {
    id: number;
    neighborhood?: Tables<"neighborhoods"> | null;
    category?: Tables<"property_categories"> | null;
    images?: Tables<"property_images">[] | null;
  };

  // First try: same category + same neighborhood
  const { data: sameArea } = await supabase
    .from("properties")
    .select(LISTING_SELECT)
    .eq("category_id", categoryId)
    .eq("neighborhood_id", neighborhoodId)
    .eq("status", "available")
    .neq("id", currentPropertyId)
    .order("created_at", { ascending: false })
    .limit(3);
  let data = (sameArea ?? []) as unknown as ListingRow[];

  // Fallback: same category only
  if (!data || data.length < 3) {
    const needed = 3 - (data?.length ?? 0);
    const existingIds = [currentPropertyId, ...(data ?? []).map((p) => p.id)];

    const { data: fallback } = await supabase
      .from("properties")
      .select(LISTING_SELECT)
      .eq("category_id", categoryId)
      .eq("status", "available")
      .not("id", "in", `(${existingIds.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(needed);

    data = [...data, ...((fallback ?? []) as unknown as ListingRow[])];
  }

  return data.map((row) => ({
    property: row as unknown as Tables<"properties">,
    neighborhood: row.neighborhood ?? null,
    category: row.category ?? null,
    images: row.images ?? [],
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
    <section aria-labelledby="related-title" className="mt-12 md:mt-16">
      <h2 id="related-title" className="mb-6 flex items-center gap-3 text-xl font-bold text-primary sm:text-2xl">
        <span aria-hidden="true" className="h-1 w-8 rounded-full bg-accent" />
        Подобни имоти
      </h2>
      {/* Mobile: swipeable row with the next card peeking in; lg+: 3-column grid */}
      <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible">
        {related.map((prop) => (
          <li key={prop.property.id} className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
            <PropertyCard property={prop} sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 85vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
