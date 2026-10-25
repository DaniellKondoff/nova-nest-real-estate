import { X } from "lucide-react";
import type { PropertySearchFilters } from "@/types/search";
import type { FeatureOption } from "@/lib/queries/features";
import { buildPropertiesHref } from "@/lib/search/params";
import type { FilterOption } from "./PropertyFilterForm";
import { ListingLink } from "./PropertiesNavigation";

interface ActiveFilterChipsProps {
  filters: PropertySearchFilters;
  categories: FilterOption[];
  neighborhoods: FilterOption[];
  features: FeatureOption[];
}

const nf = new Intl.NumberFormat("bg-BG");

/**
 * Server-rendered "remove filter" chips. Each chip is a real link to the URL without that filter.
 * Mobile: a single horizontally scrollable row.
 */
export default function ActiveFilterChips({ filters, categories, neighborhoods, features }: ActiveFilterChipsProps) {
  const chips: Array<{ key: string; label: string; next: PropertySearchFilters }> = [];
  const without = (patch: Partial<PropertySearchFilters>) => ({ ...filters, ...patch });

  if (filters.operationType)
    chips.push({ key: "op", label: filters.operationType === "rent" ? "Наем" : "Продажба", next: without({ operationType: undefined }) });
  if (typeof filters.categoryId === "number")
    chips.push({
      key: "cat",
      label: categories.find((c) => c.id === filters.categoryId)?.name_bg ?? "Тип имот",
      next: without({ categoryId: undefined }),
    });
  if (typeof filters.neighborhoodId === "number")
    chips.push({
      key: "nbh",
      label: `кв. ${neighborhoods.find((n) => n.id === filters.neighborhoodId)?.name_bg ?? ""}`.trim(),
      next: without({ neighborhoodId: undefined }),
    });
  if (typeof filters.minPriceEur === "number")
    chips.push({ key: "minP", label: `от €${nf.format(filters.minPriceEur)}`, next: without({ minPriceEur: undefined }) });
  if (typeof filters.maxPriceEur === "number")
    chips.push({ key: "maxP", label: `до €${nf.format(filters.maxPriceEur)}`, next: without({ maxPriceEur: undefined }) });
  if (typeof filters.minArea === "number")
    chips.push({ key: "minA", label: `от ${filters.minArea} m²`, next: without({ minArea: undefined }) });
  if (typeof filters.maxArea === "number")
    chips.push({ key: "maxA", label: `до ${filters.maxArea} m²`, next: without({ maxArea: undefined }) });
  filters.featureIds?.forEach((id) => {
    const rest = filters.featureIds!.filter((f) => f !== id);
    chips.push({
      key: `f${id}`,
      label: features.find((f) => f.id === id)?.name_bg ?? "Характеристика",
      next: without({ featureIds: rest.length ? rest : undefined }),
    });
  });
  if (filters.searchTerm)
    chips.push({ key: "q", label: `„${filters.searchTerm}“`, next: without({ searchTerm: undefined }) });

  if (chips.length === 0) return null;

  return (
    <div className="-mx-4 mb-5 flex items-center gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {chips.map((chip) => (
        <ListingLink
          key={chip.key}
          href={buildPropertiesHref(chip.next)}
          aria-label={`Премахни филтър: ${chip.label}`}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-primary/15 bg-white pl-4 pr-3 text-sm font-medium text-primary shadow-subtle transition-colors hover:border-primary/40"
        >
          {chip.label}
          <X className="h-4 w-4 text-primary/60" aria-hidden="true" />
        </ListingLink>
      ))}
      <ListingLink
        href={buildPropertiesHref({ sort: filters.sort })}
        className="inline-flex h-10 shrink-0 items-center px-2 text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4"
      >
        Изчисти всички
      </ListingLink>
    </div>
  );
}
