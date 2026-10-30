import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { generateNeighborhoodStructuredData } from "@/lib/seo/neighborhood-metadata";
import { getNeighborhoodBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import { generateNeighborhoodMetadata } from "@/lib/seo/neighborhood-metadata";
import { neighborhoodLabel } from "@/lib/seo/property-metadata";
import {
  getCachedNeighborhoods,
  getCachedPropertiesByNeighborhood,
  getNeighborhoodBySlug,
  getPropertyCountByNeighborhood
} from "@/lib/queries/neighborhoods";
import NeighborhoodHero from "@/components/neighborhoods/NeighborhoodHero";
import NeighborhoodInfo from "@/components/neighborhoods/NeighborhoodInfo";
import PropertyGrid from "@/components/property/PropertyGrid";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { buildPropertiesHref } from "@/lib/search/params";

import Link from "next/link";
import { site } from "@/config/site";
import { getLandingData } from "@/lib/queries/landing-data";
import { filterListings, neighborhoodCategoryPath } from "@/lib/seo/landing";

const PAGE_LIMIT = 12;

// ISR: listing counts change only on admin writes, which also purge this page
export const revalidate = 3600;

interface NeighborhoodPageProps {
  params: Promise<{
    "neighborhood-slug": string;
  }>;
}

/**
 * Generate static params for all neighborhoods
 * This pre-generates pages at build time for better SEO
 */
export async function generateStaticParams() {
  try {
    const neighborhoods = await getCachedNeighborhoods();
    
    return neighborhoods.map((neighborhood) => ({
      "neighborhood-slug": neighborhood.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for neighborhoods:", error);
    return [];
  }
}

/**
 * Generate metadata for neighborhood pages
 */
export async function generateMetadata({ 
  params 
}: NeighborhoodPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const neighborhood = await getNeighborhoodBySlug(resolvedParams["neighborhood-slug"]);
    
    if (!neighborhood) {
      return { title: "Кварталът не е намерен", robots: { index: false, follow: true } };
    }

    const propertyCount = await getPropertyCountByNeighborhood(neighborhood.id);
    
    return generateNeighborhoodMetadata(neighborhood, propertyCount);
  } catch (error) {
    console.error("Error generating metadata for neighborhood:", error);
    return { title: "Имоти в Стара Загора", robots: { index: false, follow: true } };
  }
}

/**
 * Neighborhood landing page component
 */
export default async function NeighborhoodPage({ params }: NeighborhoodPageProps) {
  const resolvedParams = await params;
  const neighborhood = await getNeighborhoodBySlug(resolvedParams["neighborhood-slug"]);

  // Only a missing neighborhood is a 404 – other errors surface to the error boundary
  if (!neighborhood) notFound();

  const [properties, propertyCount, landing] = await Promise.all([
    getCachedPropertiesByNeighborhood(neighborhood.id, PAGE_LIMIT),
    getPropertyCountByNeighborhood(neighborhood.id),
    getLandingData(),
  ]);
  const categoryLinks = landing.categories
    .map((c) => ({ c, count: filterListings(landing.listings, { neighborhoodId: neighborhood.id, categoryId: c.id }).length }))
    .filter(({ count }) => count > 0);

  const breadcrumbs = getNeighborhoodBreadcrumbs(neighborhood.name_bg, neighborhood.slug);
  const structuredData = generateNeighborhoodStructuredData(neighborhood);
  const allHref = buildPropertiesHref({ neighborhoodId: neighborhood.id });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <BreadcrumbSchema items={breadcrumbs} />

      <NeighborhoodHero neighborhood={neighborhood} propertyCount={propertyCount} breadcrumbs={breadcrumbs} />

      {/* Listings first – that is what visitors come for */}
      <Section id="properties" tone="muted" aria-labelledby="neighborhood-properties" className="scroll-mt-[var(--header-h)]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between md:mb-8">
          <SectionHeading
            id="neighborhood-properties"
            title={`Имоти в ${neighborhood.name_bg}`}
            description={
              propertyCount > 0
                ? `${propertyCount} активни обяви в ${neighborhoodLabel(neighborhood.name_bg)}.`
                : `В момента няма активни обяви в ${neighborhoodLabel(neighborhood.name_bg)}.`
            }
            align="left"
            className="mb-0 md:mb-0"
          />
          {propertyCount > properties.length && (
            <Button asChild variant="outline" className="shrink-0">
              <Link href={allHref}>
                Всички {propertyCount} обяви
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>

        {categoryLinks.length > 0 && (
          <nav aria-label={`Имоти в ${neighborhood.name_bg} по вид`} className="-mt-2 mb-6">
            <ul className="flex flex-wrap gap-2">
              {categoryLinks.map(({ c, count }) => (
                <li key={c.id}>
                  <Link
                    href={neighborhoodCategoryPath(neighborhood, c)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-primary transition-colors hover:border-accent hover:bg-accent/5"
                  >
                    {c.plural} в {neighborhood.name_bg}
                    <span className="rounded-full bg-gray-light px-2 py-0.5 text-xs font-semibold text-charcoal/70">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <PropertyGrid
          properties={properties}
          priorityCount={1}
          emptyTitle="Няма активни обяви"
          emptyDescription="Свържете се с нас, за да ви уведомим първи за нови оферти в квартала."
          emptyAction={{ href: "/#contact", label: "Свържете се с нас" }}
        />
      </Section>

      <NeighborhoodInfo neighborhood={neighborhood} />

      {/* CTA */}
      <Section tone="navy" spacing="tight">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-h3 font-bold sm:text-3xl">Търсите имот в {neighborhood.name_bg}?</h2>
            <p className="mt-2 max-w-xl text-white/75">
              Свържете се с нашия екип за персонална консултация и намиране на идеалния имот.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={`tel:${site.contact.phone}`}>
                <Phone className="h-5 w-5" aria-hidden="true" />
                Обадете се
              </a>
            </Button>
            <Button asChild variant="outline-light" size="lg" className="w-full sm:w-auto">
              <Link href="/#contact">
                <Mail className="h-5 w-5" aria-hidden="true" />
                Изпратете запитване
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
