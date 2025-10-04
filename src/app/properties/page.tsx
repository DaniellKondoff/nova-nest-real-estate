"use client";

import React from "react";
import { TriangleAlert, X } from "lucide-react";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { usePropertyFeatures } from "@/hooks/usePropertyFeatures";
import { usePropertyCategories } from "@/hooks/usePropertyCategories";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import HorizontalPropertyFilters from "@/components/property/HorizontalPropertyFilters";
import PropertyGrid from "@/components/property/PropertyGrid";
import PropertySort from "@/components/property/PropertySort";
import ViewToggle from "@/components/property/ViewToggle";
import Pagination from "@/components/property/Pagination";
import type { ViewMode } from "@/types/search";

export default function PropertiesPage(): React.ReactElement {
  const {
    properties,
    filters,
    loading,
    error,
    currentPage,
    totalPages,
    totalResults,
    setFilters,
    clearFilters,
    setPage,
    updateFilter,
    refetch,
    sortBy,
    setSortBy,
  } = usePropertySearch();

  const { features, loading: featuresLoading } = usePropertyFeatures();
  const { categories, loading: categoriesLoading } = usePropertyCategories();
  const { neighborhoods, loading: neighborhoodsLoading } = useNeighborhoods();
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  // Active filter chips (show only non-empty)
  const activeChips = React.useMemo(() => {
    const chips: Array<{ key: keyof typeof filters; label: string }> = [];
    if (filters.searchTerm) chips.push({ key: "searchTerm", label: `Търсене: ${filters.searchTerm}` });
    if (typeof filters.categoryId === "number") chips.push({ key: "categoryId", label: `Категория #${filters.categoryId}` });
    if (typeof filters.neighborhoodId === "number") chips.push({ key: "neighborhoodId", label: `Квартал #${filters.neighborhoodId}` });
    if (typeof filters.minPriceEur === "number") chips.push({ key: "minPriceEur", label: `Мин. цена €${filters.minPriceEur}` });
    if (typeof filters.maxPriceEur === "number") chips.push({ key: "maxPriceEur", label: `Макс. цена €${filters.maxPriceEur}` });
    if (typeof filters.minArea === "number") chips.push({ key: "minArea", label: `Мин. площ ${filters.minArea} m²` });
    if (typeof filters.maxArea === "number") chips.push({ key: "maxArea", label: `Макс. площ ${filters.maxArea} m²` });
    if (filters.operationType) chips.push({ key: "operationType", label: filters.operationType === "rent" ? "Наем" : "Продажба" });
    return chips;
  }, [filters]);

  const appliedCount = activeChips.length;

  return (
    <main className="bg-gray-50">
      {/* Horizontal Filters Section */}
      <HorizontalPropertyFilters
        initialFilters={filters}
        onFilterChange={setFilters}
        categories={categories}
        neighborhoods={neighborhoods}
        features={features}
        totalResults={totalResults}
      />

      {/* Results Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1a2642]">Имоти в Стара Загора</h1>
            <p className="mt-2 text-gray-600">Разгледайте актуални оферти за продажба и наем</p>
          </div>

          {/* Active filter chips */}
          {appliedCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span key={String(chip.key)} className="inline-flex items-center gap-2 rounded-full bg-[#f1f5f9] px-3 py-1 text-sm text-[#1a2642]">
                  {chip.label}
                  <button
                    type="button"
                    aria-label="Премахни филтър"
                    className="ml-1 rounded-full p-1 hover:bg-gray-200"
                    onClick={() => updateFilter(chip.key, undefined)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="ml-2 text-sm text-[#1a2642] underline decoration-[#d4af37] decoration-2 underline-offset-4"
                onClick={() => clearFilters()}
              >
                Изчисти всички
              </button>
            </div>
          )}

          {/* Error block */}
          {error && (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-0.5 h-5 w-5" aria-hidden />
                <div>{error}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#d4af37] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#c09d2f]"
                  onClick={() => refetch()}
                >
                  Опитай отново
                </button>
                <button
                  type="button"
                  aria-label="Затвори"
                  className="rounded p-2 hover:bg-red-100"
                  onClick={() => window.location.reload()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Control bar: results + sort + view */}
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-gray-600 text-sm">
              {totalResults > 0 ? `Намерени ${totalResults} имота` : "Няма намерени имоти"}
            </div>
            <div className="flex items-center gap-3">
              <PropertySort currentSort={sortBy} onSortChange={setSortBy} />
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          {/* Properties Grid */}
          <PropertyGrid properties={properties} loading={loading} viewMode={viewMode} />

          {/* Pagination */}
          <div className="mt-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              loading={loading}
              onPageChange={setPage}
            />
          </div>
        </div>
      </section>
    </main>
  );
}



