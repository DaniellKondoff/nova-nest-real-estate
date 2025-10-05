/**
 * Dynamic Sitemap Generation for Nova Nest Real Estate
 * Automatically discovers and includes all published content in sitemap.xml
 */

import type { MetadataRoute } from 'next';
import { getServerClient } from '@/lib/supabase/server';
import { SEO_CONFIG } from '@/lib/seo/config';

/**
 * Static pages configuration with priority and change frequency
 */
const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: SEO_CONFIG.siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/properties`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/services`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
];

/**
 * Property category pages configuration
 */
const PROPERTY_CATEGORY_PAGES: MetadataRoute.Sitemap = [
  {
    url: `${SEO_CONFIG.siteUrl}/apartamenti-stara-zagora`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/kushi-stara-zagora`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/ofisi-stara-zagora`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/garazhi-stara-zagora`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/parceli-stara-zagora`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  },
  {
    url: `${SEO_CONFIG.siteUrl}/skladove-stara-zagora`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  },
];

/**
 * Fetches published properties from database
 * @returns Array of property sitemap entries
 */
async function getPropertyPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await getServerClient();
    
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, updated_at')
      .eq('status', 'available')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties for sitemap:', error);
      return [];
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    return properties.map((property) => ({
      url: `${SEO_CONFIG.siteUrl}/properties/${property.id}`,
      lastModified: new Date(property.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error in getPropertyPages:', error);
    return [];
  }
}

/**
 * Fetches active neighborhoods from database
 * @returns Array of neighborhood sitemap entries
 */
async function getNeighborhoodPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await getServerClient();
    
    const { data: neighborhoods, error } = await supabase
      .from('neighborhoods')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching neighborhoods for sitemap:', error);
      return [];
    }

    if (!neighborhoods || neighborhoods.length === 0) {
      return [];
    }

    return neighborhoods.map((neighborhood) => ({
      url: `${SEO_CONFIG.siteUrl}/${neighborhood.slug}`,
      lastModified: new Date(neighborhood.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
  } catch (error) {
    console.error('Error in getNeighborhoodPages:', error);
    return [];
  }
}

/**
 * Fetches active SEO pages from database
 * @returns Array of SEO page sitemap entries
 */
async function getSEOPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await getServerClient();
    
    const { data: seoPages, error } = await supabase
      .from('seo_pages')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching SEO pages for sitemap:', error);
      return [];
    }

    if (!seoPages || seoPages.length === 0) {
      return [];
    }

    return seoPages.map((page) => ({
      url: `${SEO_CONFIG.siteUrl}/${page.slug}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Error in getSEOPages:', error);
    return [];
  }
}

/**
 * Main sitemap generation function
 * Combines all static and dynamic pages into a single sitemap
 * @returns Complete sitemap for the website
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all dynamic content in parallel for better performance
    const [propertyPages, neighborhoodPages, seoPages] = await Promise.all([
      getPropertyPages(),
      getNeighborhoodPages(),
      getSEOPages(),
    ]);

    // Combine all sitemap entries
    const allPages: MetadataRoute.Sitemap = [
      ...STATIC_PAGES,
      ...PROPERTY_CATEGORY_PAGES,
      ...propertyPages,
      ...neighborhoodPages,
      ...seoPages,
    ];

    // Log sitemap generation summary for monitoring
    console.log(`Sitemap generated with ${allPages.length} pages:`, {
      static: STATIC_PAGES.length,
      categories: PROPERTY_CATEGORY_PAGES.length,
      properties: propertyPages.length,
      neighborhoods: neighborhoodPages.length,
      seoPages: seoPages.length,
    });

    return allPages;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least static pages even if dynamic queries fail
    return [
      ...STATIC_PAGES,
      ...PROPERTY_CATEGORY_PAGES,
    ];
  }
}