import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertySearchFilters } from "@/types/search";
import { buildPropertiesHref } from "@/lib/search/params";
import { cn } from "@/lib/utils";
import { ListingLink } from "./listing/PropertiesNavigation";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  filters: PropertySearchFilters;
}

/**
 * Build a compact page range with ellipses.
 * Always shows first, last, current, and up to 1 page before/after current.
 */
export function calculatePageRange(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  const pages: Array<number | "ellipsis"> = [];
  if (totalPages <= 0) return pages;
  const cur = Math.min(Math.max(Number.isFinite(currentPage) ? currentPage : 1, 1), totalPages);
  const add = (val: number | "ellipsis") => {
    if (pages[pages.length - 1] !== val) pages.push(val);
  };

  add(1);
  const windowStart = Math.max(2, cur - 1);
  const windowEnd = Math.min(totalPages - 1, cur + 1);
  if (windowStart > 2) add("ellipsis");
  for (let p = windowStart; p <= windowEnd; p += 1) add(p);
  if (windowEnd < totalPages - 1) add("ellipsis");
  if (totalPages > 1) add(totalPages);
  return pages;
}

const itemBase =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/**
 * Server-rendered, link-based pagination (crawlable, works without JS).
 * Mobile: Prev · 2 / 9 · Next. sm+: numbered pages.
 */
export default function Pagination({ currentPage, totalPages, filters }: PaginationProps): React.ReactElement | null {
  if (totalPages <= 1) return null;

  const href = (page: number) => buildPropertiesHref(filters, page);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const prevNext = (dir: "prev" | "next") => {
    const enabled = dir === "prev" ? hasPrev : hasNext;
    const label = dir === "prev" ? "Предишна" : "Следваща";
    const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
    const content = (
      <>
        {dir === "prev" && <Icon className="h-5 w-5" aria-hidden="true" />}
        <span>{label}</span>
        {dir === "next" && <Icon className="h-5 w-5" aria-hidden="true" />}
      </>
    );
    if (!enabled) {
      return (
        <span aria-disabled="true" className={cn(itemBase, "gap-1 border border-gray-200 text-gray-300")}>
          {content}
        </span>
      );
    }
    return (
      <ListingLink
        href={href(dir === "prev" ? currentPage - 1 : currentPage + 1)}
        rel={dir}
        scrollToTop
        aria-label={`${label} страница`}
        className={cn(itemBase, "gap-1 border border-gray-300 bg-white text-primary hover:border-primary")}
      >
        {content}
      </ListingLink>
    );
  };

  return (
    <nav aria-label="Страници с имоти" className="flex items-center justify-between gap-2 sm:justify-center">
      {prevNext("prev")}

      {/* Mobile: compact counter */}
      <p className="text-[15px] font-medium text-charcoal/70 sm:hidden" aria-current="page">
        <span className="font-bold text-primary">{currentPage}</span> / {totalPages}
      </p>

      {/* sm+: numbered pages */}
      <ul className="hidden items-center gap-1 sm:flex">
        {calculatePageRange(currentPage, totalPages).map((item, idx) =>
          item === "ellipsis" ? (
            <li key={`e-${idx}`} aria-hidden="true" className="px-1 text-gray-400">
              …
            </li>
          ) : (
            <li key={item}>
              {item === currentPage ? (
                <span aria-current="page" className={cn(itemBase, "bg-primary text-white")}>
                  {item}
                </span>
              ) : (
                <ListingLink
                  href={href(item)}
                  scrollToTop
                  aria-label={`Страница ${item}`}
                  className={cn(itemBase, "text-primary hover:bg-primary/5")}
                >
                  {item}
                </ListingLink>
              )}
            </li>
          )
        )}
      </ul>

      {prevNext("next")}
    </nav>
  );
}
