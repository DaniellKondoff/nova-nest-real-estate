"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  itemsPerPage = 20,
}: AdminPaginationProps) {
  // Calculate results range
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endResult = Math.min(currentPage * itemsPerPage, totalResults);

  // Generate page numbers (current ±2)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Don't show pagination if no results
  if (totalResults === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Показани <span className="font-medium">{startResult}-{endResult}</span> от{" "}
        <span className="font-medium">{totalResults}</span>
      </div>

      {/* Page Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-2">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-[#D4AF37] text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Mobile: Current page indicator */}
        <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
          {currentPage} / {totalPages}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

