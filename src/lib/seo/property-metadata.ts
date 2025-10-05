/**
 * Dynamic Property Metadata Generation for Nova Nest Real Estate
 * Generates SEO-optimized metadata for property detail pages
 */

import type { Metadata } from 'next';
import type { PropertyWithDetails } from '@/types/property';
import { SEO_CONFIG, DEFAULT_OG_IMAGE } from './config';
import { generateOpenGraphMetadata, generateTwitterCardMetadata } from './metadata';

/**
 * Formats price using Bulgarian locale with EUR currency
 * @param priceEur - Price in EUR
 * @returns Formatted price string (e.g., "120,000 EUR")
 */
export function formatPrice(priceEur: number): string {
  if (!priceEur || priceEur <= 0) {
    return 'Цена по договаряне';
  }

  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceEur);
}

/**
 * Auto-generates Bulgarian keywords from property data
 * @param property - Property with details
 * @returns Array of 5-8 relevant keywords
 */
export function generatePropertyKeywords(property: PropertyWithDetails): string[] {
  const keywords: string[] = [];
  const { property: prop, category, neighborhood } = property;

  // Category name (lowercase)
  if (category?.name_bg) {
    const categoryLower = category.name_bg.toLowerCase();
    keywords.push(categoryLower);
  }

  // Category + neighborhood combination
  if (category?.name_bg && neighborhood?.name_bg) {
    keywords.push(`${category.name_bg.toLowerCase()} ${neighborhood.name_bg.toLowerCase()}`);
  }

  // Category + city combination
  if (category?.name_bg) {
    keywords.push(`${category.name_bg.toLowerCase()} стара загора`);
  }

  // Operation type
  if (prop.operation_type === 'sale') {
    keywords.push('продажба');
  } else if (prop.operation_type === 'rent') {
    keywords.push('наем');
  }

  // Neighborhood name
  if (neighborhood?.name_bg) {
    keywords.push(neighborhood.name_bg.toLowerCase());
  }

  // Imoti + neighborhood
  if (neighborhood?.name_bg) {
    keywords.push(`имоти ${neighborhood.name_bg.toLowerCase()}`);
  }

  // Add area-based keywords if available
  if (prop.area_sqm) {
    if (prop.area_sqm <= 50) {
      keywords.push('малък имот');
    } else if (prop.area_sqm >= 100) {
      keywords.push('голям имот');
    }
  }

  // Add room-based keywords if available
  if (prop.rooms) {
    if (prop.rooms === 1) {
      keywords.push('едностаен');
    } else if (prop.rooms === 2) {
      keywords.push('двустаен');
    } else if (prop.rooms === 3) {
      keywords.push('тристаен');
    } else if (prop.rooms >= 4) {
      keywords.push('многостаен');
    }
  }

  // Remove duplicates and limit to 8 keywords
  return [...new Set(keywords)].slice(0, 8);
}

/**
 * Generates property page title
 * @param property - Property with details
 * @returns Formatted title string
 */
function generatePropertyTitle(property: PropertyWithDetails): string {
  const { property: prop, neighborhood } = property;
  
  const neighborhoodName = neighborhood?.name_bg || 'Стара Загора';
  return `${prop.title_bg} - ${neighborhoodName}, Стара Загора | Nova Nest`;
}

/**
 * Generates property page description
 * @param property - Property with details
 * @returns Formatted description string
 */
function generatePropertyDescription(property: PropertyWithDetails): string {
  const { property: prop, category, neighborhood } = property;

  // Use custom SEO description if available
  if (prop.seo_description) {
    return prop.seo_description;
  }

  // Auto-generate description
  const parts: string[] = [];

  // Category name
  if (category?.name_bg) {
    parts.push(category.name_bg);
  }

  // Neighborhood
  if (neighborhood?.name_bg) {
    parts.push(`в ${neighborhood.name_bg}`);
  }

  // Area
  if (prop.area_sqm) {
    parts.push(`${prop.area_sqm} кв.м`);
  }

  // Rooms
  if (prop.rooms) {
    parts.push(`${prop.rooms} стаи`);
  }

  // Price
  if (prop.price_eur) {
    parts.push(formatPrice(prop.price_eur));
  }

  // Add description excerpt
  if (prop.description_bg) {
    const descriptionExcerpt = prop.description_bg.slice(0, 100).trim();
    if (descriptionExcerpt) {
      parts.push(`${descriptionExcerpt}...`);
    }
  }

  return parts.join(', ');
}

/**
 * Gets property images for OpenGraph
 * @param property - Property with details
 * @returns Array of image objects for OpenGraph
 */
function getPropertyImages(property: PropertyWithDetails) {
  const { property: prop, images } = property;

  if (!images || images.length === 0) {
    // Use default image if no property images
    return [{
      url: DEFAULT_OG_IMAGE.url,
      width: DEFAULT_OG_IMAGE.width,
      height: DEFAULT_OG_IMAGE.height,
      alt: DEFAULT_OG_IMAGE.alt,
    }];
  }

  // Prioritize primary image, then use first available
  const primaryImage = images.find(img => img.is_primary) || images[0];
  
  return [{
    url: primaryImage.url,
    width: 1200,
    height: 630,
    alt: primaryImage.alt_text_bg || prop.title_bg,
  }];
}

/**
 * Generates comprehensive metadata for property detail pages
 * @param property - Property with details
 * @returns Next.js Metadata object optimized for SEO
 */
export function generatePropertyMetadata(property: PropertyWithDetails): Metadata {
  const { property: prop } = property;
  
  const title = generatePropertyTitle(property);
  const description = generatePropertyDescription(property);
  const url = `${SEO_CONFIG.siteUrl}/properties/${prop.id}`;
  const images = getPropertyImages(property);
  
  // Use custom SEO keywords if available, otherwise auto-generate
  const customKeywords = prop.seo_keywords ? prop.seo_keywords.split(',').map(k => k.trim()) : [];
  const autoKeywords = generatePropertyKeywords(property);
  const keywords = customKeywords.length > 0 ? customKeywords : autoKeywords;

  const metadata: Metadata = {
    title,
    description,
    keywords,
    authors: [{ name: SEO_CONFIG.siteName }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@novanest_bg',
      creator: '@novanest_bg',
      title,
      description,
      images: images.map(img => img.url),
    },
    alternates: {
      canonical: url,
      languages: {
        'bg-BG': url,
      },
    },
    verification: {
      google: 'google-site-verification-placeholder',
    },
    category: 'real estate',
    classification: 'Business',
    other: {
      'geo.region': 'BG-24',
      'geo.placename': SEO_CONFIG.location.city,
      'geo.position': `${SEO_CONFIG.location.coordinates.lat};${SEO_CONFIG.location.coordinates.lng}`,
      'ICBM': `${SEO_CONFIG.location.coordinates.lat}, ${SEO_CONFIG.location.coordinates.lng}`,
      'contact:phone_number': SEO_CONFIG.contact.phone,
      'contact:email': SEO_CONFIG.contact.email,
      'contact:country_name': SEO_CONFIG.location.country,
      'contact:locality': SEO_CONFIG.location.city,
      'contact:region': SEO_CONFIG.location.region,
      // Property-specific structured data hints
      'property:type': property.category?.name_bg || '',
      'property:operation': prop.operation_type === 'sale' ? 'продажба' : 'наем',
      'property:price': prop.price_eur ? formatPrice(prop.price_eur) : '',
      'property:area': prop.area_sqm ? `${prop.area_sqm} кв.м` : '',
      'property:rooms': prop.rooms ? `${prop.rooms} стаи` : '',
    }
  };

  return metadata;
}

/**
 * Generates metadata for property not found case
 * @param propertyId - The property ID that was not found
 * @returns Default metadata for 404 case
 */
export function generatePropertyNotFoundMetadata(propertyId: string): Metadata {
  return {
    title: 'Имот не е намерен | Nova Nest Real Estate',
    description: 'Търсеният имот не е намерен. Разгледайте нашите други предложения за недвижими имоти в Стара Загора.',
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: 'Имот не е намерен | Nova Nest Real Estate',
      description: 'Търсеният имот не е намерен. Разгледайте нашите други предложения за недвижими имоти в Стара Загора.',
      url: `${SEO_CONFIG.siteUrl}/properties/${propertyId}`,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'Имот не е намерен | Nova Nest Real Estate',
      description: 'Търсеният имот не е намерен. Разгледайте нашите други предложения за недвижими имоти в Стара Загора.',
    },
  };
}
