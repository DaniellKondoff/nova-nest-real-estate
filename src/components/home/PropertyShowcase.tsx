"use client";
import React from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export type PropertyFilterKey = "all" | "sale" | "rent";

export interface PropertyShowcaseProps {
  className?: string;
}

interface FilterTab {
  key: PropertyFilterKey;
  label: string;
}

const TABS: FilterTab[] = [
  { key: "all", label: "Всички" },
  { key: "sale", label: "Продажба" },
  { key: "rent", label: "Наем" },
];

/**
 * PropertyShowcase – White section with filter tabs and responsive grid.
 * Placeholder-only for now; property cards will be integrated in a follow-up.
 */
export default function PropertyShowcase(props: PropertyShowcaseProps): React.ReactElement {
  const { className } = props;

  const [activeFilter, setActiveFilter] = React.useState<PropertyFilterKey>("all");

  // Placeholder data until real properties are wired in
  const properties: Array<unknown> = [];
  const filteredProperties = properties; // Filtering will be implemented later

  return (
    <section
      aria-labelledby="property-showcase-heading"
      className={[inter.variable, "w-full bg-white py-16 md:py-24", className].filter(Boolean).join(" ")}
    >
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2
            id="property-showcase-heading"
            className="text-4xl md:text-5xl font-semibold text-[#1a2642] mb-4"
          >
            Препоръчани имоти
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-12">
            Открийте най-добрите възможности на пазара
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          role="tablist"
          aria-label="Филтри за имоти"
          className="mb-16 flex items-center justify-center gap-3"
        >
          {TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const base =
              "px-6 py-3 rounded-lg text-base md:text-lg font-medium transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-white border-2";
            const inactive = "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200";
            const active = "bg-[#d4af37] text-white border-[#d4af37]";
            const className = [base, isActive ? active : inactive].join(" ");
            const handleSelect = () => setActiveFilter(tab.key);
            const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect();
              }
            };
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-pressed={isActive}
                className={className}
                onClick={handleSelect}
                onKeyDown={handleKeyDown}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.length === 0 ? (
            <div className="col-span-full text-center text-[#2d3748]">
              Скоро ще добавим препоръчани имоти.
            </div>
          ) : null}
        </div>

        {/* View All Button */}
        <div className="mt-12 flex justify-center">
          <a
            href="/imoti"
            className="inline-flex items-center justify-center rounded-lg bg-[#d4af37] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#c49d2f]"
          >
            Вижте всички обяви
          </a>
        </div>
      </div>
    </section>
  );
}


