/**
 * Breadcrumb helper functions for Nova Nest Real Estate
 * One trail per page type – the same items feed the visible <Breadcrumbs> and the BreadcrumbList schema.
 */

import { absoluteUrl } from './config';
import { propertyPath } from './property-slug';
import { propertyHeadline } from './property-metadata';
import type { PropertyWithDetails } from '@/types/property';
import type { BreadcrumbItem } from './breadcrumb-schema';

/**
 * Builds breadcrumb items from site-relative paths
 * @example buildBreadcrumbs([{ name: 'Начало', path: '/' }, { name: 'Имоти', path: '/properties/' }])
 */
export function buildBreadcrumbs(trail: Array<{ name: string; path: string }>): BreadcrumbItem[] {
  return trail.map(({ name, path }, index) => ({ name, url: absoluteUrl(path), position: index + 1 }));
}

const HOME = { name: 'Начало', path: '/' };
const PROPERTIES = { name: 'Имоти', path: '/properties/' };

/** Начало › Имоти */
export function getPropertiesBreadcrumbs(): BreadcrumbItem[] {
  return buildBreadcrumbs([HOME, PROPERTIES]);
}

/** Начало › Имоти › Имоти в {квартал} */
export function getNeighborhoodBreadcrumbs(neighborhoodName: string, neighborhoodSlug: string): BreadcrumbItem[] {
  return buildBreadcrumbs([HOME, PROPERTIES, { name: `Имоти в ${neighborhoodName}`, path: `/${neighborhoodSlug}/` }]);
}

/** Начало › Имоти › {квартал} › {имот} */
export function getPropertyBreadcrumbs(property: PropertyWithDetails): BreadcrumbItem[] {
  const { property: prop, neighborhood } = property;
  return buildBreadcrumbs([
    HOME,
    PROPERTIES,
    ...(neighborhood?.slug ? [{ name: neighborhood.name_bg, path: `/${neighborhood.slug}/` }] : []),
    { name: propertyHeadline(property), path: propertyPath(prop.id, prop.slug) },
  ]);
}
