import { getLandingData } from "@/lib/queries/landing-data";
import { countByNeighborhood } from "@/lib/queries/listing-index";
import {
  OPERATION_LANDINGS,
  filterListings,
  neighborhoodPath,
  operationCategoryPath,
  operationPath,
  type OperationType,
} from "@/lib/seo/landing";

export interface SiteNavLink {
  label: string;
  href: string;
  count: number;
}

export interface SiteNavOperation extends SiteNavLink {
  operation: OperationType;
  /** Category landing pages of this operation that currently have listings */
  categories: SiteNavLink[];
}

export interface SiteNavLinks {
  operations: SiteNavOperation[];
  /** Neighborhoods with listings, busiest first */
  neighborhoods: SiteNavLink[];
}

const MAX_NEIGHBORHOODS = 8;

/**
 * Internal links to the keyword landing pages, shared by the header and the footer.
 * Only pages that currently have listings are returned (empty ones are 404/noindex).
 */
export async function getSiteNavLinks(): Promise<SiteNavLinks> {
  try {
    const { categories, neighborhoods, listings } = await getLandingData();

    const operations: SiteNavOperation[] = [];
    for (const operation of ["sale", "rent"] as const) {
      const count = filterListings(listings, { operationType: operation }).length;
      if (count === 0) continue;
      operations.push({
        operation,
        label: OPERATION_LANDINGS[operation].title,
        href: operationPath(operation),
        count,
        categories: categories
          .map((c) => ({
            label: c.plural,
            href: operationCategoryPath(operation, c),
            count: filterListings(listings, { operationType: operation, categoryId: c.id }).length,
          }))
          .filter((c) => c.count > 0),
      });
    }

    const counts = countByNeighborhood(listings);
    const topNeighborhoods = neighborhoods
      .map((n) => ({ label: n.name_bg, href: neighborhoodPath(n), count: counts.get(n.id) ?? 0 }))
      .filter((n) => n.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_NEIGHBORHOODS);

    return { operations, neighborhoods: topNeighborhoods };
  } catch {
    return { operations: [], neighborhoods: [] };
  }
}
