/**
 * Breadcrumb helper functions for Nova Nest Real Estate
 * Generates breadcrumb items for different page types
 */

import { SEO_CONFIG } from './config';
import type { PropertyWithDetails } from '@/types/property';
import type { BreadcrumbItem } from './breadcrumb-schema';

/**
 * Generates breadcrumb items for property detail pages
 * Creates navigation path: Home > Properties > [Neighborhood] > Property
 * 
 * Note: Category breadcrumbs link to properties page with category filter
 * Neighborhood breadcrumbs link to neighborhood landing pages if available
 * 
 * @param property - PropertyWithDetails object containing property information
 * @returns Array of breadcrumb items for property detail page
 * 
 * @example
 * ```typescript
 * const breadcrumbs = getPropertyBreadcrumbs(property);
 * // Returns: [
 * //   { name: 'Начало', url: 'https://novanest.bg', position: 1 },
 * //   { name: 'Имоти', url: 'https://novanest.bg/properties', position: 2 },
 * //   { name: 'Център', url: 'https://novanest.bg/centur', position: 3 },
 * //   { name: 'Property Title', url: 'https://novanest.bg/properties/123', position: 4 }
 * // ]
 * ```
 */
export function getPropertyBreadcrumbs(property: PropertyWithDetails): BreadcrumbItem[] {
  const { property: prop, category, neighborhood } = property;
  const breadcrumbs: BreadcrumbItem[] = [];
  let position = 1;

  // Home
  breadcrumbs.push({
    name: 'Начало',
    url: SEO_CONFIG.siteUrl,
    position: position++
  });

  // Properties - always link to the properties page
  breadcrumbs.push({
    name: 'Имоти',
    url: `${SEO_CONFIG.siteUrl}/properties`,
    position: position++
  });

  // Neighborhood (if available) - link to neighborhood landing page
  // Neighborhood landing pages exist at /[neighborhood-slug]
  if (neighborhood?.slug) {
    breadcrumbs.push({
      name: neighborhood.name_bg,
      url: `${SEO_CONFIG.siteUrl}/${neighborhood.slug}`,
      position: position++
    });
  }

  // Property title (current page)
  breadcrumbs.push({
    name: prop.title_bg,
    url: `${SEO_CONFIG.siteUrl}/properties/${prop.id}`,
    position: position++
  });

  return breadcrumbs;
}

/**
 * Generates breadcrumb items for category pages
 * Creates navigation path: Home > Properties > Category
 * 
 * @param categoryName - Name of the category in Bulgarian
 * @returns Array of breadcrumb items for category page
 */
export function getCategoryBreadcrumbs(categoryName: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let position = 1;

  // Home
  breadcrumbs.push({
    name: 'Начало',
    url: SEO_CONFIG.siteUrl,
    position: position++
  });

  // Properties
  breadcrumbs.push({
    name: 'Имоти',
    url: `${SEO_CONFIG.siteUrl}/properties`,
    position: position++
  });

  // Category (current page)
  breadcrumbs.push({
    name: categoryName,
    url: `${SEO_CONFIG.siteUrl}/${generateCategorySlug(categoryName)}`,
    position: position++
  });

  return breadcrumbs;
}

/**
 * Generates breadcrumb items for neighborhood pages
 * Creates navigation path: Home > Properties > Category > Neighborhood
 * 
 * @param categoryName - Name of the category in Bulgarian
 * @param neighborhoodName - Name of the neighborhood in Bulgarian
 * @returns Array of breadcrumb items for neighborhood page
 */
export function getNeighborhoodBreadcrumbs(categoryName: string, neighborhoodName: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let position = 1;

  // Home
  breadcrumbs.push({
    name: 'Начало',
    url: SEO_CONFIG.siteUrl,
    position: position++
  });

  // Properties
  breadcrumbs.push({
    name: 'Имоти',
    url: `${SEO_CONFIG.siteUrl}/properties`,
    position: position++
  });

  // Category
  breadcrumbs.push({
    name: categoryName,
    url: `${SEO_CONFIG.siteUrl}/${generateCategorySlug(categoryName)}`,
    position: position++
  });

  // Neighborhood (current page)
  breadcrumbs.push({
    name: neighborhoodName,
    url: `${SEO_CONFIG.siteUrl}/${generateNeighborhoodSlug(categoryName, neighborhoodName)}`,
    position: position++
  });

  return breadcrumbs;
}

/**
 * Generates breadcrumb items for properties listing page
 * Creates navigation path: Home > Properties
 * 
 * @returns Array of breadcrumb items for properties listing page
 */
export function getPropertiesBreadcrumbs(): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let position = 1;

  // Home
  breadcrumbs.push({
    name: 'Начало',
    url: SEO_CONFIG.siteUrl,
    position: position++
  });

  // Properties (current page)
  breadcrumbs.push({
    name: 'Имоти',
    url: `${SEO_CONFIG.siteUrl}/properties`,
    position: position++
  });

  return breadcrumbs;
}

/**
 * Generates breadcrumb items for home page
 * Creates navigation path: Home (only)
 * 
 * @returns Array with single breadcrumb item for home page
 */
export function getHomeBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      name: 'Начало',
      url: SEO_CONFIG.siteUrl,
      position: 1
    }
  ];
}

/**
 * Generates URL-friendly slug from Bulgarian category name
 * Converts category names to URL slugs for future category pages
 * 
 * @param categoryName - Category name in Bulgarian
 * @returns URL-friendly slug
 * 
 * @example
 * ```typescript
 * generateCategorySlug('Апартаменти') // 'apartamenti-stara-zagora'
 * generateCategorySlug('Къщи') // 'kushi-stara-zagora'
 * ```
 */
export function generateCategorySlug(categoryName: string): string {
  const slugMap: Record<string, string> = {
    'Апартаменти': 'apartamenti-stara-zagora',
    'Къщи': 'kushi-stara-zagora',
    'Офиси': 'ofisi-stara-zagora',
    'Гаражи': 'garazhi-stara-zagora',
    'Парцели': 'parceli-stara-zagora',
    'Търговски': 'targovski-stara-zagora'
  };

  return slugMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Generates URL-friendly slug from category and neighborhood names
 * Creates combined slug for neighborhood-specific category pages
 * 
 * @param categoryName - Category name in Bulgarian
 * @param neighborhoodName - Neighborhood name in Bulgarian
 * @returns URL-friendly combined slug
 * 
 * @example
 * ```typescript
 * generateNeighborhoodSlug('Апартаменти', 'Център') // 'apartamenti-centrum-stara-zagora'
 * generateNeighborhoodSlug('Къщи', 'Изток') // 'kushi-iztok-stara-zagora'
 * ```
 */
export function generateNeighborhoodSlug(categoryName: string, neighborhoodName: string): string {
  const categorySlug = generateCategorySlug(categoryName);
  const neighborhoodSlug = neighborhoodName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-я0-9-]/g, ''); // Remove special characters, keep Cyrillic

  return `${categorySlug}-${neighborhoodSlug}`;
}

/**
 * Generates breadcrumb items for admin pages
 * Creates navigation path: Home > Admin > Section
 * 
 * @param sectionName - Name of the admin section
 * @returns Array of breadcrumb items for admin page
 */
export function getAdminBreadcrumbs(sectionName: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let position = 1;

  // Home
  breadcrumbs.push({
    name: 'Начало',
    url: SEO_CONFIG.siteUrl,
    position: position++
  });

  // Admin
  breadcrumbs.push({
    name: 'Админ',
    url: `${SEO_CONFIG.siteUrl}/admin`,
    position: position++
  });

  // Section (current page)
  breadcrumbs.push({
    name: sectionName,
    url: `${SEO_CONFIG.siteUrl}/admin/${sectionName.toLowerCase()}`,
    position: position++
  });

  return breadcrumbs;
}
