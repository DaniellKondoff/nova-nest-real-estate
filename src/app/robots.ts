/**
 * Robots.txt Configuration for Nova Nest Real Estate
 * Controls search engine crawling and directs to sitemap
 */

import type { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo/config';

/**
 * Generates robots.txt configuration for search engines
 * Controls which pages can be crawled and provides sitemap location
 * @returns Robots configuration object
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/admin/*',
          '/api/*',
          '/_next/*',
        ],
      },
    ],
    sitemap: `${SEO_CONFIG.siteUrl}/sitemap.xml`,
  };
}
