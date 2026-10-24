import React from "react";
import Link from "next/link";
import type { PropertyWithDetails } from "@/types/property";
import { getLandingData } from "@/lib/queries/landing-data";
import {
  OPERATION_LANDINGS,
  filterListings,
  neighborhoodCategoryPath,
  neighborhoodPath,
  operationCategoryPath,
  operationPath,
  type OperationType,
} from "@/lib/seo/landing";
import DetailSection from "./DetailSection";

/**
 * "Още подобни имоти" – links from a listing to its neighborhood and category landing pages.
 * Internal links with descriptive anchors are how the landing pages earn ranking signals.
 */
export default async function PropertyLandingLinks({ details }: { details: PropertyWithDetails }) {
  const { property, neighborhood } = details;
  const { categories, listings } = await getLandingData();
  const category = categories.find((c) => c.id === property.category_id);
  const operation: OperationType = property.operation_type === "rent" ? "rent" : "sale";
  const op = OPERATION_LANDINGS[operation];

  const candidates = [
    neighborhood && category
      ? { href: neighborhoodCategoryPath(neighborhood, category), label: `${category.plural} в ${neighborhood.name_bg}`, scope: { neighborhoodId: neighborhood.id, categoryId: category.id } }
      : null,
    neighborhood ? { href: neighborhoodPath(neighborhood), label: `Всички имоти в ${neighborhood.name_bg}`, scope: { neighborhoodId: neighborhood.id } } : null,
    category
      ? { href: operationCategoryPath(operation, category), label: `${category.plural} ${op.label} в Стара Загора`, scope: { operationType: operation, categoryId: category.id } }
      : null,
    { href: operationPath(operation), label: `${op.title} в Стара Загора`, scope: { operationType: operation } },
  ];

  // Landing pages without listings are 404/noindex – never link to them
  const links = candidates
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map((c) => ({ ...c, count: filterListings(listings, c.scope).length }))
    .filter((c) => c.count > 0);

  if (links.length === 0) return null;

  return (
    <DetailSection title="Още подобни имоти" id="more-listings">
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-primary transition-colors hover:border-accent hover:bg-accent/5"
            >
              {link.label}
              <span className="rounded-full bg-gray-light px-2 py-0.5 text-xs font-semibold text-charcoal/70">{link.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}
