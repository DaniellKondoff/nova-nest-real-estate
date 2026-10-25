import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { fetchPropertyDetails, validateIdOrNotFound } from "@/lib/queries/property-detail";
import {
  displayTitle,
  generatePropertyMetadata,
  generatePropertyNotFoundMetadata,
  isClosedListing,
  neighborhoodLabel,
  propertyHeadline,
} from "@/lib/seo/property-metadata";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyHeader from "@/components/property/PropertyHeader";
import PropertyKeyFacts from "@/components/property/PropertyKeyFacts";
import PropertyDescription from "@/components/property/PropertyDescription";
import PropertyDetails from "@/components/property/PropertyDetails";
import PropertyFeatures from "@/components/property/PropertyFeatures";
import MortgageSection from "@/components/property/MortgageSection";
import NeighborhoodInfo from "@/components/property/NeighborhoodInfo";
import PropertyLandingLinks from "@/components/property/PropertyLandingLinks";
import PropertyContact from "@/components/property/PropertyContact";
import PropertyViewTracker from "@/components/property/PropertyViewTracker";
import { formatPrice } from "@/components/property/utils";
import { PropertySchema } from "@/components/seo/PropertySchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { containerClass } from "@/components/ui/section";
import { getPropertyBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import { extractSlugFromUrlSlug, propertyPath } from "@/lib/seo/property-slug";
import RelatedProperties from "@/components/property/RelatedProperties";
import MobileContactBar from "@/components/property/MobileContactBar";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

// Cache each property page for 1 hour; admin mutations call revalidatePublicPages() to purge immediately.
// Data is read with the cookie-free static client so the page can actually be statically regenerated.
export const revalidate = 3600;

// No build-time pages; each property is rendered on first request and then cached (ISR)
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return [];
}

type PageParams = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await fetchPropertyDetails(validateIdOrNotFound(id));
    return details && details.property.status !== "archived"
      ? generatePropertyMetadata(details)
      : generatePropertyNotFoundMetadata();
  } catch (error) {
    console.error("Error generating property metadata:", error);
    return generatePropertyNotFoundMetadata();
  }
}

export default async function PropertyDetailPage({ params }: PageParams) {
  const { id: idParam } = await params;
  const idNum = validateIdOrNotFound(idParam);
  const details = await fetchPropertyDetails(idNum);
  // Archived listings are gone for good
  if (!details || details.property.status === "archived") notFound();

  const { property, neighborhood, images, features } = details;

  // One URL per property: old numeric URLs and outdated slugs (title changed) move permanently
  if (property.slug && extractSlugFromUrlSlug(idParam) !== property.slug) {
    permanentRedirect(propertyPath(idNum, property.slug));
  }
  const closed = isClosedListing(property.status);
  const isRent = property.operation_type === "rent";
  const price = typeof property.price_eur === "number" && property.price_eur > 0 ? property.price_eur : null;

  const breadcrumbs = getPropertyBreadcrumbs(details);
  const headline = propertyHeadline(details);
  const galleryImages = (images ?? []).map((img, i) => ({
    id: String(img.id),
    url: img.url,
    alt_text: img.alt_text_bg?.trim() || `${headline} – снимка ${i + 1}`,
    order: img.sort_order,
    is_primary: img.is_primary,
  }));

  return (
    // Bottom padding keeps content clear of the fixed mobile contact bar
    <div className="min-h-svh bg-gray-light pb-[calc(5.5rem+env(safe-area-inset-bottom))] xl:pb-0">
      <MobileContactBar
        phoneNumber={site.contact.phone}
        price={price ? formatPrice(price) : null}
        isRent={isRent}
        location={neighborhoodLabel(neighborhood?.name_bg)}
      />

      <PropertySchema property={details} />
      <BreadcrumbSchema items={breadcrumbs} />
      <PropertyViewTracker propertyId={property.id} />

      {/* Back link + breadcrumbs */}
      <div className="border-b border-border bg-white">
        <div className={cn(containerClass, "flex min-h-14 items-center gap-4 py-2")}>
          <Link
            href="/properties/"
            className="-ml-2 inline-flex h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Всички имоти
          </Link>
          <Breadcrumbs items={breadcrumbs} className="hidden min-w-0 md:flex" />
        </div>
      </div>

      {/* The H1 comes first in the HTML; on mobile the gallery is shown above it (order-first) */}
      <div className="flex flex-col">
        <div className="bg-white lg:bg-transparent">
          <div className={cn(containerClass, "py-5 lg:pt-8 lg:pb-6")}>
            <PropertyHeader property={details} />
          </div>
        </div>
        <div className="order-first sm:bg-white sm:pt-6 lg:order-none lg:bg-transparent lg:pt-0">
          <div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
            <PropertyGallery images={galleryImages} propertyTitle={headline} priority />
          </div>
        </div>
      </div>

      <div className={cn(containerClass, "py-6 md:py-8")}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          <div className="min-w-0 space-y-6 xl:col-span-8">
            {closed && (
              <p role="status" className="rounded-card border border-accent/40 bg-accent/10 p-4 font-semibold text-primary sm:p-5">
                {property.status === "rented" ? "Този имот вече е отдаден под наем." : "Този имот вече е продаден."}{" "}
                <Link href="/properties/" className="text-accent-dark underline underline-offset-4">
                  Вижте актуалните ни оферти
                </Link>
              </p>
            )}
            <PropertyKeyFacts property={details} />
            <PropertyDescription description={property.description_bg ?? ""} title={property.title_bg} />
            <PropertyDetails property={details} />
            <PropertyFeatures features={features ?? []} />
            {!isRent && !closed && price && <MortgageSection price={price} />}
            <NeighborhoodInfo neighborhood={neighborhood} />
            <PropertyLandingLinks details={details} />
          </div>

          <div className="xl:col-span-4">
            <div
              id="contact-sidebar"
              className="scroll-mt-[calc(var(--header-h)+1rem)] xl:sticky xl:top-[calc(var(--header-h)+1.5rem)]"
            >
              <PropertyContact propertyId={property.id} propertyTitle={displayTitle(property.title_bg)} />
            </div>
          </div>
        </div>

        {typeof property.category_id === "number" && typeof property.neighborhood_id === "number" && (
          <RelatedProperties
            currentPropertyId={property.id}
            categoryId={property.category_id}
            neighborhoodId={property.neighborhood_id}
          />
        )}
      </div>
    </div>
  );
}
