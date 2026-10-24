/**
 * Structured Data Components for Nova Nest Real Estate
 * Provides Schema.org JSON-LD structured data for rich search results
 */

import { generateOrganizationSchema, generateWebsiteSchema, generateAggregateRatingSchema, generateReviewsSchema } from '@/lib/seo/generate-schema';
import { getCachedApprovedTestimonials, getAggregateRatingStatic } from '@/lib/queries/testimonials';

/**
 * Organization Schema Component
 * Renders RealEstateAgent schema for business information
 * Enables Google Maps integration, business hours, contact info, and star ratings in search results
 */
export async function OrganizationSchema() {
  // Fetch rating and review data — both derived from the same cached testimonials call
  const testimonials = await getCachedApprovedTestimonials();
  const { averageRating, reviewCount } = await getAggregateRatingStatic();
  
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
 * FAQ Schema Component
 * Renders FAQPage schema – only for FAQs that are visible on the same page
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
