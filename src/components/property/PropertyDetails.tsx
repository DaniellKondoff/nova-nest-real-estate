import React from "react";
import type { PropertyWithDetails } from "@/types/property";
import { formatPrice } from "./utils";
import DetailSection from "./DetailSection";

export interface PropertyDetailsProps {
  property: PropertyWithDetails;
}

/** Reduce "град Стара Загора, Кв.Казански " to "казански" for duplicate checks */
function placeKey(value: string): string {
  return value
    .toLocaleLowerCase("bg")
    .replace(/стара загора|град|гр\.|село|с\.|кв\.|квартал/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Address only when it says more than the neighborhood (admins often repeat the district or the city) */
function usefulAddress(address: string | null, neighborhood: string | null | undefined): string | null {
  const clean = address?.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  const a = placeKey(clean);
  const n = neighborhood ? placeKey(neighborhood) : "";
  if (!a || (n && (a.includes(n) || n.includes(a)))) return null;
  return clean;
}

/**
 * Spec table for everything not already in the key-facts strip – server component.
 * Plain <dl> rows read well on mobile and are easy for crawlers to parse.
 */
export default function PropertyDetails({ property }: PropertyDetailsProps): React.ReactElement | null {
  const p = property.property;
  const n = property.neighborhood;
  const isVillage = /^(село|с\.)/i.test(n?.name_bg ?? "");

  const rows: Array<[string, string]> = [];
  if (property.category?.name_bg) rows.push(["Тип имот", property.category.name_bg]);
  rows.push(["Сделка", p.operation_type === "rent" ? "Наем" : "Продажба"]);
  if (!isVillage && n?.name_bg) rows.push(["Квартал", n.name_bg]);
  if (isVillage && n?.name_bg) rows.push(["Населено място", n.name_bg.replace(/^(село|с\.)\s*/i, "")]);
  const address = usefulAddress(p.address_bg, n?.name_bg);
  if (address) rows.push(["Адрес", address]);
  if (typeof p.bedrooms === "number" && p.bedrooms > 0) rows.push(["Спални", String(p.bedrooms)]);
  if (typeof p.bathrooms === "number" && p.bathrooms > 0) rows.push(["Бани", String(p.bathrooms)]);
  if (typeof p.total_floors === "number" && typeof p.floor !== "number") rows.push(["Етажност", String(p.total_floors)]);
  if (p.operation_type !== "rent" && typeof p.price_eur === "number" && p.price_eur > 0 && p.area_sqm) {
    rows.push(["Цена на m²", formatPrice(Math.round(p.price_eur / p.area_sqm))]);
  }

  return (
    <DetailSection title="Детайли на имота" id="details">
      <dl className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 border-b border-border py-3">
            <dt className="text-charcoal/65">{label}</dt>
            <dd className="text-right font-semibold text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </DetailSection>
  );
}
