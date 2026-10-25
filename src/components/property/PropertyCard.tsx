import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, BedDouble, Layers, MapPin, Ruler } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";
import type { Tables } from "@/types/database.generated";
import { propertyPath } from "@/lib/seo/property-slug";
import { displayTitle } from "@/lib/seo/property-metadata";
import { cn } from "@/lib/utils";
import { formatPrice, isNewProperty } from "./utils";

export interface PropertyCardProps {
  property: PropertyWithDetails;
  /** For Next/Image LCP optimization (first row of a listing) */
  priority?: boolean;
  /** Heading level for the title (h2 on listing pages, h3 inside sections) */
  headingLevel?: "h2" | "h3";
  /** Override image `sizes` when the card is rendered in a different layout */
  sizes?: string;
  className?: string;
}

const DEFAULT_SIZES = "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export function getOperationTypeLabel(type: "sale" | "rent"): string {
  return type === "sale" ? "Продажба" : "Наем";
}

export function getPrimaryImage(property: PropertyWithDetails): { url: string | null; alt: string } {
  const primary = property.images.find((img) => img.is_primary) || property.images[0];
  return {
    url: primary?.url || null,
    alt: primary?.alt_text_bg || property.property.title_bg || "Имот",
  };
}

export function getPropertyHref(p: Pick<Tables<"properties">, "id" | "slug">): string {
  return propertyPath(p.id, p.slug);
}

function pluralRooms(n: number): string {
  return n === 1 ? "1 стая" : `${n} стаи`;
}

/**
 * PropertyCard – server component.
 * Whole card is clickable via a stretched title link (one accessible link per card).
 */
export default function PropertyCard({
  property,
  priority = false,
  headingLevel = "h3",
  sizes = DEFAULT_SIZES,
  className,
}: PropertyCardProps): React.ReactElement {
  const p = property.property;
  const op: "sale" | "rent" = (p.operation_type as string) === "rent" ? "rent" : "sale";
  const { url, alt } = getPrimaryImage(property);
  const showNew = p.is_new || isNewProperty(p.created_at);
  const neighborhoodName = property.neighborhood?.name_bg;
  const categoryName = property.category?.name_bg;
  const href = getPropertyHref(p);
  const Heading = headingLevel;

  const stats = [
    typeof p.area_sqm === "number" && p.area_sqm > 0
      ? { icon: Ruler, value: `${p.area_sqm} m²`, label: "Площ" }
      : null,
    typeof p.rooms === "number" && p.rooms > 0
      ? { icon: BedDouble, value: pluralRooms(p.rooms), label: "Стаи" }
      : null,
    typeof p.floor === "number" && p.floor > 0
      ? {
          icon: Layers,
          value: typeof p.total_floors === "number" && p.total_floors > 0 ? `${p.floor}/${p.total_floors} ет.` : `${p.floor} ет.`,
          label: "Етаж",
        }
      : null,
  ].filter(Boolean) as Array<{ icon: typeof Ruler; value: string; label: string }>;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-card",
        "transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99]",
        "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {url ? (
          <Image
            src={url}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary-light">
            <Building2 className="h-12 w-12 text-accent/70" aria-hidden="true" />
          </div>
        )}

        {/* Bottom gradient for price legibility */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {getOperationTypeLabel(op)}
          </span>
          {showNew && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              Ново
            </span>
          )}
        </div>

        {/* Price */}
        <p className="absolute bottom-3 left-4 right-4 text-xl font-bold text-white drop-shadow sm:text-2xl">
          {typeof p.price_eur === "number" && p.price_eur > 0 ? formatPrice(p.price_eur) : "Цена при запитване"}
          {op === "rent" && typeof p.price_eur === "number" && p.price_eur > 0 && (
            <span className="text-sm font-medium text-white/85"> / месец</span>
          )}
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="flex min-w-0 items-center gap-1.5 text-sm text-charcoal/70">
          <MapPin className="h-4 w-4 shrink-0 text-accent-dark" aria-hidden="true" />
          <span className="truncate">
            {neighborhoodName ? `кв. ${neighborhoodName}` : "Стара Загора"}
            {categoryName ? ` · ${categoryName}` : ""}
          </span>
        </p>

        <Heading className="mt-1.5 line-clamp-2 text-base font-semibold leading-snug text-primary sm:text-[17px]">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-primary-light"
          >
            {displayTitle(p.title_bg)}
          </Link>
        </Heading>

        {stats.length > 0 && (
          <dl className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-sm text-charcoal/80 [&:not(:first-child)]:mt-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex min-w-0 items-center gap-1.5">
                <dt className="sr-only">{label}</dt>
                <Icon className="h-4 w-4 shrink-0 text-primary/50" aria-hidden="true" />
                <dd className="truncate font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
