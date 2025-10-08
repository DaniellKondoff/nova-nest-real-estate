/**
 * Dynamic Sitemap Generation for Nova Nest Real Estate
 * Automatically discovers and includes all published content in sitemap.xml
 */

import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SEO_CONFIG } from '@/lib/seo/config';
import { env } from '@/lib/env';
import type { Database } from '@/types/database.generated';
import { getPropertyUrlSlug } from '@/lib/seo/property-slug';

/**
 * Create a static Supabase client for sitemap generation
 * This doesn't use cookies, making it suitable for static generation at build time
 */
function getStaticSupabaseClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

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
 * REMOVED: These pages don't exist as static routes
 * Property filtering is handled dynamically via /properties page
 */
// const PROPERTY_CATEGORY_PAGES: MetadataRoute.Sitemap = [];

/**
 * Fetches published properties from database
 * @returns Array of property sitemap entries with SEO-friendly URLs
 */
async function getPropertyPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = getStaticSupabaseClient();
    
    // Fetch properties with slug for SEO-friendly URLs
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, slug, updated_at')
      .eq('status', 'available')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties for sitemap:', error);
      return [];
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    return properties.map((property) => {
      // Generate SEO-friendly URL with slug if available
      const urlSlug = property.slug 
        ? getPropertyUrlSlug(property.id, property.slug)
        : property.id.toString();
      
      return {
        url: `${SEO_CONFIG.siteUrl}/properties/${urlSlug}`,
        lastModified: property.updated_at ? new Date(property.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });
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
    const supabase = getStaticSupabaseClient();
    
    const { data: neighborhoods, error } = await supabase
      .from('neighborhoods')
      .select('slug')
      .order('name_bg', { ascending: true });

    if (error) {
      console.error('Error fetching neighborhoods for sitemap:', error);
      return [];
    }

    if (!neighborhoods || neighborhoods.length === 0) {
      return [];
    }

    return neighborhoods.map((neighborhood) => ({
      url: `${SEO_CONFIG.siteUrl}/${neighborhood.slug}`,
      lastModified: new Date(), // Use current date since neighborhoods don't have updated_at
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
  } catch (error) {
    console.error('Error in getNeighborhoodPages:', error);
    return [];
  }
}

/**
 * Fetches published SEO pages from database
 * @returns Array of SEO page sitemap entries
 */
async function getSEOPages(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = getStaticSupabaseClient();
    
    const { data: seoPages, error } = await supabase
      .from('seo_pages')
      .select('slug, updated_at')
      .eq('is_published', true)
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
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
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
      ...propertyPages,
      ...neighborhoodPages,
      ...seoPages,
    ];

    // Log sitemap generation summary for monitoring
    console.log(`Sitemap generated with ${allPages.length} pages:`, {
      static: STATIC_PAGES.length,
      properties: propertyPages.length,
      neighborhoods: neighborhoodPages.length,
      seoPages: seoPages.length,
    });

    return allPages;
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return at least static pages even if dynamic queries fail
    return STATIC_PAGES;
  }
}