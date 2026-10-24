/**
 * Property Schema Component for Nova Nest Real Estate
 * Renders RealEstateListing (+ Product when priced) structured data for a property detail page.
 * Breadcrumbs are rendered separately via BreadcrumbSchema.
 */

import { generatePropertySchema } from '@/lib/seo/property-schema';
import type { PropertyWithDetails } from '@/types/property';

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
