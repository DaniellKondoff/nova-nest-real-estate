import React from "react";
import type { Tables } from "@/types/database.generated";
import { Check } from "lucide-react";

export type PropertyFeature = Tables<"property_features">;

export interface PropertyFeaturesProps {
  features?: PropertyFeature[];
}

export default function PropertyFeatures({ features }: PropertyFeaturesProps): React.ReactElement | null {
  const list = features ?? [];
  if (list.length === 0) return null;

  return (
    <section>
      <h2 className="text-[#1a2642] font-bold text-2xl mb-8 flex items-center gap-3">
        <div className="h-1 w-8 bg-[#d4af37] rounded-full"></div>
        Характеристики и възможности
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((f) => (
          <div key={f.id} className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 px-5 py-4 transition-all duration-300 hover:border-[#d4af37] hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-100 rounded-full">
                <Check className="h-4 w-4 text-green-600" aria-hidden />
              </div>
              <div className="text-[#2d3748] font-medium">{f.name_bg}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


