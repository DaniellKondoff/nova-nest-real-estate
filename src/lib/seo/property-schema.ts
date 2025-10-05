/**
 * Property Schema.org structured data generator for Nova Nest Real Estate
 * Generates Product schema for individual property listings to enable rich search results
 */

import { SEO_CONFIG } from './config';
import type { PropertyWithDetails } from '@/types/property';

/**
 * Type definitions for Property Schema.org structured data
 */
export interface PropertyValue {
  '@type': 'PropertyValue';
  name: string;
  value: string | number;
  unitCode?: string;
}

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

export interface Organization {
  '@type': 'Organization';
  name: string;
}

export interface Offer {
  '@type': 'Offer';
  price: number;
  priceCurrency: string;
  availability: string;
  priceValidUntil: string;
  url: string;
  seller: {
    '@type': 'RealEstateAgent';
    name: string;
  };
}

export interface ProductSchema {
  '@context': string;
  '@type': 'Product';
  '@id': string;
  name: string;
  description: string;
  image: string[];
  brand: Organization;
  offers: Offer;
  additionalProperty: PropertyValue[];
  address: PostalAddress;
  geo?: GeoCoordinates;
}

/**
 * Truncates description to specified length for SEO optimization
 */
function truncateDescription(description: string | null | undefined, maxLength: number = 500): string {
  if (!description) return '';
  return description.length > maxLength 
    ? description.substring(0, maxLength).trim() + '...'
    : description;
}

/**
 * Generates comprehensive Product schema for individual property listings
 * Enables rich search results with price, images, location, and features
 * 
 * @param property - PropertyWithDetails object containing all property information
 * @returns ProductSchema object for JSON-LD structured data
 */
export function generatePropertySchema(property: PropertyWithDetails): ProductSchema {
  const { property: prop, neighborhood, category, images } = property;
  
  // Extract image URLs from property images
  const imageUrls = (images || [])
    .map(img => img.url)
    .filter(Boolean);

  // Build additional property details array
  const additionalProperties: PropertyValue[] = [];

  // Property type
  if (category?.name_bg) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Тип имот',
      value: category.name_bg
    });
  }

  // Neighborhood
  if (neighborhood?.name_bg) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Квартал',
      value: neighborhood.name_bg
    });
  }

  // Area
  if (prop.area_sqm) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Площ',
      value: `${prop.area_sqm} кв.м`,
      unitCode: 'MTK'
    });
  }

  // Rooms
  if (prop.rooms) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Брой стаи',
      value: prop.rooms
    });
  }

  // Bedrooms
  if (prop.bedrooms) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Спални',
      value: prop.bedrooms
    });
  }

  // Bathrooms
  if (prop.bathrooms) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Бани',
      value: prop.bathrooms
    });
  }

  // Floor
  if (prop.floor) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Етаж',
      value: prop.floor
    });
  }

  // Operation type
  if (prop.operation_type) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Тип операция',
      value: prop.operation_type === 'sale' ? 'Продажба' : 'Наем'
    });
  }

  // Build the schema object
  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SEO_CONFIG.siteUrl}/properties/${prop.id}`,
    name: prop.title_bg,
    description: truncateDescription(prop.description_bg),
    image: imageUrls,
    brand: {
      '@type': 'Organization',
      name: 'Nova Nest Real Estate'
    },
    offers: {
      '@type': 'Offer',
      price: prop.price_eur || 0,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      url: `${SEO_CONFIG.siteUrl}/properties/${prop.id}`,
      seller: {
        '@type': 'RealEstateAgent',
        name: 'Nova Nest Real Estate'
      }
    },
    additionalProperty: additionalProperties,
    address: {
      '@type': 'PostalAddress',
      streetAddress: prop.address_bg || '',
      addressLocality: 'Стара Загора',
      addressRegion: 'Стара Загора',
      postalCode: '6000',
      addressCountry: 'BG'
    }
  };

  // Add geo coordinates if available
  if (prop.latitude && prop.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: prop.latitude,
      longitude: prop.longitude
    };
  }

  return schema;
}

/**
 * Generates a simplified property schema for property listing pages
 * Used when you need a lighter version for property grids
 */
export function generatePropertyListSchema(properties: PropertyWithDetails[]): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Недвижими имоти в Стара Загора',
    description: 'Списък с налични недвижими имоти за продажба и наем в Стара Загора',
    numberOfItems: properties.length,
    itemListElement: properties.map((property, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generatePropertySchema(property)
    }))
  };
}

/**
 * Generates breadcrumb schema for property detail pages
 */
export function generatePropertyBreadcrumbSchema(property: PropertyWithDetails): any {
  const { property: prop, category } = property;
  
  const items = [
    { name: 'Начало', url: SEO_CONFIG.siteUrl },
    { name: 'Имоти', url: `${SEO_CONFIG.siteUrl}/properties` }
  ];

  if (category?.name_bg) {
    items.push({
      name: category.name_bg,
      url: `${SEO_CONFIG.siteUrl}/properties?category=${category.id}`
    });
  }

  items.push({
    name: prop.title_bg,
    url: `${SEO_CONFIG.siteUrl}/properties/${prop.id}`
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
