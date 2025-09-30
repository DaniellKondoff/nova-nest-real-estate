"use client";

import React from "react";
import { Home as HomeIcon } from "lucide-react";
import PropertyCard, { type PropertyCardProps } from "@/components/property/PropertyCard";
import type { PropertyWithDetails } from "@/types/property";

export interface PropertyGridProps {
  properties: PropertyWithDetails[];
  loading?: boolean;
}

/**
 * PropertyGrid – Minimalist responsive grid for property cards
 * - 1/2/3 columns across breakpoints
 * - Bulgarian copy and accessible semantics
 * - Skeletons shown during loading to avoid CLS
 */
export default function PropertyGrid(props: PropertyGridProps): React.ReactElement {
  const { properties, loading = false } = props;

  const gridClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";

  function mapToCardProps(item: PropertyWithDetails): PropertyCardProps {
    const p = item.property as unknown as {
      id: string | number;
      title_bg: string;
      price_eur: number | null;
      operation_type: "sale" | "rent";
      address_bg?: string | null;
      area_sqm?: number | null;
      rooms?: number | null;
      bedrooms?: number | null;
      is_new?: boolean | null;
      created_at: string;
    };
    const neighborhoodName = item.neighborhood?.name_bg ?? "";
    const primaryImage = (item.images || []).find((img) => (img as any).is_primary) || item.images?.[0];
    const imageUrl = (primaryImage as any)?.url ?? "/images/window.svg";
    const imageAlt = (primaryImage as any)?.alt_text_bg ?? p.title_bg;

    return {
      id: String(p.id),
      title_bg: p.title_bg,
      price_eur: p.price_eur ?? 0,
      operation_type: p.operation_type === "rent" ? "rent" : "sale",
      address_bg: p.address_bg ?? "",
      neighborhood: { name_bg: neighborhoodName },
      area_sqm: p.area_sqm ?? undefined,
      rooms: p.rooms ?? undefined,
      bedrooms: p.bedrooms ?? undefined,
      primary_image: { image_url: imageUrl, alt_text_bg: imageAlt },
      is_new: Boolean(p.is_new ?? false),
      created_at: p.created_at,
      href: `/imoti/${p.id}`,
    };
  }

  function renderSkeletonCard(key: React.Key): React.ReactElement {
    return (
      <div
        key={key}
        role="status"
        aria-label="Зареждане на имот"
        className="h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
      >
        <div className="animate-pulse h-full">
          <div className="w-full aspect-[4/3] bg-gray-200" />
          <div className="p-6 space-y-3">
            <div className="h-6 w-1/3 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !loading && properties.length === 0;

  return (
    <section aria-labelledby="all-properties-heading" className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 id="all-properties-heading" className="mb-12 text-4xl font-semibold text-[#1a2642]">
          Всички имоти
        </h2>

        <div className={gridClasses} aria-busy={loading ? true : undefined} role="list" aria-label="Списък с имоти">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => renderSkeletonCard(idx))
            : isEmpty
            ? (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-16" role="status" aria-live="polite">
                <HomeIcon className="h-16 w-16 text-gray-400" aria-hidden />
                <p className="mt-6 text-lg text-gray-600">Няма намерени имоти</p>
                <p className="mt-1 text-sm text-gray-400">Опитайте да промените филтрите</p>
              </div>
            )
            : (
              properties.map((item, idx) => {
                const cardProps = mapToCardProps(item);
                const listItemProps = idx < 3 ? { "data-priority": "true" } : {};
                return (
                  <div key={cardProps.id} role="listitem" {...listItemProps}>
                    <PropertyCard {...cardProps} />
                  </div>
                );
              })
            )}
        </div>
      </div>
    </section>
  );
}


