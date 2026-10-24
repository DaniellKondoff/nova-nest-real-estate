import React from "react";
import type { PropertyWithDetails } from "@/types/property";
import { Bath, Bed, BedDouble, Building, Building2, Calendar, Layers, MapPin, Navigation, Square } from "lucide-react";
import { formatArea, formatFloor, formatYear } from "./utils";
import DetailSection from "./DetailSection";

export interface PropertyDetailsProps {
  property: PropertyWithDetails;
}

interface DetailItemProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  wide?: boolean;
}

export default function PropertyDetails({ property }: PropertyDetailsProps): React.ReactElement | null {
  const p = property.property;
  const n = property.neighborhood;
  const c = property.category;
  const features = property.features || [];

  const items: DetailItemProps[] = [];

  if (c?.name_bg) items.push({ label: "Тип имот", value: c.name_bg, icon: Building });
  features
    .filter((f) => f.category === "buildingType")
    .forEach((feature) => items.push({ label: "Конструкция", value: feature.name_bg, icon: Building2 }));

  if (typeof p.area_sqm === "number") items.push({ label: "Площ", value: formatArea(p.area_sqm), icon: Square });
  if (typeof p.rooms === "number") items.push({ label: "Стаи", value: String(p.rooms), icon: BedDouble });
  if (typeof p.bedrooms === "number") items.push({ label: "Спални", value: String(p.bedrooms), icon: Bed });
  if (typeof p.bathrooms === "number") items.push({ label: "Бани", value: String(p.bathrooms), icon: Bath });
  if (typeof p.floor === "number") items.push({ label: "Етаж", value: formatFloor(p.floor, p.total_floors ?? null), icon: Layers });
  if (typeof p.year_built === "number") items.push({ label: "Година на строеж", value: formatYear(p.year_built), icon: Calendar });
  if (n?.name_bg) items.push({ label: "Квартал", value: n.name_bg, icon: MapPin });
  if (p.address_bg) items.push({ label: "Адрес", value: p.address_bg, icon: Navigation, wide: true });

  if (items.length === 0) return null;

  return (
    <DetailSection title="Детайли на имота" id="details">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {items.map(({ label, value, icon: Icon, wide }, idx) => (
          <div
            key={`${label}-${idx}`}
            className={`flex gap-2 rounded-xl border border-border p-3 sm:p-4 ${wide ? "col-span-2 flex-row items-center gap-3 md:col-span-3" : "flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-3"}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:h-10 sm:w-10">
              <Icon className="h-5 w-5 text-accent-dark" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-charcoal/60 sm:text-sm">{label}</dt>
              <dd className="mt-0.5 font-semibold leading-snug text-primary">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </DetailSection>
  );
}
