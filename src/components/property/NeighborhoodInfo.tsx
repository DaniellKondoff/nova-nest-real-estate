import React from "react";
import type { StaraZagoraNeighborhood } from "@/types/search";
import { School, ShoppingCart, Hospital, Bus, Trees } from "lucide-react";

export interface NeighborhoodInfoProps {
  neighborhood: StaraZagoraNeighborhood | null;
}

type Amenities = {
  schools?: string[];
  shopping?: string[];
  medical?: string[];
  transport?: string[];
  parks?: string[];
};

export default function NeighborhoodInfo({ neighborhood }: NeighborhoodInfoProps): React.ReactElement | null {
  if (!neighborhood) return null;

  const amenities = (neighborhood.amenities as unknown as Amenities | null) ?? null;

  return (
    <section className="py-12">
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <h2 className="text-[#1a2642] font-semibold text-2xl">За квартала</h2>
        <h3 className="mt-1 text-gray-700 text-base">{neighborhood.name_bg}</h3>

        {neighborhood.description && (
          <p className="mt-4 text-[#2d3748] leading-relaxed">{neighborhood.description}</p>
        )}

        {amenities && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(amenities.schools) && amenities.schools.length > 0 && (
              <AmenityBlock title="Училища" icon={<School className="h-5 w-5" aria-hidden />} items={amenities.schools} />
            )}
            {Array.isArray(amenities.shopping) && amenities.shopping.length > 0 && (
              <AmenityBlock title="Магазини и търговски центрове" icon={<ShoppingCart className="h-5 w-5" aria-hidden />} items={amenities.shopping} />
            )}
            {Array.isArray(amenities.medical) && amenities.medical.length > 0 && (
              <AmenityBlock title="Медицински услуги" icon={<Hospital className="h-5 w-5" aria-hidden />} items={amenities.medical} />
            )}
            {Array.isArray(amenities.transport) && amenities.transport.length > 0 && (
              <AmenityBlock title="Транспорт" icon={<Bus className="h-5 w-5" aria-hidden />} items={amenities.transport} />
            )}
            {Array.isArray(amenities.parks) && amenities.parks.length > 0 && (
              <AmenityBlock title="Паркове и зелени площи" icon={<Trees className="h-5 w-5" aria-hidden />} items={amenities.parks} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function AmenityBlock({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[#1a2642] font-medium">
        {icon}
        <span>{title}</span>
      </div>
      <ul className="mt-2 list-disc pl-6 text-[#2d3748]">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}


