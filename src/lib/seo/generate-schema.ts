/**
 * Schema.org structured data generators for Nova Nest Real Estate
 * Generates JSON-LD structured data for rich search results
 */

import { SEO_CONFIG, ORGANIZATION_ID, WEBSITE_ID, DEFAULT_OG_IMAGE, absoluteUrl } from './config';
import type { Testimonial } from '@/lib/queries/testimonials';

/** Office address – must match the footer (site.contact.address) and the Google Business Profile exactly */
export const OFFICE_ADDRESS = {
  '@type': 'PostalAddress' as const,
  streetAddress: 'Дом на Строителя ул. Св. Княз Борис 93, ет. 11',
  addressLocality: SEO_CONFIG.location.city,
  addressRegion: SEO_CONFIG.location.region,
  postalCode: '6000',
  addressCountry: 'BG'
};

/**
 * Generates the organization schema for Nova Nest Real Estate
 * Uses RealEstateAgent (a LocalBusiness subtype) for local search eligibility
 */
export function generateOrganizationSchema() {
  const { lat, lng } = SEO_CONFIG.location.coordinates;
  const sameAs = [SEO_CONFIG.social.facebook, SEO_CONFIG.social.instagram].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': ORGANIZATION_ID,
    name: SEO_CONFIG.siteName,
    url: absoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: `${SEO_CONFIG.siteUrl}/images/logo.png`,
    },
    image: DEFAULT_OG_IMAGE.url,
    description: SEO_CONFIG.defaultDescription,
    telephone: SEO_CONFIG.contact.phone,
    email: SEO_CONFIG.contact.email,
    priceRange: '€€',
    address: OFFICE_ADDRESS,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    areaServed: {
      '@type': 'City',
      name: SEO_CONFIG.location.city,
      sameAs: 'https://www.wikidata.org/wiki/Q191136' // Stara Zagora on Wikidata
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SEO_CONFIG.contact.phone,
      email: SEO_CONFIG.contact.email,
      contactType: 'sales',
      areaServed: 'BG',
      availableLanguage: ['bg', 'en']
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '15:00'
      }
    ],
    ...(sameAs.length > 0 && { sameAs })
  };
}

/**
 * Generates the website schema for Nova Nest Real Estate
 * (Google retired the sitelinks search box in 2024, so no SearchAction)
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: SEO_CONFIG.siteName,
    alternateName: 'Nova Nest',
    description: SEO_CONFIG.defaultDescription,
    publisher: {
      '@id': ORGANIZATION_ID
    },
    inLanguage: 'bg-BG'
  };
}

/**
 * Generates AggregateRating schema for organization
 * @param averageRating - The average rating (0-5)
 * @param reviewCount - The total number of reviews
 * @returns AggregateRating schema object
 */
export function generateAggregateRatingSchema(averageRating: number, reviewCount: number) {
  return {
    '@type': 'AggregateRating',
    ratingValue: averageRating.toFixed(1),
    reviewCount: reviewCount,
    bestRating: 5,
    worstRating: 1
  };
}

/**
 * Generates Review schemas from testimonials
 * @param testimonials - Array of testimonials to convert to reviews
 * @returns Array of Review schema objects (limited to 10 most recent)
 */
export function generateReviewsSchema(testimonials: Testimonial[]) {
  return testimonials.slice(0, 10).map(testimonial => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: testimonial.client_name
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: testimonial.rating,
      bestRating: 5,
      worstRating: 1
    },
    reviewBody: testimonial.comment_text,
    datePublished: new Date(testimonial.created_at).toISOString()
  }));
}
