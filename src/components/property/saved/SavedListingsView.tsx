import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";
import PropertyCard, { getPrimaryImage, getPropertyHref } from "@/components/property/PropertyCard";
import { formatPrice } from "@/components/property/utils";
import { neighborhoodLabel, propertyHeadline } from "@/lib/seo/property-metadata";
import { cn } from "@/lib/utils";

/** Listings that are no longer on offer stay visible (dimmed) so the buyer knows what happened */
const STATUS_RIBBONS: Record<string, string> = {
  sold: "Продаден",
  rented: "Отдаден",
  under_offer: "Резервиран",
};

const CARD_SIZES = "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

function priceOf(item: PropertyWithDetails): number | null {
  const price = item.property.price_eur;
  return typeof price === "number" && price > 0 ? price : null;
}

function pricePerSqm(item: PropertyWithDetails): number | null {
  const price = priceOf(item);
  const area = item.property.area_sqm;
  // €/м² only makes sense for sales
  return price && item.property.operation_type !== "rent" && typeof area === "number" && area > 0
    ? Math.round(price / area)
    : null;
}

function minOf(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v !== null);
  return nums.length > 1 ? Math.min(...nums) : null; // highlighting needs something to compare against
}

const numberFormat = new Intl.NumberFormat("bg-BG");

interface Row {
  label: string;
  values: Array<{ text: string; best?: boolean }>;
}

function buildRows(items: PropertyWithDetails[]): Row[] {
  const prices = items.map(priceOf);
  const perSqm = items.map(pricePerSqm);
  const minPrice = minOf(prices);
  const minPerSqm = minOf(perSqm);

  return [
    {
      label: "Цена",
      values: items.map((item, i) => ({
        text: prices[i] ? `${formatPrice(prices[i])}${item.property.operation_type === "rent" ? " / мес." : ""}` : "При запитване",
        best: prices[i] !== null && prices[i] === minPrice,
      })),
    },
    {
      label: "€/м²",
      values: perSqm.map((v) => ({ text: v ? `${numberFormat.format(v)} €` : "–", best: v !== null && v === minPerSqm })),
    },
    {
      label: "Площ",
      values: items.map(({ property: p }) => ({ text: typeof p.area_sqm === "number" && p.area_sqm > 0 ? `${Math.round(p.area_sqm)} м²` : "–" })),
    },
    {
      label: "Стаи",
      values: items.map(({ property: p }) => ({ text: typeof p.rooms === "number" && p.rooms > 0 ? String(p.rooms) : "–" })),
    },
    {
      label: "Етаж",
      values: items.map(({ property: p }) => ({
        text:
          typeof p.floor === "number"
            ? typeof p.total_floors === "number" && p.total_floors > 0
              ? `${p.floor} от ${p.total_floors}`
              : String(p.floor)
            : "–",
      })),
    },
    {
      label: "Квартал",
      values: items.map((item) => ({ text: neighborhoodLabel(item.neighborhood?.name_bg) ?? "–" })),
    },
    {
      label: "Вид",
      values: items.map((item) => ({ text: item.category?.name_bg ?? "–" })),
    },
  ];
}

/** Side-by-side comparison; on phones it scrolls sideways with the labels pinned */
function ComparisonTable({ items }: { items: PropertyWithDetails[] }) {
  const rows = buildRows(items);
  return (
    <section aria-labelledby="compare-title" className="mt-10 md:mt-14">
      <h2 id="compare-title" className="text-h3 font-bold text-primary">
        Сравнение
      </h2>
      <p className="mt-1 text-sm text-charcoal/70">
        Най-ниската цена и цена на м² са <span className="font-semibold text-accent-dark">маркирани</span>.
      </p>

      <div className="-mx-4 mt-4 overflow-x-auto overscroll-x-contain px-4 no-scrollbar sm:mx-0 sm:px-0">
        <table className="w-max min-w-full border-separate border-spacing-0 overflow-hidden rounded-card border border-border bg-white text-sm shadow-subtle">
          <caption className="sr-only">Сравнение на избраните имоти</caption>
          <thead>
            <tr>
              <td className="sticky left-0 z-10 w-24 border-b border-r border-border bg-white sm:w-32" />
              {items.map((item) => {
                const { url, alt } = getPrimaryImage(item);
                return (
                  <th key={item.property.id} scope="col" className="min-w-[9.5rem] max-w-[12rem] border-b border-border p-3 text-left align-top font-normal">
                    <Link href={getPropertyHref(item.property)} className="group block focus-visible:outline-none">
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-gray-light">
                        {url ? (
                          <Image src={url} alt={alt} fill sizes="192px" className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Building2 className="h-6 w-6 text-accent/70" aria-hidden="true" />
                          </span>
                        )}
                      </span>
                      <span className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-primary group-hover:text-accent-dark group-focus-visible:underline">
                        {propertyHeadline(item)}
                      </span>
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row.label} className={cn(r % 2 === 1 && "bg-gray-light/60")}>
                <th
                  scope="row"
                  className={cn(
                    "sticky left-0 z-10 border-r border-border px-3 py-3 text-left font-medium text-charcoal/75",
                    r % 2 === 1 ? "bg-gray-light" : "bg-white"
                  )}
                >
                  {row.label}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={items[i].property.id}
                    className={cn("px-3 py-3 tabular-nums", v.best ? "font-semibold text-accent-dark" : "text-primary")}
                  >
                    {v.text}
                    {v.best && <span className="sr-only"> (най-ниска)</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Saved listings (in saved order) + comparison – rendered by SavedListingsClient from the getSavedListings action data */
export default function SavedListingsView({ items }: { items: PropertyWithDetails[] }) {
  if (items.length === 0) return null;
  return (
    <>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" aria-label="Избрани имоти">
        {items.map((item, idx) => {
          const ribbon = STATUS_RIBBONS[item.property.status as string];
          return (
            <li key={item.property.id} className="relative">
              <PropertyCard
                property={item}
                headingLevel="h2"
                priority={idx === 0}
                sizes={CARD_SIZES}
                className={cn(ribbon && "opacity-75 grayscale-[35%]")}
              />
              {ribbon && (
                <span className="pointer-events-none absolute left-3 top-14 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent shadow-card">
                  {ribbon}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {items.length > 1 && <ComparisonTable items={items} />}
    </>
  );
}
