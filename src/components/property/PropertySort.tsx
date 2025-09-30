"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import type { SortOption } from "@/types/search";

export interface PropertySortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Най-нови",
  oldest: "Най-стари",
  price_asc: "Цена: Ниска към висока",
  price_desc: "Цена: Висока към ниска",
  area_asc: "Площ: Малка към голяма",
  area_desc: "Площ: Голяма към малка",
};

export default function PropertySort({ currentSort, onSortChange }: PropertySortProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="property-sort" className="text-sm font-medium text-[#1a2642]">
        Сортирай по:
      </label>
      <div className="relative">
        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a2642] opacity-70" />
        <select
          id="property-sort"
          aria-label="Сортиране на имоти"
          className="appearance-none rounded-md border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm text-[#1a2642] focus:outline-none focus:ring-2 focus:ring-[#d4af37] hover:border-[#d4af37] transition-colors"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
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


