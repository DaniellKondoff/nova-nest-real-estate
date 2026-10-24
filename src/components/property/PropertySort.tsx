"use client";

import React from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import type { PropertySearchFilters, SortOption } from "@/types/search";
import { buildPropertiesHref, filtersToURLParams, PROPERTIES_PATH, SORT_OPTIONS } from "@/lib/search/params";
import { cn } from "@/lib/utils";
import { usePropertiesNavigation } from "./listing/PropertiesNavigation";

export interface PropertySortProps {
  filters: PropertySearchFilters;
  className?: string;
}

/**
 * Sort select. A GET form with the current filters as hidden inputs, so it also works
 * without JS (via the <noscript> submit); with JS it navigates on change.
 */
export default function PropertySort({ filters, className }: PropertySortProps): React.ReactElement {
  const { navigate } = usePropertiesNavigation();
  const current: SortOption = filters.sort ?? "newest";
  const hidden = Array.from(filtersToURLParams({ ...filters, sort: undefined }).entries());

  return (
    <form action={PROPERTIES_PATH} method="get" className={cn("relative", className)}>
      {hidden.map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label htmlFor="property-sort" className="sr-only">
        Сортиране
      </label>
      <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" aria-hidden="true" />
      <select
        id="property-sort"
        name="sort"
        value={current}
        onChange={(e) => navigate(buildPropertiesHref({ ...filters, sort: e.target.value as SortOption }))}
        className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-9 pr-9 text-base font-medium text-primary shadow-subtle outline-none transition-colors hover:border-primary/40 focus:border-accent focus:ring-2 focus:ring-accent/30 md:text-[15px]"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" aria-hidden="true" />
      <noscript>
        <button type="submit" className="ml-2 h-11 rounded-xl bg-primary px-4 text-white">
          OK
        </button>
      </noscript>
    </form>
  );
}
