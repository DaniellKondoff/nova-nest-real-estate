/**
 * Schema.org structured data generators for Nova Nest Real Estate
 * Generates JSON-LD structured data for rich search results
 */

import { SEO_CONFIG } from './config';
import type { Testimonial } from '@/lib/queries/testimonials';

/**
 * Type definitions for Schema.org structured data
 */
export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface City {
  '@type': 'City';
  name: string;
  '@id': string;
}

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

export interface SearchAction {
  '@type': 'SearchAction';
  target: string;
  'query-input': string;
}

export interface OrganizationSchema {
  '@context': string;
  '@type': 'RealEstateAgent';
  '@id': string;
  name: string;
  url: string;
  logo: string;
  image: string;
  description: string;
  telephone: string;
  email: string;
  address: PostalAddress;
  geo: GeoCoordinates;
  areaServed: City;
  openingHoursSpecification: OpeningHoursSpecification[];
  sameAs: string[];
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: string;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  review?: Array<{
    '@type': 'Review';
    author: {
      '@type': 'Person';
      name: string;
    };
    reviewRating: {
      '@type': 'Rating';
      ratingValue: number;
      bestRating: number;
      worstRating: number;
    };
    reviewBody: string;
    datePublished: string;
  }>;
}

export interface WebsiteSchema {
  '@context': string;
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  description: string;
  publisher: {
    '@id': string;
  };
  inLanguage: string;
  potentialAction: SearchAction;
}

/**
 * Generates the organization schema for Nova Nest Real Estate
 * Uses RealEstateAgent schema type for maximum specificity
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SEO_CONFIG.siteUrl}#organization`,
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}/images/logo.svg`,
    image: `${SEO_CONFIG.siteUrl}/images/og-default.svg`,
    description: SEO_CONFIG.defaultDescription,
    telephone: SEO_CONFIG.contact.phone,
    email: SEO_CONFIG.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'бул. Цар Симеон Велики 123', // TODO: Replace with your actual business address
      addressLocality: SEO_CONFIG.location.city,
      addressRegion: SEO_CONFIG.location.region,
      postalCode: '6000', // TODO: Replace with your actual postal code
      addressCountry: 'BG'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SEO_CONFIG.location.coordinates.lat,
      longitude: SEO_CONFIG.location.coordinates.lng
    },
    areaServed: {
      '@type': 'City',
      name: SEO_CONFIG.location.city,
      '@id': 'https://www.wikidata.org/wiki/Q191136' // Stara Zagora Wikidata ID
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
    sameAs: [
      SEO_CONFIG.social.facebook,
      SEO_CONFIG.social.instagram
    ].filter(Boolean) // Remove empty strings
  };
}

/**
 * Generates the website schema for Nova Nest Real Estate
 * Includes search action for Google search box integration
 */
export function generateWebsiteSchema(): WebsiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SEO_CONFIG.siteUrl}#website`,
    url: SEO_CONFIG.siteUrl,
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    publisher: {
      '@id': `${SEO_CONFIG.siteUrl}#organization`
    },
    inLanguage: 'bg-BG',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SEO_CONFIG.siteUrl}/properties?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generates property-specific schema for individual property pages
 * This can be used on property detail pages
 */
export function generatePropertySchema(property: {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  propertyType: string;
  listingType: 'sale' | 'rent';
  datePosted: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${SEO_CONFIG.siteUrl}/properties/${property.id}`,
    name: property.title,
    description: property.description,
    url: property.url,
    datePosted: property.datePosted,
    image: property.images,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency,
      availability: property.listingType === 'sale' ? 'https://schema.org/InStock' : 'https://schema.org/InStock',
      seller: {
        '@id': `${SEO_CONFIG.siteUrl}#organization`
      }
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.region,
      postalCode: property.postalCode,
      addressCountry: property.country
    },
    geo: property.latitude && property.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude
    } : undefined,
    floorSize: property.area ? {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'MTK'
    } : undefined,
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms
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
