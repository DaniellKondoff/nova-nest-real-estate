import React from "react";
import { MapPin } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";
import { displayTitle, neighborhoodLabel, propertyHeadline } from "@/lib/seo/property-metadata";
import { formatPrice, isNewProperty } from "./utils";
import ShareButton from "@/components/property/ShareButton";

export interface PropertyHeaderProps {
  property: PropertyWithDetails;
}

const dateFormat = new Intl.DateTimeFormat("bg-BG", { day: "numeric", month: "long", year: "numeric" });

/**
 * Summary header – server component.
 * Fact-based H1 (matches the <title>), the admin headline as a subtitle, location, listing meta and price.
 * Mobile: stacked under the gallery. lg+: title left, price right, above the gallery.
 */
export default function PropertyHeader({ property }: PropertyHeaderProps): React.ReactElement {
  const p = property.property;
  const isRent = p.operation_type === "rent";
  const isNew = p.is_new || isNewProperty(p.created_at);
  const hasPrice = typeof p.price_eur === "number" && p.price_eur > 0;
  const pricePerSqm =
    !isRent && hasPrice && typeof p.area_sqm === "number" && p.area_sqm > 0 ? Math.round(p.price_eur! / p.area_sqm) : null;
  const headline = propertyHeadline(property);
  const subtitle = displayTitle(p.title_bg);
  const nbh = neighborhoodLabel(property.neighborhood?.name_bg);
  const updated = p.updated_at ?? p.created_at;

  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            {isRent ? "Под наем" : "За продажба"}
          </span>
          {isNew && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">Ново</span>
          )}
        </div>

        <h1 className="text-[clamp(1.5rem,1.15rem+1.5vw,2.25rem)] font-bold leading-tight text-primary text-balance break-words">
          {headline}
        </h1>
        {subtitle.toLowerCase() !== headline.toLowerCase() && (
          <p className="mt-1.5 text-base text-charcoal/80 sm:text-lg">{subtitle}</p>
        )}

        <p className="mt-3 flex min-w-0 items-center gap-1.5 text-charcoal/75">
          <MapPin className="h-5 w-5 shrink-0 text-accent-dark" aria-hidden="true" />
          <span className="truncate">{nbh ? `${nbh}, Стара Загора` : "Стара Загора"}</span>
        </p>
        <p className="mt-1 text-sm text-charcoal/60">
          Обява № {p.id}
          {updated && (
            <>
              {" · "}Обновена <time dateTime={updated}>{dateFormat.format(new Date(updated))}</time>
            </>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-end justify-between gap-4 border-t border-border pt-4 lg:flex-col lg:items-end lg:border-0 lg:pt-0 lg:text-right">
        <div>
          <p className="text-3xl font-bold text-primary sm:text-4xl">
            {hasPrice ? formatPrice(p.price_eur) : "Цена при запитване"}
            {isRent && hasPrice && <span className="text-lg font-medium text-charcoal/60"> / месец</span>}
          </p>
          {(pricePerSqm || p.price_bgn) && (
            <p className="mt-1 text-sm text-charcoal/60">
              {pricePerSqm && <>{new Intl.NumberFormat("bg-BG").format(pricePerSqm)} €/m²</>}
              {pricePerSqm && p.price_bgn ? " · " : null}
              {p.price_bgn ? <>{new Intl.NumberFormat("bg-BG").format(p.price_bgn)} лв.</> : null}
            </p>
          )}
        </div>
        <ShareButton title={headline} />
      </div>
    </header>
  );
}
