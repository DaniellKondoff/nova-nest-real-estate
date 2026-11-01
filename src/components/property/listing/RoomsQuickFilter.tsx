import { Check } from "lucide-react";
import type { PropertySearchFilters } from "@/types/search";
import { buildPropertiesHref, ROOM_OPTIONS } from "@/lib/search/params";
import { cn } from "@/lib/utils";
import { ListingLink } from "./PropertiesNavigation";

/**
 * One-tap room-count filter above the results (server-rendered toggle links, work without JS).
 * Phone: a single scrollable row of 44px pills; the full filter dialog stays one tap further.
 */
export default function RoomsQuickFilter({ filters }: { filters: PropertySearchFilters }) {
  const selected = new Set(filters.rooms ?? []);

  return (
    <nav aria-label="Брой стаи" className="-mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
      <span className="shrink-0 pr-1 text-sm font-semibold text-primary">Стаи:</span>
      <ul className="flex gap-2">
        {ROOM_OPTIONS.map((option) => {
          const active = selected.has(option.value);
          const rooms = active ? (filters.rooms ?? []).filter((r) => r !== option.value) : [...(filters.rooms ?? []), option.value].sort((a, b) => a - b);
          return (
            <li key={option.value} className="shrink-0">
              <ListingLink
                href={buildPropertiesHref({ ...filters, rooms: rooms.length ? rooms : undefined })}
                aria-current={active ? "true" : undefined}
                aria-label={`${option.label}${active ? " – премахни" : ""}`}
                className={cn(
                  "inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white text-charcoal hover:border-primary/40"
                )}
              >
                {active && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
                {option.short}
              </ListingLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
