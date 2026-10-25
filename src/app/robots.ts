/**
 * Robots.txt Configuration for Nova Nest Real Estate
 * Controls search engine crawling and directs to sitemap
 */

import type { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo/config';

/**
 * Generates robots.txt configuration for search engines.
 * /_next/ must stay crawlable – Google needs the CSS/JS chunks to render pages.
 * @returns Robots configuration object
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SEO_CONFIG.siteUrl}/sitemap.xml`,
    host: SEO_CONFIG.siteUrl,
  };
}
