import React from "react";
import type { PropertyWithDetails } from "@/types/property";
import { Square, BedDouble, Bed, Bath, Building2, Calendar, Home as HomeIcon, MapPin } from "lucide-react";
import { formatArea, formatFloor, formatYear } from "./utils";

export interface PropertyDetailsProps {
  property: PropertyWithDetails;
}

interface DetailItemProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

function DetailItem({ label, value, icon: Icon }: DetailItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-[#1a2642]" aria-hidden />
        <div>
          <div className="text-gray-600 text-sm font-medium">{label}</div>
          <div className="text-[#1a2642] text-base font-semibold mt-0.5">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetails({ property }: PropertyDetailsProps): React.ReactElement | null {
  const p = property.property;
  const n = property.neighborhood;
  const c = property.category;

  const items: DetailItemProps[] = [];

  if (typeof p.area_sqm === "number") items.push({ label: "Площ", value: formatArea(p.area_sqm), icon: Square });
  if (typeof p.rooms === "number") items.push({ label: "Стаи", value: String(p.rooms), icon: BedDouble });
  if (typeof p.bedrooms === "number") items.push({ label: "Спални", value: String(p.bedrooms), icon: Bed });
  if (typeof p.bathrooms === "number") items.push({ label: "Бани", value: String(p.bathrooms), icon: Bath });
  if (typeof p.floor === "number") items.push({ label: "Етаж", value: formatFloor(p.floor, (p as any).total_floors ?? null), icon: Building2 });
  if (typeof p.year_built === "number") items.push({ label: "Година", value: formatYear(p.year_built), icon: Calendar });
  if (c?.name_bg) items.push({ label: "Тип имот", value: c.name_bg, icon: HomeIcon });
  if (n?.name_bg) items.push({ label: "Квартал", value: n.name_bg, icon: MapPin });

  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="text-[#1a2642] font-semibold text-2xl mb-6">Детайли</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <DetailItem key={idx} {...item} />
        ))}
      </div>
    </section>
  );
}


