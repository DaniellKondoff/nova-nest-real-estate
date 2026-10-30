import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { getPropertiesBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import { filterListings, landingPathFor } from "@/lib/seo/landing";
import { neighborhoodLabel } from "@/lib/seo/property-metadata";
import { getLandingData } from "@/lib/queries/landing-data";
import { searchPropertyListings } from "@/lib/queries/property-listings";
import { getCachedPropertyCategories } from "@/lib/queries/categories";
import { getCachedNeighborhoods } from "@/lib/queries/neighborhoods";
import { getCachedFeatureOptions } from "@/lib/queries/features";
import {
  buildPropertiesHref,
  countActiveFilters,
  parsePage,
  PROPERTIES_PAGE_SIZE,
  urlParamsToFilters,
} from "@/lib/search/params";
import type { PropertySearchFilters } from "@/types/search";
import { containerClass } from "@/components/ui/section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import PropertyGrid from "@/components/property/PropertyGrid";
import Pagination from "@/components/property/Pagination";
import PropertySort from "@/components/property/PropertySort";
import PropertyFilterForm, { type FilterOption } from "@/components/property/listing/PropertyFilterForm";
import PropertyFiltersDialog from "@/components/property/listing/PropertyFiltersDialog";
import ActiveFilterChips from "@/components/property/listing/ActiveFilterChips";
import { PendingResults, PropertiesNavigationProvider } from "@/components/property/listing/PropertiesNavigation";
import { cn } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function getFilterOptions() {
  const [categories, neighborhoods, features] = await Promise.all([
    getCachedPropertyCategories().catch(() => []),
    getCachedNeighborhoods().catch(() => []),
    getCachedFeatureOptions().catch(() => []),
  ]);
  const lean = (rows: Array<{ id: number; name_bg: string }>): FilterOption[] =>
    rows.map(({ id, name_bg }) => ({ id, name_bg }));
  return { categories: lean(categories), neighborhoods: lean(neighborhoods), features };
}

/** "Имоти за продажба в Стара Загора – кв. Център" (or "– село X") */
function buildTitle(filters: PropertySearchFilters, neighborhoods: FilterOption[]): string {
  const op = filters.operationType === "sale" ? " за продажба" : filters.operationType === "rent" ? " под наем" : "";
  const nbh = neighborhoods.find((n) => n.id === filters.neighborhoodId)?.name_bg;
  return `Имоти${op} в Стара Загора${nbh ? ` – ${neighborhoodLabel(nbh)}` : ""}`;
}

/** Only "landing-page" combinations (operation / neighborhood / category, no ranges) are indexable */
function isIndexable(filters: PropertySearchFilters): boolean {
  const { operationType, neighborhoodId, categoryId, sort, ...rest } = filters;
  void operationType; void neighborhoodId; void categoryId;
  const hasOther = Object.values(rest).some((v) => (Array.isArray(v) ? v.length > 0 : v != null));
  return !hasOther && (!sort || sort === "newest");
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const filters = urlParamsToFilters(sp);
  const page = parsePage(sp);
  const { neighborhoods } = await getFilterOptions();
  const title = buildTitle(filters, neighborhoods) + (page > 1 ? ` – страница ${page}` : "");

  const indexable = isIndexable(filters);
  const canonicalFilters: PropertySearchFilters = indexable
    ? { operationType: filters.operationType, neighborhoodId: filters.neighborhoodId, categoryId: filters.categoryId }
    : {};
  // Filter combinations that have a (non-empty) keyword landing page point search engines there instead
  const landing = await getLandingData();
  const landingPath =
    indexable && page === 1 && filterListings(landing.listings, canonicalFilters).length > 0
      ? landingPathFor(canonicalFilters, landing.categories, landing.neighborhoods)
      : null;

  return buildMetadata({
    title,
    description: `${buildTitle(filters, neighborhoods)} – актуални обяви за апартаменти, къщи, офиси и парцели със снимки, цени и директен контакт с консултант на Nova Nest.`,
    // Canonical drops ranges/sort; deep filter combinations keep crawling links but aren't indexed
    path: landingPath ?? buildPropertiesHref(canonicalFilters, indexable ? page : 1),
    noIndex: !indexable,
  });
}

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters = urlParamsToFilters(sp);
  const page = parsePage(sp);

  // Native GET forms (no-JS) submit empty fields – normalize to the clean canonical URL
  if (Object.values(sp).some((v) => v === "" || (Array.isArray(v) && v.includes("")))) {
    redirect(buildPropertiesHref(filters, page));
  }

  const [result, options] = await Promise.all([
    searchPropertyListings(filters, page, PROPERTIES_PAGE_SIZE),
    getFilterOptions(),
  ]);

  // Out-of-range pages should not exist
  if (page > 1 && page > result.totalPages) notFound();

  const activeCount = countActiveFilters(filters);
  const title = buildTitle(filters, options.neighborhoods);
  const breadcrumbs = getPropertiesBreadcrumbs();
  const resultLabel =
    result.total === 1 ? "1 имот" : `${new Intl.NumberFormat("bg-BG").format(result.total)} имота`;

  return (
    <PropertiesNavigationProvider>
      <BreadcrumbSchema items={breadcrumbs} />
      <div className="min-h-svh bg-gray-light">
        {/* Page header */}
        <section className="border-b border-border bg-white">
          <div className={cn(containerClass, "py-6 md:py-10")}>
            <Breadcrumbs items={breadcrumbs} className="mb-3" />
            <h1 className="text-h2 font-bold tracking-tight text-primary text-balance">{title}</h1>
            <p className="mt-2 text-charcoal/70" aria-live="polite">
              {result.total > 0 ? (
                <>
                  <span className="font-semibold text-primary">{resultLabel}</span> отговарят на търсенето
                  {result.totalPages > 1 && ` · страница ${result.page} от ${result.totalPages}`}
                </>
              ) : (
                "Няма имоти, отговарящи на избраните критерии"
              )}
            </p>
          </div>
        </section>

        {/* Sticky toolbar */}
        <div className="sticky top-[var(--header-h)] z-30 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <div className={cn(containerClass, "flex items-center gap-2 py-3")}>
            <div className="hidden min-w-0 flex-1 xl:block">
              <PropertyFilterForm
                variant="bar"
                filters={filters}
                categories={options.categories}
                neighborhoods={options.neighborhoods}
              />
            </div>
            <PropertyFiltersDialog
              label="Филтри"
              className="flex-1 justify-center sm:flex-none xl:hidden"
              activeCount={activeCount}
              filters={filters}
              categories={options.categories}
              neighborhoods={options.neighborhoods}
              features={options.features}
            />
            <PropertyFiltersDialog
              label="Още филтри"
              className="hidden xl:inline-flex"
              activeCount={
                (typeof filters.minArea === "number" ? 1 : 0) +
                (typeof filters.maxArea === "number" ? 1 : 0) +
                (filters.featureIds?.length ?? 0)
              }
              filters={filters}
              categories={options.categories}
              neighborhoods={options.neighborhoods}
              features={options.features}
            />
            <PropertySort filters={filters} className="flex-1 sm:ml-auto sm:w-56 sm:flex-none xl:hidden" />
          </div>
        </div>

        {/* Results */}
        <div id="listing-top" className={cn(containerClass, "scroll-mt-[calc(var(--header-h)+5rem)] py-6 md:py-8")}>
          <ActiveFilterChips
            filters={filters}
            categories={options.categories}
            neighborhoods={options.neighborhoods}
            features={options.features}
          />

          <div className="mb-5 hidden items-center justify-between gap-4 xl:flex">
            <p className="text-sm text-charcoal/70">
              Показани {result.properties.length} от {resultLabel}
            </p>
            <PropertySort filters={filters} className="w-60" />
          </div>

          <PendingResults>
            <PropertyGrid
              properties={result.properties}
              headingLevel="h2"
              priorityCount={2}
              emptyAction={activeCount > 0 ? { href: "/properties/", label: "Изчисти филтрите" } : undefined}
            />
          </PendingResults>

          <div className="mt-10">
            <Pagination currentPage={result.page} totalPages={result.totalPages} filters={filters} />
          </div>
        </div>
      </div>
    </PropertiesNavigationProvider>
  );
}
