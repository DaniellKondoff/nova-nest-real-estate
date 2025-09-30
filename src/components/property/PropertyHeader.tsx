import React from "react";
import { MapPin } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";
import { formatPrice, isNewProperty } from "./utils";

export interface PropertyHeaderProps {
  property: PropertyWithDetails;
}

export default function PropertyHeader({ property }: PropertyHeaderProps): React.ReactElement {
  const p = property.property;
  const neighborhood = property.neighborhood;

  const price = formatPrice(p.price_eur ?? null);
  const op = p.operation_type === "rent" ? "Наем" : "Продажба";
  const isNew = isNewProperty(p.created_at);

  return (
    <header className="mb-8">
      <h1 className="text-[#1a2642] font-bold leading-tight text-3xl md:text-4xl">{p.title_bg}</h1>
      <div className="mt-2 flex items-center gap-2 text-gray-600 text-base md:text-lg">
        <MapPin className="h-5 w-5 text-[#1a2642]" aria-hidden />
        <span>{neighborhood?.name_bg ? `${neighborhood.name_bg}, Стара Загора` : "Стара Загора"}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-[#d4af37]/90 px-3 py-1 text-white text-sm font-medium">{op}</span>
        {isNew && <span className="inline-flex items-center rounded-full bg-[#1a2642] px-3 py-1 text-white text-sm font-semibold">НОВО</span>}
      </div>
      <div className="mt-5 text-[#1a2642] font-bold text-4xl md:text-5xl">{price}</div>
    </header>
  );
}


