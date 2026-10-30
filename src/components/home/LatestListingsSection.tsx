/**
 * LatestListingsSection – server component, zero client JS.
 *
 * Mobile-first: on phones the cards are a native scroll-snap row (next card peeks in) that ends
 * in a "Вижте всички" tile; from `sm` it becomes a 2-column grid, from `lg` a 3×2 grid.
 * Gives the home page crawlable links to fresh listings and to the sale/rent landing pages.
 */

import React from "react";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { getCachedLatestListings } from "@/lib/queries/property-listings";
import { getSiteNavLinks } from "@/lib/seo/nav-links";
import { OPERATION_LANDINGS } from "@/lib/seo/landing";

const LATEST_COUNT = 6;
const CARD_SIZES = "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 85vw";
const SHORT_OPERATION_LABELS = { sale: "Продажба", rent: "Наем" } as const;

function propertiesLabel(n: number): string {
  return n === 1 ? "1 имот" : `${n} имота`;
}

export default async function LatestListingsSection(): Promise<React.ReactElement | null> {
  const [latest, nav] = await Promise.all([
    getCachedLatestListings(LATEST_COUNT).catch(() => null),
    getSiteNavLinks(),
  ]);

  if (!latest || latest.properties.length === 0) return null;
  const { properties, total } = latest;
  const allLabel = `Вижте всички ${propertiesLabel(total)}`;

  // Operation landing pages first, then their category pages ("Апартаменти", or "Апартаменти под наем" when both operations exist)
  const bothOperations = nav.operations.length > 1;
  const shortcuts = [
    ...nav.operations.map((op) => ({ href: op.href, short: SHORT_OPERATION_LABELS[op.operation], label: op.label, count: op.count })),
    ...nav.operations.flatMap((op) =>
      op.categories.map((c) => {
        const label = bothOperations ? `${c.label} ${OPERATION_LANDINGS[op.operation].label}` : c.label;
        return { href: c.href, short: label, label, count: c.count };
      })
    ),
  ];

  return (
    <Section id="latest" spacing="tight" aria-labelledby="latest-title" className="scroll-mt-[var(--header-h)]">
      <div className="reveal flex items-end justify-between gap-6">
        <SectionHeading
          id="latest-title"
          align="left"
          eyebrow="Актуални предложения"
          title="Нови обяви в Стара Загора"
          description="Последно добавените имоти за продажба и под наем."
          className="mb-5 md:mb-8"
        />
        <Link
          href="/properties/"
          className="group mb-8 hidden min-h-11 shrink-0 items-center gap-2 font-semibold text-primary transition-colors hover:text-accent-dark lg:inline-flex"
        >
          Всички имоти
          <span className="rounded-full bg-gray-light px-2 py-0.5 text-xs font-semibold text-charcoal/75">{total}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>

      {/* Landing-page shortcuts: one non-wrapping row on phones */}
      {shortcuts.length > 0 && (
        <ul
          aria-label="Разгледайте по вид имот"
          className="-mx-4 mb-6 flex snap-x scroll-px-4 gap-2 overflow-x-auto overscroll-x-contain px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0 md:mb-8"
        >
          {shortcuts.map((s) => (
            <li key={s.href} className="shrink-0 snap-start">
              <Link
                href={s.href}
                className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-white px-4 text-sm font-medium text-primary transition-colors hover:border-accent hover:bg-accent/5"
              >
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.label}</span>
                <span className="rounded-full bg-gray-light px-2 py-0.5 text-xs font-semibold text-charcoal/75">
                  {s.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Phone: swipeable row · sm: 2 columns · lg: 3×2 grid */}
      <ul
        aria-label="Нови обяви"
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
      >
        {properties.map((item) => (
          <li key={item.property.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
            <PropertyCard property={item} sizes={CARD_SIZES} />
          </li>
        ))}

        {/* End-of-swipe action (phones only; larger screens have the button below) */}
        <li className="w-[85%] shrink-0 snap-start sm:hidden">
          <Link
            href="/properties/"
            className="group relative flex h-full min-h-64 flex-col items-center justify-center gap-4 overflow-hidden rounded-card bg-primary p-6 text-center text-white shadow-card"
          >
            <span aria-hidden="true" className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-2xl" />
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15">
              <Building2 className="h-7 w-7 text-accent" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold">{allLabel}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              Към каталога
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </li>
      </ul>

      <div className="mt-6 flex justify-center md:mt-10">
        <Button asChild variant="outline" size="lg" className="group w-full lg:w-auto">
          <Link href="/properties/">
            {allLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
