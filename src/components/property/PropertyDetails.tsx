import React from "react";
import type { PropertyWithDetails } from "@/types/property";
import { Square, BedDouble, Bed, Bath, Building2, Calendar, Home as HomeIcon, MapPin, Layers, Building } from "lucide-react";
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
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#d4af37]/10 rounded-lg">
          <Icon className="h-6 w-6 text-[#d4af37]" aria-hidden />
        </div>
        <div>
          <div className="text-gray-600 text-sm font-medium">{label}</div>
          <div className="text-[#1a2642] text-lg font-semibold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetails({ property }: PropertyDetailsProps): React.ReactElement | null {
  const p = property.property;
  const n = property.neighborhood;
  const c = property.category;
  const features = property.features || [];

  const items: DetailItemProps[] = [];

  // Building Type from categories - Make this more prominent by putting it first
  if (c?.name_bg) items.push({ label: "Тип имот", value: c.name_bg, icon: Building });
  
  // Building Type Features - Look for buildingType category features
  const buildingTypeFeatures = features.filter(f => f.category === "buildingType");
  buildingTypeFeatures.forEach(feature => {
    items.push({ label: feature.name_bg, value: "Да", icon: Building2 });
  });
  
  // Basic property details
  if (typeof p.area_sqm === "number") items.push({ label: "Площ", value: formatArea(p.area_sqm), icon: Square });
  if (typeof p.rooms === "number") items.push({ label: "Стаи", value: String(p.rooms), icon: BedDouble });
  if (typeof p.bedrooms === "number") items.push({ label: "Спални", value: String(p.bedrooms), icon: Bed });
  if (typeof p.bathrooms === "number") items.push({ label: "Бани", value: String(p.bathrooms), icon: Bath });
  
  // Building information - very important for customers
  if (typeof p.floor === "number") items.push({ label: "Етаж", value: formatFloor(p.floor, p.total_floors ?? null), icon: Building2 });
  if (typeof p.total_floors === "number") items.push({ label: "Общо етажи", value: `${p.total_floors} етажа`, icon: Layers });
  if (typeof p.year_built === "number") items.push({ label: "Година на строеж", value: formatYear(p.year_built), icon: Calendar });
  
  // Location
  if (n?.name_bg) items.push({ label: "Квартал", value: n.name_bg, icon: MapPin });

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-[#1a2642] font-bold text-2xl mb-8 flex items-center gap-3">
        <div className="h-1 w-8 bg-[#d4af37] rounded-full"></div>
        Детайли на имота
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <DetailItem key={idx} {...item} />
        ))}
      </div>
    </section>
  );
}


