"use client";

import React from "react";
import { Home as HomeIcon } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
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

  // No mapping needed – PropertyCard consumes PropertyWithDetails directly

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
                const listItemProps = idx < 3 ? { "data-priority": "true" } : {};
                return (
                  <div key={String(item.property.id)} role="listitem" {...listItemProps}>
                    <PropertyCard property={item} priority={idx < 3} />
                  </div>
                );
              })
            )}
        </div>
      </div>
    </section>
  );
}


