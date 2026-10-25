import React from "react";
import { Bus, Car, Clock, Footprints, Hospital, MapPin, School, ShoppingBag, Users } from "lucide-react";
import type { Neighborhood } from "@/lib/queries/neighborhoods";
import { Section, SectionHeading } from "@/components/ui/section";

interface NeighborhoodInfoProps {
  neighborhood: Neighborhood;
}

interface Amenities {
  schools?: string[];
  shopping?: string[];
  medical?: string[];
  transport?: {
    bus_lines?: string[];
    parking?: "free" | "paid" | "mixed";
    walkability?: "high" | "medium" | "low";
  };
}

const WALKABILITY: Record<string, string> = {
  high: "Висока пешеходна достъпност",
  medium: "Средна пешеходна достъпност",
  low: "Ниска пешеходна достъпност",
};
const PARKING: Record<string, string> = {
  free: "Безплатно паркиране",
  paid: "Платено паркиране",
  mixed: "Смесено паркиране",
};

const LIVING = [
  { icon: MapPin, title: "Стратегическо местоположение", text: "Лесен достъп до центъра на града и основните транспортни артерии." },
  { icon: Users, title: "Спокойна среда", text: "Подходящо място за семейства с деца – спокойствие и безопасност." },
  { icon: Clock, title: "Бърз достъп", text: "Близо до училища, магазини и медицински заведения." },
];

/** Neighborhood details (about, amenities, living) – server component. */
export default function NeighborhoodInfo({ neighborhood }: NeighborhoodInfoProps) {
  const amenities: Amenities = (neighborhood.amenities as Amenities) || {};
  const transport = amenities.transport || {};

  const lists = [
    { key: "schools", title: "Училища", icon: School, items: amenities.schools },
    { key: "shopping", title: "Търговски центрове", icon: ShoppingBag, items: amenities.shopping },
    { key: "medical", title: "Медицински заведения", icon: Hospital, items: amenities.medical },
  ].filter((l) => l.items && l.items.length > 0);

  return (
    <Section aria-labelledby="neighborhood-about">
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-2">
          <SectionHeading
            id="neighborhood-about"
            eyebrow="За квартала"
            title={`Живот в ${neighborhood.name_bg}`}
            align="left"
            className="mb-4 md:mb-6"
          />
          <p className="leading-relaxed text-charcoal/80 sm:text-lg">
            {neighborhood.description ||
              `Квартал ${neighborhood.name_bg} е един от привлекателните райони в Стара Загора, с добра комбинация от удобства, транспортна свързаност и спокойна жилищна среда.`}
          </p>
          <ul className="mt-6 space-y-4">
            {LIVING.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                  <Icon className="h-5 w-5 text-accent-dark" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-primary">{title}</h3>
                  <p className="text-sm text-charcoal/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
          {lists.map(({ key, title, icon: Icon, items }) => (
            <div key={key} className="rounded-card border border-border bg-white p-5 shadow-card">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-primary">
                <Icon className="h-5 w-5 text-accent-dark" aria-hidden="true" />
                {title}
              </h3>
              <ul className="space-y-1.5 text-charcoal/80">
                {items!.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-charcoal/40" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-primary">
              <Bus className="h-5 w-5 text-accent-dark" aria-hidden="true" />
              Транспорт
            </h3>
            {transport.bus_lines && transport.bus_lines.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5" aria-label="Автобусни линии">
                {transport.bus_lines.map((line, i) => (
                  <span key={i} className="rounded-full bg-accent/15 px-2.5 py-0.5 text-sm font-medium text-primary">
                    {line}
                  </span>
                ))}
              </div>
            )}
            <p className="flex items-center gap-2 text-charcoal/80">
              <Car className="h-4 w-4 text-charcoal/40" aria-hidden="true" />
              {PARKING[transport.parking ?? ""] ?? "Паркиране на разположение"}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-charcoal/80">
              <Footprints className="h-4 w-4 text-charcoal/40" aria-hidden="true" />
              {WALKABILITY[transport.walkability ?? ""] ?? "Добра пешеходна достъпност"}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
