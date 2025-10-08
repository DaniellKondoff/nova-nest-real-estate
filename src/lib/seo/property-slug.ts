/**
 * Property Slug Utilities for SEO-Optimized URLs
 * Nova Nest Real Estate - Stara Zagora, Bulgaria
 * 
 * Generates SEO-friendly URLs using dynamic category and neighborhood slugs from database
 */

/**
 * Generates SEO-friendly slug for a property
 * Uses category slug from database (no hardcoded mappings!)
 * 
 * @param property - Property data with category and neighborhood slugs
 * @returns Generated slug (without ID)
 * 
 * @example
 * ```typescript
 * generatePropertySlug({
 *   categorySlug: 'apartamenti',
 *   rooms: 3,
 *   neighborhoodSlug: 'centur'
 * })
 * // Returns: 'apartamenti-3-stai-centur'
 * ```
 */
export function generatePropertySlug(property: {
  categorySlug: string;      // From property_categories.slug
  rooms?: number | null;
  neighborhoodSlug: string;  // From neighborhoods.slug
}): string {
  const parts: string[] = [];
  
  // 1. Property category slug (from database)
  parts.push(property.categorySlug);
  
  // 2. Rooms (if available and positive)
  if (property.rooms && property.rooms > 0) {
    parts.push(`${property.rooms}-stai`);
  }
  
  // 3. Neighborhood slug (from database)
  parts.push(property.neighborhoodSlug);
  
  // 4. Clean and join
  const slug = parts
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove non-word chars except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-+/, '')             // Remove leading hyphens
    .replace(/-+$/, '');            // Remove trailing hyphens
  
  return slug;
}

/**
 * Combines property ID with slug for full URL path
 * 
 * @param id - Property ID
 * @param slug - Property slug
 * @returns Full URL-safe path segment
 * 
 * @example
 * ```typescript
 * getPropertyUrlSlug(11, 'apartamenti-3-stai-centur')
 * // Returns: '11-apartamenti-3-stai-centur'
 * ```
 */
export function getPropertyUrlSlug(id: number, slug: string): string {
  return `${id}-${slug}`;
}

/**
 * Extracts property ID from URL slug
 * 
 * @param urlSlug - Full URL slug (e.g., "11-apartamenti-3-stai-centur")
 * @returns Property ID or null if invalid
 * 
 * @example
 * ```typescript
 * extractPropertyId('11-apartamenti-3-stai-centur')
 * // Returns: 11
 * 
 * extractPropertyId('invalid-slug')
 * // Returns: null
 * ```
 */
export function extractPropertyId(urlSlug: string): number | null {
  const match = urlSlug.match(/^(\d+)-/);
  if (!match) return null;
  
  const id = parseInt(match[1], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Validates if URL slug matches expected format
 * 
 * @param urlSlug - URL slug to validate
 * @returns true if valid format
 * 
 * @example
 * ```typescript
 * isValidPropertySlug('11-apartamenti-3-stai-centur')
 * // Returns: true
 * 
 * isValidPropertySlug('invalid')
 * // Returns: false
 * ```
 */
export function isValidPropertySlug(urlSlug: string): boolean {
  // Format: {id}-{slug}
  // e.g., "11-apartamenti-3-stai-centur" or "25-kashi-iztok"
  return /^\d+-[a-z0-9\-]+$/.test(urlSlug);
}

/**
 * Extracts slug part from full URL slug
 * 
 * @param urlSlug - Full URL slug (e.g., "11-apartamenti-3-stai-centur")
 * @returns Slug without ID or empty string if invalid
 * 
 * @example
 * ```typescript
 * extractSlugFromUrlSlug('11-apartamenti-3-stai-centur')
 * // Returns: 'apartamenti-3-stai-centur'
 * ```
 */
export function extractSlugFromUrlSlug(urlSlug: string): string {
  const match = urlSlug.match(/^\d+-(.+)$/);
  return match ? match[1] : '';
}

