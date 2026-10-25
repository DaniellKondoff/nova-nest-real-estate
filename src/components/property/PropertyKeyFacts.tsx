import React from "react";
import { BedDouble, Building2, Calendar, Layers, Ruler } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";

type Fact = { icon: React.ComponentType<{ className?: string }>; label: string; value: string };

/** The facts buyers scan first. Mobile: swipeable chip row; sm+: even grid. Server component. */
export default function PropertyKeyFacts({ property }: { property: PropertyWithDetails }): React.ReactElement | null {
  const p = property.property;
  const construction = (property.features ?? []).find((f) => f.category === "buildingType")?.name_bg;

  const facts: Fact[] = [];
  if (typeof p.area_sqm === "number" && p.area_sqm > 0) facts.push({ icon: Ruler, label: "Площ", value: `${p.area_sqm} m²` });
  if (typeof p.rooms === "number" && p.rooms > 0) facts.push({ icon: BedDouble, label: "Стаи", value: String(p.rooms) });
  if (typeof p.floor === "number") {
    const floor = p.floor === 0 ? "Партер" : String(p.floor);
    facts.push({ icon: Layers, label: "Етаж", value: typeof p.total_floors === "number" ? `${floor} от ${p.total_floors}` : floor });
  }
  if (construction) facts.push({ icon: Building2, label: "Строителство", value: construction });
  if (typeof p.year_built === "number") facts.push({ icon: Calendar, label: "Година", value: String(p.year_built) });

  if (facts.length === 0) return null;

  return (
    <dl
      aria-label="Основни характеристики"
      className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] sm:overflow-visible sm:px-0"
    >
      {facts.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex shrink-0 snap-start items-center gap-3 rounded-card border border-border bg-white px-4 py-3 shadow-subtle"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-5 w-5 text-accent-dark" aria-hidden />
          </span>
          <div className="min-w-0">
            <dt className="text-xs text-charcoal/60">{label}</dt>
            <dd className="whitespace-nowrap font-semibold leading-snug text-primary">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
