/**
 * Property Schema Component for Nova Nest Real Estate
 * Renders Product schema for individual property listings to enable rich search results
 */

import { generatePropertySchema, generatePropertyBreadcrumbSchema } from '@/lib/seo/property-schema';
import type { PropertyWithDetails } from '@/types/property';

/**
 * Property Schema Component
 * Renders Product schema for individual property pages
 * Enables rich property listings in Google search results with price, images, and features
 */
export function PropertySchema({ property }: { property: PropertyWithDetails }) {
  const schema = generatePropertySchema(property);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}

/**
 * Property Breadcrumb Schema Component
 * Renders BreadcrumbList schema for property detail pages
 * Helps Google understand navigation structure
 */
export function PropertyBreadcrumbSchema({ property }: { property: PropertyWithDetails }) {
  const schema = generatePropertyBreadcrumbSchema(property);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}

/**
 * Combined Property Schema Component
 * Renders both Product and BreadcrumbList schemas for property detail pages
 * Use this for complete structured data on property pages
 */
export function PropertyDetailSchema({ property }: { property: PropertyWithDetails }) {
  return (
    <>
      <PropertySchema property={property} />
      <PropertyBreadcrumbSchema property={property} />
    </>
  );
}
