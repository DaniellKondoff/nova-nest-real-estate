"use client";

import React from "react";
import { Home as HomeIcon } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import type { PropertyWithDetails } from "@/types/property";
import type { ViewMode } from "@/types/search";

export interface PropertyGridProps {
  properties: PropertyWithDetails[];
  loading?: boolean;
  viewMode?: ViewMode; // 'grid' | 'list'
}

/**
 * PropertyGrid – Minimalist responsive grid for property cards
 * - 1/2/3 columns across breakpoints
 * - Bulgarian copy and accessible semantics
 * - Skeletons shown during loading to avoid CLS
 */
export default function PropertyGrid(props: PropertyGridProps): React.ReactElement {
  const { properties, loading = false, viewMode = "grid" } = props;

  const gridClasses = viewMode === "grid"
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
    : "flex flex-col divide-y divide-gray-200";

  // No mapping needed – PropertyCard consumes PropertyWithDetails directly

  function renderSkeletonCard(key: React.Key): React.ReactElement {
    if (viewMode === "list") {
      return (
        <div
          key={key}
          role="status"
          aria-label="Зареждане на имот"
          className="w-full overflow-hidden bg-white py-4"
        >
          <div className="animate-pulse flex gap-4">
            <div className="w-32 sm:w-40 md:w-48 h-36 flex-shrink-0 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={key}
        role="status"
        aria-label="Зареждане на имот"
        className="h-80 sm:h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
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
                  <div key={String(item.property.id)} role="listitem" {...listItemProps} className={viewMode === "list" ? "py-4" : undefined}>
                    <PropertyCard property={item} priority={idx < 3} />
                  </div>
                );
              })
            )}
    </div>
  );
}


