/**
 * Breadcrumb Schema.org structured data generator for Nova Nest Real Estate
 * Generates BreadcrumbList schema for navigation breadcrumbs in search results
 */

/**
 * Breadcrumb item interface for structured data
 */
export interface BreadcrumbItem {
  /** Display name in Bulgarian */
  name: string;
  /** Full URL */
  url: string;
  /** Position in breadcrumb trail (1, 2, 3, etc.) */
  position: number;
}

/**
 * Schema.org ListItem interface for breadcrumb items
 */
export interface BreadcrumbListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

/**
 * Complete BreadcrumbList schema interface
 */
export interface BreadcrumbListSchema {
  '@context': string;
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbListItem[];
}

/**
 * Generates Schema.org BreadcrumbList structured data
 * Creates breadcrumb navigation for Google search results
 * 
 * @param items - Array of breadcrumb items with name, url, and position
 * @returns Complete BreadcrumbList schema object
 * 
 * @example
 * ```typescript
 * const breadcrumbs = [
 *   { name: 'Начало', url: 'https://novanest.bg', position: 1 },
 *   { name: 'Имоти', url: 'https://novanest.bg/properties', position: 2 },
 *   { name: 'Апартаменти', url: 'https://novanest.bg/apartamenti-stara-zagora', position: 3 }
 * ];
 * const schema = generateBreadcrumbSchema(breadcrumbs);
 * ```
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbListSchema {
  // Sort items by position to ensure correct order
  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: sortedItems.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Validates breadcrumb items to ensure they have required fields
 * 
 * @param items - Array of breadcrumb items to validate
 * @returns Array of valid breadcrumb items
 */
export function validateBreadcrumbItems(items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items.filter(item => 
    item.name && 
    item.url && 
    typeof item.position === 'number' && 
    item.position > 0
  );
}

/**
 * Generates breadcrumb schema with validation
 * 
 * @param items - Array of breadcrumb items
 * @returns Complete BreadcrumbList schema object or null if no valid items
 */
export function generateValidatedBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbListSchema | null {
  const validItems = validateBreadcrumbItems(items);
  
  if (validItems.length === 0) {
    return null;
  }

  return generateBreadcrumbSchema(validItems);
}
