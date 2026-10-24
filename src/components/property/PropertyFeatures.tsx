import React from "react";
import type { Tables } from "@/types/database.generated";
import { Check } from "lucide-react";
import DetailSection from "./DetailSection";

export type PropertyFeature = Tables<"property_features">;

export interface PropertyFeaturesProps {
  features?: PropertyFeature[];
}

const CATEGORY_LABELS: Record<string, string> = {
  interior: "Интериор",
  exterior: "Екстериор",
  building: "Сграда",
  location: "Местоположение",
  buildingType: "Тип сграда",
};

export default function PropertyFeatures({ features }: PropertyFeaturesProps): React.ReactElement | null {
  const list = features ?? [];
  if (list.length === 0) return null;

  const byCategory = list.reduce<Record<string, PropertyFeature[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <DetailSection title="Характеристики" id="features">
      <div className="space-y-6">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-charcoal/60">
              {CATEGORY_LABELS[category] || category}
            </h3>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((f) => (
                <li key={f.id} className="flex items-center gap-2.5 text-charcoal">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15">
                    <Check className="h-3.5 w-3.5 text-accent-dark" aria-hidden />
                  </span>
                  {f.name_bg}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}
