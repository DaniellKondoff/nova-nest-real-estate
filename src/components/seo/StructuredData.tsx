/**
 * Structured Data Components for Nova Nest Real Estate
 * Provides Schema.org JSON-LD structured data for rich search results
 */

import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo/generate-schema';

/**
 * Organization Schema Component
 * Renders RealEstateAgent schema for business information (NAP, hours, contact).
 * No review/aggregateRating: self-published testimonials are not eligible for review
 * rich results, and this schema is rendered on every page including listings.
 */
export function OrganizationSchema() {
  const schema = generateOrganizationSchema();

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
