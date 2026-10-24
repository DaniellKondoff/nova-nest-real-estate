import React, { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getStaticServerClient } from "@/lib/supabase/server";
import type { PropertyWithDetails } from "@/types/property";
import type { Database } from "@/types/database.generated";
import { generatePropertyMetadata, generatePropertyNotFoundMetadata } from "@/lib/seo/property-metadata";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyHeader from "@/components/property/PropertyHeader";
import PropertyDescription from "@/components/property/PropertyDescription";
import PropertyDetails from "@/components/property/PropertyDetails";
import PropertyFeatures from "@/components/property/PropertyFeatures";
import NeighborhoodInfo from "@/components/property/NeighborhoodInfo";
import PropertyContact from "@/components/property/PropertyContact";
import PropertyViewTracker from "@/components/property/PropertyViewTracker";
import { PropertyDetailSchema } from "@/components/seo/PropertySchema";
import { PropertyReviewSchema } from "@/components/seo/PropertyReviewSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { containerClass } from "@/components/ui/section";
import { getPropertyBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import { extractPropertyId, isValidPropertySlug, getPropertyUrlSlug } from "@/lib/seo/property-slug";
import RelatedProperties from "@/components/property/RelatedProperties";
import MobileContactBar from "@/components/property/MobileContactBar";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

// Cache each property page for 1 hour; admin mutations call revalidatePath to purge immediately.
// Data is read with the cookie-free static client so the page can actually be statically regenerated.
export const revalidate = 3600;

// No build-time pages; each property is rendered on first request and then cached (ISR)
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return [];
}

type PageParams = { params: Promise<{ id: string }> };

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type CategoryRow = Database["public"]["Tables"]["property_categories"]["Row"];
type ImageRow = Database["public"]["Tables"]["property_images"]["Row"];
type FeatureRow = Database["public"]["Tables"]["property_features"]["Row"];

const DETAIL_SELECT = `
  id, slug, title_bg, description_bg, operation_type, status, price_eur, price_bgn,
  area_sqm, rooms, bedrooms, bathrooms, floor, total_floors, year_built, address_bg,
  latitude, longitude, is_new, is_featured, neighborhood_id, category_id, created_at, updated_at,
  seo_title, seo_description, seo_keywords, og_image,
  neighborhood:neighborhoods(id, name_bg, slug, description, amenities),
  category:property_categories(id, name_bg, slug),
  images:property_images(id, url, is_primary, sort_order, alt_text_bg, width, height),
  features:property_property_features(property_features(id, name_bg, category))
`;

/**
 * Validate ID format and extract property ID
 * Supports both formats:
 * - Old format: "11" (numeric only)
 * - New format: "11-apartamenti-3-stai-centur" (ID-slug)
 */
function validateIdOrNotFound(idParam: string): number {
  if (idParam.includes("-")) {
    if (!isValidPropertySlug(idParam)) notFound();
    const id = extractPropertyId(idParam);
    if (!id) notFound();
    return id;
  }
  if (!/^\d+$/.test(idParam)) notFound();
  const idNum = Number(idParam);
  if (!Number.isFinite(idNum) || idNum <= 0) notFound();
  return idNum;
}

/** Deduplicated per request (generateMetadata + page share one query) */
const fetchPropertyDetails = cache(async (idNum: number): Promise<PropertyWithDetails | null> => {
  const supabase = getStaticServerClient();
  const { data, error } = await supabase.from("properties").select(DETAIL_SELECT).eq("id", idNum).maybeSingle();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as Record<string, unknown> & {
    neighborhood?: NeighborhoodRow | null;
    category?: CategoryRow | null;
    images?: ImageRow[] | null;
    features?: Array<{ property_features: FeatureRow | null }> | null;
  };

  return {
    property: row as unknown as PropertyRow,
    neighborhood: row.neighborhood ?? null,
    category: row.category ?? null,
    images: row.images ?? [],
    features: (row.features ?? []).map((pf) => pf.property_features).filter((f): f is FeatureRow => Boolean(f)),
  };
});

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const details = await fetchPropertyDetails(validateIdOrNotFound(id));
    return details ? generatePropertyMetadata(details) : generatePropertyNotFoundMetadata(id);
  } catch (error) {
    console.error("Error generating property metadata:", error);
    return generatePropertyNotFoundMetadata(id);
  }
}

export default async function PropertyDetailPage({ params }: PageParams) {
  const { id: idParam } = await params;
  const idNum = validateIdOrNotFound(idParam);
  const details = await fetchPropertyDetails(idNum);
  if (!details) notFound();

  const { property, neighborhood, images, features } = details;

  // Redirect old numeric URLs to the SEO-friendly ID-slug format
  if (!idParam.includes("-") && property.slug) {
    redirect(`/properties/${getPropertyUrlSlug(idNum, property.slug)}/`);
  }

  const breadcrumbs = getPropertyBreadcrumbs(details);
  const galleryImages = (images ?? []).map((img) => ({
    id: String(img.id),
    url: img.url,
    alt_text: img.alt_text_bg ?? property.title_bg,
    order: img.sort_order,
    is_primary: img.is_primary,
  }));

  return (
    // Bottom padding keeps content clear of the fixed mobile contact bar
    <div className="min-h-svh bg-gray-light pb-[calc(5rem+env(safe-area-inset-bottom))] xl:pb-0">
      <MobileContactBar phoneNumber={site.contact.phone} />

      <PropertyDetailSchema property={details} />
      <PropertyReviewSchema propertyId={String(idNum)} />
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

      {/* Gallery: full-bleed on mobile, contained bento on lg+ */}
      <div className="sm:pt-6">
        <div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
          <PropertyGallery images={galleryImages} propertyTitle={property.title_bg} priority />
        </div>
      </div>

      <div className={cn(containerClass, "py-6 md:py-8")}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-card border border-border bg-white p-5 shadow-card sm:p-8">
              <PropertyHeader property={details} />
            </div>
            <PropertyDescription description={property.description_bg ?? ""} />
            <PropertyDetails property={details} />
            <PropertyFeatures features={features ?? []} />
            <NeighborhoodInfo neighborhood={neighborhood} />
          </div>

          <div className="xl:col-span-4">
            <div
              id="contact-sidebar"
              className="scroll-mt-[calc(var(--header-h)+1rem)] xl:sticky xl:top-[calc(var(--header-h)+1.5rem)]"
            >
              <PropertyContact propertyId={property.id} propertyTitle={property.title_bg} />
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
