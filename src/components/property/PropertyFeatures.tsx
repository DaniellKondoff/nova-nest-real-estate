import React from "react";
import type { Tables } from "@/types/database.generated";
import { Check } from "lucide-react";

export type PropertyFeature = Tables["public"]["Tables"]["property_features"]["Row"];

export interface PropertyFeaturesProps {
  features?: PropertyFeature[];
}

export default function PropertyFeatures({ features }: PropertyFeaturesProps): React.ReactElement | null {
  const list = features ?? [];
  if (list.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="text-[#1a2642] font-semibold text-2xl mb-6">Характеристики</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((f) => (
          <div key={f.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors duration-300 hover:border-[#d4af37]">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-[#1a2642]" aria-hidden />
              <div className="text-[#2d3748]">{f.name_bg}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


