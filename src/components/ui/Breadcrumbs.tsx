/**
 * Visual Breadcrumbs Component for Nova Nest Real Estate
 * Renders clickable breadcrumb navigation in the UI
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/seo/breadcrumb-schema';

/**
 * Props for the Breadcrumbs component
 */
export interface BreadcrumbsProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Optional CSS class name for styling */
  className?: string;
  /** Whether to show the last item as a link (default: false) */
  showLastAsLink?: boolean;
}

/**
 * Visual Breadcrumbs Component
 * Renders clickable breadcrumb navigation with proper styling
 * Last item is not a link by default (current page)
 * 
 * @param items - Array of breadcrumb items with name, url, and position
 * @param className - Optional CSS class for custom styling
 * @param showLastAsLink - Whether to make the last item clickable
 * 
 * @example
 * ```tsx
 * const breadcrumbs = [
 *   { name: 'Начало', url: 'https://novanest.bg', position: 1 },
 *   { name: 'Имоти', url: 'https://novanest.bg/properties', position: 2 },
 *   { name: 'Апартаменти', url: 'https://novanest.bg/apartamenti-stara-zagora', position: 3 }
 * ];
 * 
 * <Breadcrumbs items={breadcrumbs} />
 * ```
 */
export function Breadcrumbs({ 
  items, 
  className = '', 
  showLastAsLink = false 
}: BreadcrumbsProps) {
  // Sort items by position to ensure correct order
  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {sortedItems.map((item, index) => {
        const isLast = index === sortedItems.length - 1;
        const isLink = !isLast || showLastAsLink;

        return (
          <div key={item.position} className="flex items-center gap-2">
            {isLink ? (
              <Link
                href={item.url}
                className="text-[#1a2642] hover:text-[#d4af37] transition-colors duration-200 font-medium"
                title={item.name}
              >
                {item.name}
              </Link>
            ) : (
              <span 
                className="text-[#1a2642] font-medium truncate" 
                title={item.name}
              >
                {item.name}
              </span>
            )}
            
            {!isLast && (
              <ChevronRight 
                className="h-4 w-4 text-gray-400 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Compact Breadcrumbs Component
 * Renders breadcrumbs in a more compact format for mobile or tight spaces
 * 
 * @param items - Array of breadcrumb items
 * @param className - Optional CSS class for custom styling
 */
export function CompactBreadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center gap-1 text-xs text-gray-500 ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {sortedItems.map((item, index) => {
        const isLast = index === sortedItems.length - 1;

        return (
          <div key={item.position} className="flex items-center gap-1">
            {!isLast ? (
              <Link
                href={item.url}
                className="text-[#1a2642] hover:text-[#d4af37] transition-colors duration-200"
                title={item.name}
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-[#1a2642] font-medium truncate" title={item.name}>
                {item.name}
              </span>
            )}
            
            {!isLast && (
              <span className="text-gray-400" aria-hidden="true">
                ›
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Breadcrumbs with Home Icon Component
 * Renders breadcrumbs with a home icon for the first item
 * 
 * @param items - Array of breadcrumb items
 * @param className - Optional CSS class for custom styling
 */
export function BreadcrumbsWithHome({ items, className = '' }: BreadcrumbsProps) {
  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {sortedItems.map((item, index) => {
        const isLast = index === sortedItems.length - 1;
        const isFirst = index === 0;

        return (
          <div key={item.position} className="flex items-center gap-2">
            {!isLast ? (
              <Link
                href={item.url}
                className="text-[#1a2642] hover:text-[#d4af37] transition-colors duration-200 font-medium flex items-center gap-1"
                title={item.name}
              >
                {isFirst && (
                  <svg 
                    className="h-4 w-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                    />
                  </svg>
                )}
                {item.name}
              </Link>
            ) : (
              <span 
                className="text-[#1a2642] font-medium truncate flex items-center gap-1" 
                title={item.name}
              >
                {isFirst && (
                  <svg 
                    className="h-4 w-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                    />
                  </svg>
                )}
                {item.name}
              </span>
            )}
            
            {!isLast && (
              <ChevronRight 
                className="h-4 w-4 text-gray-400 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
