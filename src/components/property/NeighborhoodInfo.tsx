import React from "react";
import Link from "next/link";
import { ArrowRight, Bus, Hospital, School, ShoppingCart, Trees } from "lucide-react";
import type { StaraZagoraNeighborhood } from "@/types/search";
import DetailSection from "./DetailSection";

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

const AMENITY_BLOCKS: Array<{ key: keyof Amenities; title: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "schools", title: "Училища", icon: School },
  { key: "shopping", title: "Магазини", icon: ShoppingCart },
  { key: "medical", title: "Медицински услуги", icon: Hospital },
  { key: "transport", title: "Транспорт", icon: Bus },
  { key: "parks", title: "Паркове", icon: Trees },
];

/** "About the neighborhood" block on the property page – indexable local content + internal link. */
export default function NeighborhoodInfo({ neighborhood }: NeighborhoodInfoProps): React.ReactElement | null {
  if (!neighborhood) return null;

  const amenities = (neighborhood.amenities as unknown as Amenities | null) ?? null;
  const blocks = AMENITY_BLOCKS.filter((b) => Array.isArray(amenities?.[b.key]) && amenities![b.key]!.length > 0);

  if (!neighborhood.description && blocks.length === 0) return null;

  return (
    <DetailSection title={`За квартал ${neighborhood.name_bg}`} id="neighborhood">
      {neighborhood.description && <p className="leading-relaxed text-charcoal">{neighborhood.description}</p>}

      {blocks.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {blocks.map(({ key, title, icon: Icon }) => (
            <div key={key}>
              <h3 className="flex items-center gap-2 font-semibold text-primary">
                <Icon className="h-5 w-5 text-accent-dark" aria-hidden="true" />
                {title}
              </h3>
              <ul className="mt-2 space-y-1 pl-7 text-charcoal/80">
                {amenities![key]!.map((item, i) => (
                  <li key={i} className="list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {neighborhood.slug && (
        <Link
          href={`/${neighborhood.slug}/`}
          className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-primary-light"
        >
          Всички имоти в кв. {neighborhood.name_bg}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </DetailSection>
  );
}
