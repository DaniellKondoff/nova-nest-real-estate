/**
 * Breadcrumb Schema Component for Nova Nest Real Estate
 * Renders BreadcrumbList schema for navigation breadcrumbs in search results
 */

import { generateBreadcrumbSchema, generateValidatedBreadcrumbSchema } from '@/lib/seo/breadcrumb-schema';
import type { BreadcrumbItem } from '@/lib/seo/breadcrumb-schema';

/**
 * Breadcrumb Schema Component
 * Renders BreadcrumbList schema for navigation breadcrumbs
 * Enables breadcrumb navigation in Google search results
 * 
 * @param items - Array of breadcrumb items with name, url, and position
 * 
 * @example
 * ```tsx
 * const breadcrumbs = [
 *   { name: 'Начало', url: 'https://novanest.bg', position: 1 },
 *   { name: 'Имоти', url: 'https://novanest.bg/properties', position: 2 },
 *   { name: 'Апартаменти', url: 'https://novanest.bg/apartamenti-stara-zagora', position: 3 }
 * ];
 * 
 * <BreadcrumbSchema items={breadcrumbs} />
 * ```
 */
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = generateValidatedBreadcrumbSchema(items);

  // Don't render if no valid items
  if (!schema) {
    return null;
  }

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
 * Breadcrumb Schema Component with fallback
 * Renders breadcrumb schema even with potentially invalid items
 * Use this when you want to ensure schema is always rendered
 * 
 * @param items - Array of breadcrumb items (may contain invalid items)
 */
export function BreadcrumbSchemaWithFallback({ items }: { items: BreadcrumbItem[] }) {
  const schema = generateBreadcrumbSchema(items);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}
