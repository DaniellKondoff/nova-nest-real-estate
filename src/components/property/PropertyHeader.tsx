import React from "react";
import { BedDouble, Layers, MapPin, Ruler, Tag } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";
import { formatPrice, isNewProperty } from "./utils";
import ShareButton from "@/components/property/ShareButton";

export interface PropertyHeaderProps {
  property: PropertyWithDetails;
}

/** Title, badges, location, price and a key-facts strip – server component. */
export default function PropertyHeader({ property }: PropertyHeaderProps): React.ReactElement {
  const p = property.property;
  const neighborhood = property.neighborhood;
  const isRent = p.operation_type === "rent";
  const isNew = p.is_new || isNewProperty(p.created_at);
  const hasPrice = typeof p.price_eur === "number" && p.price_eur > 0;
  const pricePerSqm =
    !isRent && hasPrice && typeof p.area_sqm === "number" && p.area_sqm > 0
      ? Math.round(p.price_eur! / p.area_sqm)
      : null;

  const facts = [
    typeof p.area_sqm === "number" && p.area_sqm > 0 ? { icon: Ruler, label: "Площ", value: `${p.area_sqm} m²` } : null,
    typeof p.rooms === "number" && p.rooms > 0 ? { icon: BedDouble, label: "Стаи", value: String(p.rooms) } : null,
    typeof p.floor === "number"
      ? {
          icon: Layers,
          label: "Етаж",
          value: p.floor === 0 ? "Партер" : typeof p.total_floors === "number" ? `${p.floor} от ${p.total_floors}` : String(p.floor),
        }
      : null,
    property.category?.name_bg ? { icon: Tag, label: "Тип", value: property.category.name_bg } : null,
  ].filter(Boolean) as Array<{ icon: typeof Ruler; label: string; value: string }>;

  return (
    <header>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          {isRent ? "Под наем" : "За продажба"}
        </span>
        {isNew && (
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">Ново</span>
        )}
      </div>

      <h1 className="text-[clamp(1.5rem,1.1rem+1.8vw,2.25rem)] font-bold leading-tight text-primary text-balance break-words">
        {p.title_bg}
      </h1>

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-charcoal/75">
        <MapPin className="h-5 w-5 shrink-0 text-accent-dark" aria-hidden="true" />
        <span className="truncate">
          {neighborhood?.name_bg ? `кв. ${neighborhood.name_bg}, Стара Загора` : "Стара Загора"}
        </span>
      </p>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold text-primary sm:text-4xl">
            {hasPrice ? formatPrice(p.price_eur) : "Цена при запитване"}
            {isRent && hasPrice && <span className="text-lg font-medium text-charcoal/60"> / месец</span>}
          </p>
          {pricePerSqm && (
            <p className="mt-1 text-sm text-charcoal/60">
              {new Intl.NumberFormat("bg-BG").format(pricePerSqm)} €/m²
            </p>
          )}
        </div>
        <ShareButton title={p.title_bg} />
      </div>

      {facts.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6 sm:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-2 rounded-xl bg-gray-light p-3 min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-subtle">
                <Icon className="h-5 w-5 text-accent-dark" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-charcoal/60">{label}</dt>
                <dd className="font-semibold leading-snug text-primary">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}
