/**
 * Structured Data Components for Nova Nest Real Estate
 * Provides Schema.org JSON-LD structured data for rich search results
 */

import { generateOrganizationSchema, generateWebsiteSchema, generateAggregateRatingSchema, generateReviewsSchema } from '@/lib/seo/generate-schema';
import { getAggregateRating, getApprovedTestimonials } from '@/lib/queries/testimonials';

/**
 * Organization Schema Component
 * Renders RealEstateAgent schema for business information
 * Enables Google Maps integration, business hours, contact info, and star ratings in search results
 */
export async function OrganizationSchema() {
  // Fetch rating and review data
  const { averageRating, reviewCount } = await getAggregateRating();
  const testimonials = await getApprovedTestimonials();
  
  // Generate base organization schema
  const baseSchema = generateOrganizationSchema();
  
  // Add rating and review data if available
  const schema = {
    ...baseSchema,
    ...(reviewCount > 0 && {
      aggregateRating: generateAggregateRatingSchema(averageRating, reviewCount)
    }),
    ...(testimonials.length > 0 && {
      review: generateReviewsSchema(testimonials)
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}

/**
 * Website Schema Component
 * Renders WebSite schema for site-wide information
 * Enables search box in Google search results
 */
export function WebsiteSchema() {
  const schema = generateWebsiteSchema();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}

/**
 * Property Schema Component
 * Renders RealEstateListing schema for individual property pages
 * Enables rich property listings in search results
 */
export function PropertySchema({ property }: { property: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${property.url}`,
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
        '@id': 'https://novanest.bg#organization'
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
    ...(property.latitude && property.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.latitude,
        longitude: property.longitude
      }
    }),
    ...(property.area && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: property.area,
        unitCode: 'MTK'
      }
    }),
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}

/**
 * Breadcrumb Schema Component
 * Renders BreadcrumbList schema for navigation breadcrumbs
 * Helps Google understand site structure
 */
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}

/**
 * FAQ Schema Component
 * Renders FAQPage schema for FAQ sections
 * Enables FAQ rich results in search
 */
export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}
