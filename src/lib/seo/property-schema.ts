/**
 * Property Schema.org structured data generator for Nova Nest Real Estate
 * A listing page is a RealEstateListing about an Accommodation; it is also typed as a Product
 * when it has a real price, so Google can show the price in the search snippet.
 */

import { SEO_CONFIG, ORGANIZATION_ID, absoluteUrl } from './config';
import { propertyPath } from './property-slug';
import type { PropertyWithDetails } from '@/types/property';

const SCHEMA_AVAILABILITY: Record<string, string> = {
  available: 'https://schema.org/InStock',
  under_offer: 'https://schema.org/LimitedAvailability',
  sold: 'https://schema.org/SoldOut',
  rented: 'https://schema.org/SoldOut',
  archived: 'https://schema.org/Discontinued',
};

/** Maps our category slugs to the closest Schema.org Accommodation subtype */
function accommodationType(categorySlug: string | null | undefined): string {
  if (!categorySlug) return 'Accommodation';
  if (categorySlug.startsWith('apartament')) return 'Apartment';
  if (categorySlug === 'kshta') return 'House';
  return 'Accommodation';
}

function truncateDescription(description: string | null | undefined, maxLength: number = 500): string {
  if (!description) return '';
  return description.length > maxLength ? `${description.substring(0, maxLength).trim()}…` : description;
}

/** Drops undefined/null values so the JSON-LD stays clean */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')) as Partial<T>;
}

/**
 * Generates the listing structured data for a property detail page
 * @param property - PropertyWithDetails object containing all property information
 */
export function generatePropertySchema(property: PropertyWithDetails) {
  const { property: prop, neighborhood, category, images } = property;
  const url = absoluteUrl(propertyPath(prop.id, prop.slug));
  const hasPrice = typeof prop.price_eur === 'number' && prop.price_eur > 0;
  const isRent = prop.operation_type === 'rent';

  const imageUrls = [...(images || [])]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img) => img.url)
    .filter(Boolean);

  const accommodation = compact({
    '@type': accommodationType(category?.slug),
    name: prop.title_bg,
    floorSize: prop.area_sqm ? { '@type': 'QuantitativeValue', value: prop.area_sqm, unitCode: 'MTK' } : undefined,
    numberOfRooms: prop.rooms ?? undefined,
    numberOfBedrooms: prop.bedrooms ?? undefined,
    numberOfBathroomsTotal: prop.bathrooms ?? undefined,
    floorLevel: typeof prop.floor === 'number' ? String(prop.floor) : undefined,
    yearBuilt: prop.year_built ?? undefined,
    address: compact({
      '@type': 'PostalAddress',
      streetAddress: prop.address_bg ?? undefined,
      addressLocality: SEO_CONFIG.location.city,
      addressRegion: SEO_CONFIG.location.region,
      addressCountry: 'BG',
    }),
    geo: prop.latitude && prop.longitude
      ? { '@type': 'GeoCoordinates', latitude: prop.latitude, longitude: prop.longitude }
      : undefined,
    containedInPlace: neighborhood?.slug
      ? { '@type': 'Place', name: `${neighborhood.name_bg}, ${SEO_CONFIG.location.city}`, url: absoluteUrl(`/${neighborhood.slug}`) }
      : undefined,
  });

  const offer = hasPrice
    ? compact({
        '@type': 'Offer',
        url,
        price: prop.price_eur,
        priceCurrency: 'EUR',
        availability: SCHEMA_AVAILABILITY[prop.status ?? 'available'] ?? SCHEMA_AVAILABILITY.available,
        businessFunction: isRent ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
        priceSpecification: isRent
          ? { '@type': 'UnitPriceSpecification', price: prop.price_eur, priceCurrency: 'EUR', unitCode: 'MON' }
          : undefined,
        seller: { '@id': ORGANIZATION_ID },
      })
    : undefined;

  return compact({
    '@context': 'https://schema.org',
    // Product rich results require an offer with a price
    '@type': hasPrice ? ['RealEstateListing', 'Product'] : 'RealEstateListing',
    '@id': `${url}#listing`,
    url,
    name: prop.title_bg,
    description: truncateDescription(prop.description_bg),
    image: imageUrls.length ? imageUrls : undefined,
    datePosted: prop.created_at ?? undefined,
    dateModified: prop.updated_at ?? undefined,
    category: category?.name_bg,
    about: accommodation,
    offers: offer,
  });
}
