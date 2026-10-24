import React from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import type { PropertyWithDetails } from "@/types/property";
import { cn } from "@/lib/utils";

export interface PropertyGridProps {
  properties: PropertyWithDetails[];
  /** Heading level for card titles (h2 when the grid is the main content of the page) */
  headingLevel?: "h2" | "h3";
  /** Number of leading cards whose images get `priority` (LCP) */
  priorityCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { href: string; label: string };
  className?: string;
}

const gridClass = "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3";

/** PropertyGrid – server component: 1 / 2 / 3 columns, with a friendly empty state. */
export default function PropertyGrid({
  properties,
  headingLevel = "h3",
  priorityCount = 0,
  emptyTitle = "Няма намерени имоти",
  emptyDescription = "Опитайте да промените или изчистите филтрите.",
  emptyAction,
  className,
}: PropertyGridProps): React.ReactElement {
  if (properties.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center rounded-card border border-dashed border-gray-300 bg-white px-6 py-16 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
          <SearchX className="h-7 w-7 text-accent-dark" aria-hidden="true" />
        </span>
        <p className="mt-5 text-lg font-semibold text-primary">{emptyTitle}</p>
        <p className="mt-1 max-w-sm text-charcoal/70">{emptyDescription}</p>
        {emptyAction && (
          <Link
            href={emptyAction.href}
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold text-white transition-colors hover:bg-primary-light"
          >
            {emptyAction.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <ul className={cn(gridClass, className)} aria-label="Списък с имоти">
      {properties.map((item, idx) => (
        <li key={item.property.id}>
          <PropertyCard property={item} headingLevel={headingLevel} priority={idx < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
