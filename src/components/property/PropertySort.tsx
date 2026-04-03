"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import type { SortOption } from "@/types/search";

export interface PropertySortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  loading?: boolean;
  disabled?: boolean;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Най-нови",
  oldest: "Най-стари",
  price_asc: "Цена: Ниска към висока",
  price_desc: "Цена: Висока към ниска",
  area_asc: "Площ: Малка към голяма",
  area_desc: "Площ: Голяма към малка",
};

export default function PropertySort({ currentSort, onSortChange, loading = false, disabled = false }: PropertySortProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="property-sort" className="hidden sm:inline text-sm font-medium text-[#1a2642]">
        Сортирай по:
      </label>
      <div className="relative">
        {/* Loading spinner overlay */}
        {loading && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <div className="h-4 w-4 rounded-full border-2 border-[#1a2642]/20 border-t-[#d4af37] animate-spin" />
          </div>
        )}

        <ArrowUpDown className={[
          "pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a2642] opacity-70",
          loading ? "left-8" : "left-3"
        ].join(" ")} />
        <select
          id="property-sort"
          aria-label="Сортиране на имоти"
          disabled={disabled || loading}
          className={[
            "appearance-none rounded-md border border-gray-300 bg-white py-2.5 sm:py-2 min-h-[44px] text-sm text-[#1a2642] focus:outline-none focus:ring-2 focus:ring-[#d4af37] hover:border-[#d4af37] transition-colors",
            loading ? "pl-12 pr-8 opacity-70 cursor-wait" : "pl-9 pr-8",
            disabled ? "opacity-50 cursor-not-allowed" : ""
          ].join(" ")}
          value={currentSort}
          onChange={(e) => !loading && onSortChange(e.target.value as SortOption)}
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
        {/* Dropdown indicator */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a2642] opacity-70"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}


