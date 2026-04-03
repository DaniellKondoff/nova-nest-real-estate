"use client";

import * as React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import HorizontalPropertyFilters, { type HorizontalPropertyFiltersProps } from "./HorizontalPropertyFilters";

interface MobileFilterDrawerProps extends HorizontalPropertyFiltersProps {
  activeFilterCount: number;
}

export default function MobileFilterDrawer({
  activeFilterCount,
  ...filterProps
}: MobileFilterDrawerProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleFilterChange(filters: Parameters<HorizontalPropertyFiltersProps["onFilterChange"]>[0]) {
    filterProps.onFilterChange(filters);
    setOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-[#1a2642] hover:border-[#d4af37] transition-colors"
        aria-label="Отвори филтри"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Филтри
        {activeFilterCount > 0 && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-xs font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Филтри за имоти"
        className={[
          "fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#1a2642]">Филтри</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Затвори филтри"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters — reuse existing component, override onFilterChange to close drawer */}
        <HorizontalPropertyFilters
          {...filterProps}
          onFilterChange={handleFilterChange}
        />
      </div>
    </>
  );
}
