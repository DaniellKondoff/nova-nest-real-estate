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
    <header>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="inline-flex items-center rounded-full bg-[#d4af37] px-4 py-2 text-white text-sm font-medium">{op}</span>
        {isNew && <span className="inline-flex items-center rounded-full bg-[#1a2642] px-4 py-2 text-white text-sm font-semibold">НОВО</span>}
      </div>
      
      <h1 className="text-[#1a2642] font-bold leading-tight text-2xl md:text-3xl lg:text-4xl mb-3">{p.title_bg}</h1>
      
      {/* Building Type - Make it more prominent */}
      {property.category?.name_bg && (
        <div className="mb-3">
          <span className="inline-flex items-center rounded-lg bg-[#1a2642]/10 px-3 py-1.5 text-[#1a2642] text-sm font-semibold">
            {property.category.name_bg}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-2 text-gray-600 text-base md:text-lg mb-4">
        <MapPin className="h-5 w-5 text-[#1a2642]" aria-hidden />
        <span>{neighborhood?.name_bg ? `${neighborhood.name_bg}, Стара Загора` : "Стара Загора"}</span>
      </div>
      
      <div className="text-[#1a2642] font-bold text-3xl md:text-4xl lg:text-5xl">{price}</div>
    </header>
  );
}


