"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

// Default items per page used across the app
const DEFAULT_ITEMS_PER_PAGE = 20;

/**
 * Build a compact page range with ellipses.
 * Always shows first, last, current, and up to 2 pages before/after current.
 */
export function calculatePageRange(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  const pages: Array<number | "ellipsis"> = [];
  if (totalPages <= 0) return pages;

  const clamp = (n: number) => Math.min(Math.max(n, 1), totalPages);
  const cur = clamp(Number.isFinite(currentPage) ? currentPage : 1);

  const add = (val: number | "ellipsis") => {
    if (pages.length === 0) {
      pages.push(val);
      return;
    }
    const last = pages[pages.length - 1];
    if (last === val) return;
    pages.push(val);
  };

  // Always include first page
  add(1);

  // Determine window around current
  const windowStart = Math.max(2, cur - 2);
  const windowEnd = Math.min(totalPages - 1, cur + 2);

  // Ellipsis if there's a gap after first
  if (windowStart > 2) add("ellipsis");

  // Middle window
  for (let p = windowStart; p <= windowEnd; p += 1) add(p);

  // Ellipsis if there's a gap before last
  if (windowEnd < totalPages - 1) add("ellipsis");

  // Always include last page if different from first
  if (totalPages > 1) add(totalPages);

  return pages;
}

/**
 * Calculate visible results range for current page.
 */
export function calculateResultsRange(
  currentPage: number,
  totalPages: number,
  totalResults: number,
  itemsPerPage: number
): { start: number; end: number } {
  if (!Number.isFinite(currentPage) || currentPage < 1) currentPage = 1;
  if (!Number.isFinite(itemsPerPage) || itemsPerPage < 1) itemsPerPage = DEFAULT_ITEMS_PER_PAGE;
  if (!Number.isFinite(totalPages) || totalPages < 0) totalPages = 0;
  if (!Number.isFinite(totalResults) || totalResults < 0) totalResults = 0;

  if (totalResults === 0 || totalPages === 0) {
    return { start: 0, end: 0 };
  }

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalResults);
  return { start, end };
}

/**
 * Format Bulgarian results summary text.
 */
export function formatResultsText(start: number, end: number, total: number): string {
  if (total === 0) return "Няма намерени имоти";
  return `Показани ${start}-${end} от ${total} имоти`;
}

export default function Pagination(props: PaginationProps): React.ReactElement | null {
  const { currentPage, totalPages, totalResults, onPageChange, loading = false } = props;

  // Track which page button was clicked for loading spinner
  const [loadingPage, setLoadingPage] = React.useState<number | null>(null);

  // Reset loadingPage when loading completes
  React.useEffect(() => {
    if (!loading) {
      setLoadingPage(null);
    }
  }, [loading]);

  // Edge case: hide component entirely if no pages and no results
  if (totalPages === 0 && totalResults === 0) return null;

  const safePage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const { start, end } = calculateResultsRange(safePage, totalPages, totalResults, DEFAULT_ITEMS_PER_PAGE);
  const pageRange = calculatePageRange(safePage, totalPages);

  const isFirst = safePage <= 1;
  const isLast = safePage >= Math.max(1, totalPages);

  function goTo(page: number) {
    if (loading) return;
    if (!Number.isFinite(page) || page < 1 || page > Math.max(1, totalPages)) return;
    if (page === safePage) return;
    setLoadingPage(page);
    onPageChange(page);
  }

  return (
    <div className={["flex flex-col items-center gap-4", loading ? "opacity-80" : ""].join(" ")}> 
      {/* Results count */}
      <div className="text-center text-sm text-gray-600">
        {formatResultsText(start, end, totalResults)}
      </div>

      {/* Pagination controls */}
      <nav aria-label="Навигация в страниците" className="w-full">
        {/* Desktop / tablet controls */}
        <div className={[
          "hidden sm:flex w-full items-center justify-center gap-2",
          loading ? "pointer-events-none" : "",
        ].join(" ")}>
          {/* Previous */}
          <button
            type="button"
            aria-label="Предишна страница"
            onClick={() => goTo(safePage - 1)}
            disabled={isFirst || loading}
            className={[
              "rounded-md border border-gray-300 px-4 py-2 text-sm text-[#1a2642]",
              isFirst || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50",
              loadingPage === safePage - 1 ? "bg-gray-100" : "",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-2">
              {loadingPage === safePage - 1 && (
                <div className="h-3 w-3 rounded-full border-2 border-[#1a2642]/20 border-t-[#d4af37] animate-spin" />
              )}
              <ChevronLeft className="h-4 w-4" /> Предишна
            </span>
          </button>

          {/* Pages */}
          <div className="flex items-center gap-1">
            {pageRange.map((item, idx) => {
              if (item === "ellipsis") {
                return (
                  <span key={`e-${idx}`} className="px-3 py-2 text-sm text-gray-400 select-none">
                    …
                  </span>
                );
              }
              const pageNum = item as number;
              const isActive = pageNum === safePage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  aria-label={`Страница ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                  disabled={loading}
                  onClick={() => goTo(pageNum)}
                  className={[
                    "rounded-md px-3 py-2 text-sm",
                    isActive
                      ? "bg-[#d4af37] text-white font-semibold"
                      : "bg-white border border-gray-300 text-[#1a2642] hover:bg-gray-50",
                    loadingPage === pageNum ? "ring-2 ring-[#d4af37]/50" : "",
                  ].join(" ")}
                >
                  {loadingPage === pageNum ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {pageNum}
                    </div>
                  ) : (
                    pageNum
                  )}
                </button>
              );
            })}
          </div>

          {/* Next */}
          <button
            type="button"
            aria-label="Следваща страница"
            onClick={() => goTo(safePage + 1)}
            disabled={isLast || loading}
            className={[
              "rounded-md border border-gray-300 px-4 py-2 text-sm text-[#1a2642]",
              isLast || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50",
              loadingPage === safePage + 1 ? "bg-gray-100" : "",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-2">
              Следваща <ChevronRight className="h-4 w-4" />
              {loadingPage === safePage + 1 && (
                <div className="h-3 w-3 rounded-full border-2 border-[#1a2642]/20 border-t-[#d4af37] animate-spin" />
              )}
            </span>
          </button>
        </div>

        {/* Mobile minimal controls */}
        <div className={[
          "sm:hidden flex w-full items-center justify-between gap-2",
          loading ? "pointer-events-none" : "",
        ].join(" ")}>
          <button
            type="button"
            aria-label="Предишна страница"
            onClick={() => goTo(safePage - 1)}
            disabled={isFirst || loading}
            className={[
              "rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1a2642] flex items-center justify-center",
              isFirst || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50",
            ].join(" ")}
          >
            {loadingPage === safePage - 1 ? (
              <div className="h-4 w-4 rounded-full border-2 border-[#1a2642]/20 border-t-[#d4af37] animate-spin" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
          <div className="text-sm text-[#1a2642] flex items-center gap-2">
            {loading && (
              <div className="h-3 w-3 rounded-full border-2 border-[#1a2642]/20 border-t-[#d4af37] animate-spin" />
            )}
            Страница {safePage} от {Math.max(1, totalPages)}
          </div>
          <button
            type="button"
            aria-label="Следваща страница"
            onClick={() => goTo(safePage + 1)}
            disabled={isLast || loading}
            className={[
              "rounded-md border border-gray-300 px-3 py-2 text-sm text-[#1a2642] flex items-center justify-center",
              isLast || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50",
            ].join(" ")}
          >
            {loadingPage === safePage + 1 ? (
              <div className="h-4 w-4 rounded-full border-2 border-[#1a2642]/20 border-t-[#d4af37] animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}


