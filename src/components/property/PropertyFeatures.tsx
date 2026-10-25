import React from "react";
import type { Tables } from "@/types/database.generated";
import { Check, MapPin } from "lucide-react";
import DetailSection from "./DetailSection";

export type PropertyFeature = Tables<"property_features">;

export interface PropertyFeaturesProps {
  features?: PropertyFeature[];
}

const CATEGORY_ORDER = ["interior", "building", "exterior"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  interior: "Интериор",
  exterior: "Екстериор",
  building: "Сграда",
};

/** Features as compact chips – server component. Building type lives in the key facts; "Близо до …" collapses to one line. */
export default function PropertyFeatures({ features }: PropertyFeaturesProps): React.ReactElement | null {
  const list = (features ?? []).filter((f) => f.category !== "buildingType");
  if (list.length === 0) return null;

  const byCategory = list.reduce<Record<string, PropertyFeature[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});
  const groups = [
    ...CATEGORY_ORDER.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => c !== "location" && !CATEGORY_ORDER.includes(c as (typeof CATEGORY_ORDER)[number])),
  ];
  const nearby = (byCategory.location ?? []).map((f) => f.name_bg.replace(/^близо до\s*/i, "").trim()).filter(Boolean);

  return (
    <DetailSection title="Характеристики" id="features">
      <div className="space-y-5">
        {groups.map((category) => (
          <div key={category}>
            <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-charcoal/60">
              {CATEGORY_LABELS[category] || category}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {byCategory[category].map((f) => (
                <li
                  key={f.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-gray-light px-3 py-1.5 text-sm font-medium text-primary"
                >
                  <Check className="h-4 w-4 text-accent-dark" aria-hidden />
                  {f.name_bg}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {nearby.length > 0 && (
          <p className="flex items-start gap-2 rounded-xl bg-accent/10 p-3 text-charcoal">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" aria-hidden />
            <span>
              <span className="font-semibold text-primary">Близо до: </span>
              {nearby.join(", ")}
            </span>
          </p>
        )}
      </div>
    </DetailSection>
  );
}
