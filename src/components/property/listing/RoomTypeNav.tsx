import React from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { formatPrice } from "@/components/property/utils";
import { listingCountLabel } from "@/lib/seo/landing";
import { cn } from "@/lib/utils";

export interface RoomTypeTile {
  href: string;
  label: string;
  /** "1" … "4+"; omitted for the "all apartments" tile (shows an icon) */
  badge?: string;
  count: number;
  minPrice: number | null;
  active: boolean;
}

/**
 * "Двустайни · Тристайни …" – apartment landing pages by room count (server component, zero JS).
 * Phone: swipeable scroll-snap row with the next tile peeking in · sm+: one row of equal tiles.
 */
export default function RoomTypeNav({ tiles, label = "Апартаменти по брой стаи" }: { tiles: RoomTypeTile[]; label?: string }) {
  if (tiles.length < 2) return null;

  return (
    <nav aria-label={label} className="mt-6">
      <p className="mb-2.5 text-sm font-semibold text-primary">Брой стаи</p>
      <ul
        className="-mx-4 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto overscroll-x-contain px-4 pb-1 no-scrollbar sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0"
        style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}
      >
        {tiles.map((tile) => (
          <li key={tile.href} className="w-[42%] max-w-48 shrink-0 snap-start sm:w-auto sm:max-w-none">
            <Link
              href={tile.href}
              aria-current={tile.active ? "page" : undefined}
              className={cn(
                "group flex h-full min-h-16 items-center gap-3 rounded-card border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                tile.active
                  ? "border-primary bg-primary text-white shadow-card"
                  : "border-border bg-white text-primary shadow-subtle hover:border-accent hover:bg-accent/5"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold",
                  tile.active ? "bg-accent text-primary" : "bg-accent/15 text-accent-dark"
                )}
              >
                {tile.badge ?? <LayoutGrid className="h-5 w-5" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold leading-tight">{tile.label}</span>
                <span className={cn("mt-0.5 block truncate text-xs", tile.active ? "text-white/75" : "text-charcoal/70")}>
                  {listingCountLabel(tile.count)}
                  {tile.minPrice ? <span className="hidden md:inline"> · от {formatPrice(tile.minPrice)}</span> : null}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
