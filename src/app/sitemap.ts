/**
 * Dynamic Sitemap Generation for Nova Nest Real Estate
 * Lists only indexable, canonical URLs (trailing slash, 200 status) – never redirects or noindex pages.
 */

import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/config';
import { propertyPath } from '@/lib/seo/property-slug';
import { isNeighborhoodIndexable } from '@/lib/seo/neighborhood-metadata';
import { countByNeighborhood, type ListingIndexEntry } from '@/lib/queries/listing-index';
import { getLandingData } from '@/lib/queries/landing-data';
import {
  filterListings,
  neighborhoodCategoryPath,
  operationCategoryPath,
  operationPath,
  type OperationType,
} from '@/lib/seo/landing';

// Regenerate hourly so new listings appear without a redeploy (admin writes also purge it)
export const revalidate = 3600;

function latest(listings: ListingIndexEntry[]): Date | undefined {
  const times = listings.map((l) => (l.updatedAt ? Date.parse(l.updatedAt) : NaN)).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { listings, neighborhoods, categories } = await getLandingData().catch((error) => {
    console.error('Sitemap: failed to load listings', error);
    return { listings: [] as ListingIndexEntry[], neighborhoods: [], categories: [] };
  });

  const lastListingChange = latest(listings);
  const counts = countByNeighborhood(listings);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: lastListingChange },
    { url: absoluteUrl('/properties/'), lastModified: lastListingChange },
  ];

  const propertyPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: absoluteUrl(propertyPath(l.id, l.slug)),
    lastModified: l.updatedAt ? new Date(l.updatedAt) : undefined,
    images: l.primaryImageUrl ? [l.primaryImageUrl] : undefined,
  }));

  const neighborhoodPages: MetadataRoute.Sitemap = neighborhoods
    .filter((n) => isNeighborhoodIndexable(n, counts.get(n.id) ?? 0))
    .map((n) => ({
      url: absoluteUrl(`/${n.slug}/`),
      lastModified: latest(listings.filter((l) => l.neighborhoodId === n.id)),
    }));

  // Keyword landing pages – only combinations that currently have listings (others are 404/noindex)
  const landingPages: MetadataRoute.Sitemap = [];
  const addLanding = (path: string, scoped: ListingIndexEntry[]) => {
    if (scoped.length > 0) landingPages.push({ url: absoluteUrl(path), lastModified: latest(scoped) });
  };
  for (const operation of ['sale', 'rent'] as OperationType[]) {
    addLanding(operationPath(operation), filterListings(listings, { operationType: operation }));
    for (const c of categories) {
      addLanding(operationCategoryPath(operation, c), filterListings(listings, { operationType: operation, categoryId: c.id }));
    }
  }
  for (const n of neighborhoods) {
    for (const c of categories) {
      addLanding(neighborhoodCategoryPath(n, c), filterListings(listings, { neighborhoodId: n.id, categoryId: c.id }));
    }
  }

  return [...staticPages, ...landingPages, ...propertyPages, ...neighborhoodPages];
}
