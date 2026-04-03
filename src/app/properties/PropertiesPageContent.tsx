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
import BeautifulLoader from "@/magic/components/BeautifulLoader";

export default function PropertiesPageContent(): React.ReactElement {
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

  // Track if we've loaded data at least once
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);

  // Detect initial load: no properties yet and haven't loaded once
  const isInitialLoad = properties.length === 0 && !hasLoadedOnce && !error;

  // Two-phase loading: quick (0-300ms) vs slow (300ms+) for better UX
  const [loadingPhase, setLoadingPhase] = React.useState<'idle' | 'quick' | 'slow'>('idle');

  React.useEffect(() => {
    if (loading || isInitialLoad) {
      setLoadingPhase('quick');
      const timer = setTimeout(() => {
        setLoadingPhase('slow');
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setLoadingPhase('idle');
    }
  }, [loading, isInitialLoad]);

  // Mark as loaded once we have properties or an error
  React.useEffect(() => {
    if ((properties.length > 0 || error) && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [properties.length, error, hasLoadedOnce]);

  // Active filter chips (show only non-empty)
  const activeChips = React.useMemo(() => {
    const chips: Array<{ key: keyof typeof filters; label: string }> = [];
    if (filters.operationType) chips.push({ key: "operationType", label: filters.operationType === "rent" ? "Наем" : "Продажба" });

    // Look up category name from categories data
    if (typeof filters.categoryId === "number") {
      const category = categories.find(c => c.id === filters.categoryId);
      chips.push({ key: "categoryId", label: category?.name_bg || `Категория #${filters.categoryId}` });
    }

    // Look up neighborhood name from neighborhoods data
    if (typeof filters.neighborhoodId === "number") {
      const neighborhood = neighborhoods.find(n => n.id === filters.neighborhoodId);
      chips.push({ key: "neighborhoodId", label: neighborhood?.name_bg || `Квартал #${filters.neighborhoodId}` });
    }

    if (typeof filters.minPriceEur === "number") chips.push({ key: "minPriceEur", label: `Мин. цена €${filters.minPriceEur}` });
    if (typeof filters.maxPriceEur === "number") chips.push({ key: "maxPriceEur", label: `Макс. цена €${filters.maxPriceEur}` });
    if (typeof filters.minArea === "number") chips.push({ key: "minArea", label: `Мин. площ ${filters.minArea} m²` });
    if (typeof filters.maxArea === "number") chips.push({ key: "maxArea", label: `Макс. площ ${filters.maxArea} m²` });
    return chips;
  }, [filters, categories, neighborhoods]);

  const appliedCount = activeChips.length;

  // PropertyGrid should show skeletons during initial load or any loading phase
  const gridIsLoading = loading || isInitialLoad;

  return (
    <div className="bg-gray-50">
      {/* Horizontal Filters Section */}
      <HorizontalPropertyFilters
        initialFilters={filters}
        onFilterChange={setFilters}
        categories={categories}
        neighborhoods={neighborhoods}
        features={features}
        totalResults={totalResults}
        categoriesLoading={categoriesLoading}
        neighborhoodsLoading={neighborhoodsLoading}
        featuresLoading={featuresLoading}
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
                  onClick={() => refetch()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Control bar: results + sort + view */}
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-gray-600 text-sm" aria-live="polite" aria-atomic="true">
              {loading
                ? "Търсене..."
                : totalResults > 0
                ? `Намерени ${totalResults} имота`
                : "Няма намерени имоти"}
            </div>
            <div className="flex items-center gap-3">
              <PropertySort currentSort={sortBy} onSortChange={setSortBy} loading={loading} />
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          {/* Quick loading indicator (0-300ms) */}
          {loadingPhase === 'quick' && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-[#d4af37]/20">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-[#1a2642]/10 border-t-[#d4af37] animate-spin" />
                <span className="text-sm text-[#1a2642]/70">Търсене...</span>
              </div>
            </div>
          )}

          {loadingPhase === 'slow' && (
            <div className="mb-8">
              <BeautifulLoader label="Зареждане на имоти..." />
            </div>
          )}

          {/* Properties Grid */}
          <PropertyGrid
            properties={properties}
            loading={gridIsLoading}
            viewMode={viewMode}
          />

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
    </div>
  );
}
