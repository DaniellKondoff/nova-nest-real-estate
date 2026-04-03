import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getServerClient } from "@/lib/supabase/server";
import type { PropertyWithDetails } from "@/types/property";
import type { Database } from "@/types/database.generated";
import type { PropertyWithRelations } from "@/lib/queries/properties";
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
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getPropertyBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import { extractPropertyId, isValidPropertySlug, getPropertyUrlSlug } from "@/lib/seo/property-slug";
import RelatedProperties from "@/components/property/RelatedProperties";
import MobileContactBar from "@/components/property/MobileContactBar";
import { site } from "@/config/site";

// Route segment config: force dynamic so we always SSR by id
export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ id: string }> };

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type CategoryRow = Database["public"]["Tables"]["property_categories"]["Row"];
type ImageRow = Database["public"]["Tables"]["property_images"]["Row"];
type FeatureRow = Database["public"]["Tables"]["property_features"]["Row"];

/**
 * Validate ID format and extract property ID
 * Supports both formats:
 * - Old format: "11" (numeric only)
 * - New format: "11-apartamenti-3-stai-centur" (ID-slug)
 * 
 * @param idParam - URL parameter (can be numeric ID or ID-slug format)
 * @returns Property ID number
 * @throws Calls notFound() if invalid format
 */
function validateIdOrNotFound(idParam: string): number {
  // Try new format first (ID-slug)
  if (idParam.includes('-')) {
    if (!isValidPropertySlug(idParam)) {
      notFound();
    }
    const id = extractPropertyId(idParam);
    if (!id) {
      notFound();
    }
    return id;
  }
  
  // Fallback to old format (numeric only)
  const isNumeric = /^\d+$/.test(idParam);
  if (!isNumeric) {
    notFound();
  }
  const idNum = Number(idParam);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    notFound();
  }
  return idNum;
}

async function getPropertyByIdServer(id: number): Promise<PropertyWithRelations | null> {
  const supabase = await getServerClient();
  
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      images:property_images(*),
      features:property_property_features(
        feature_id,
        property_features(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }

  if (!data) return null;

  // Transform features data to match expected format
  const transformedFeatures = data.features?.map((pf: any) => pf.property_features).filter(Boolean) || [];

  // Return flat property with images and features attached
  return {
    ...data,
    images: data.images || [],
    features: transformedFeatures,
  } as PropertyWithRelations;
}

async function fetchPropertyDetails(idNum: number): Promise<PropertyWithDetails | null> {
  // Base property with neighborhood and images
  const base: PropertyWithRelations | null = await getPropertyByIdServer(idNum);
  if (!base) return null;

  const supabase = await getServerClient();

  // Neighborhood (fetch full row for strict typing)
  let neighborhood: NeighborhoodRow | null = null;
  if (typeof base.neighborhood_id === "number") {
    const { data: n } = await supabase
      .from("neighborhoods")
      .select("*")
      .eq("id", base.neighborhood_id)
      .maybeSingle();
    neighborhood = (n as NeighborhoodRow) ?? null;
  }

  // Category (fetch full row for strict typing)
  let category: CategoryRow | null = null;
  if (typeof base.category_id === "number") {
    const { data: cat } = await supabase
      .from("property_categories")
      .select("*")
      .eq("id", base.category_id)
      .maybeSingle();
    category = (cat as CategoryRow) ?? null;
  }

  // Features are already fetched in getPropertyByIdServer
  const features: FeatureRow[] = base.features || [];

  const images: ImageRow[] = (base.images ?? []) as ImageRow[];

  const details: PropertyWithDetails = {
    property: base as unknown as PropertyRow,
    neighborhood,
    category,
    images,
    features,
  };

  return details;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  try {
    const { id } = await params;
    const idNum = validateIdOrNotFound(id);
    const details = await fetchPropertyDetails(idNum);
    
    if (!details) {
      // Return 404 metadata instead of calling notFound() to avoid redirect
      return generatePropertyNotFoundMetadata(id);
    }

    // Generate comprehensive metadata using our SEO utility
    return generatePropertyMetadata(details);
  } catch (error) {
    // If anything goes wrong during metadata generation, return 404 metadata
    console.error('Error generating property metadata:', error);
    const { id } = await params;
    return generatePropertyNotFoundMetadata(id);
  }
}

export default async function PropertyDetailPage({ params }: PageParams) {
  const { id: idParam } = await params;
  const idNum = validateIdOrNotFound(idParam);

  let details: PropertyWithDetails | null = null;
  try {
    details = await fetchPropertyDetails(idNum);
  } catch (err) {
    // Bubble up to Next.js error boundary
    throw err;
  }

  if (!details) {
    notFound();
  }

  const { property, neighborhood, category, images, features } = details!;
  const featuresList: FeatureRow[] = features ?? [];
  
  // Redirect old URL format to new SEO-friendly format
  // Only redirect if:
  // 1. The URL doesn't already have a slug (old numeric-only format)
  // 2. The property has a slug in the database
  if (!idParam.includes('-') && property.slug) {
    const canonicalSlug = getPropertyUrlSlug(idNum, property.slug);
    redirect(`/properties/${canonicalSlug}`);
  }
  
  // Generate breadcrumbs for structured data and UI
  const breadcrumbs = getPropertyBreadcrumbs(details);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 xl:pb-0">
      {/* Mobile sticky contact bar - hidden on xl where sidebar is visible */}
      <MobileContactBar phoneNumber={site.contact.phone} phoneDisplay={site.contact.phoneDisplay} />

      {/* Structured Data for Rich Search Results */}
      <PropertyDetailSchema property={details} />
      <BreadcrumbSchema items={breadcrumbs} />
      
      {/* View Tracker - tracks views when page loads */}
      <PropertyViewTracker propertyId={property.id} />
      
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Back link */}
          <Link 
            href="/properties" 
            className="inline-flex items-center gap-2 text-[#1a2642] hover:text-[#d4af37] transition-colors duration-200 text-sm font-medium"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Назад към имотите
          </Link>

          {/* Breadcrumbs */}
          <div className="mt-3">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - Gallery & Details */}
          <div className="xl:col-span-8 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {(() => {
                const galleryImages = (images ?? []).map((img) => ({
                  id: String(img.id),
                  url: img.url,
                  alt_text: img.alt_text_bg ?? property.title_bg,
                  order: img.sort_order,
                  is_primary: img.is_primary,
                }));
                return <PropertyGallery images={galleryImages} propertyTitle={property.title_bg} priority />;
              })()}
            </div>

            {/* Property Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <PropertyHeader property={details as PropertyWithDetails} />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <PropertyDescription description={property.description_bg ?? ""} />
            </div>

            {/* Property Details Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <PropertyDetails property={details as PropertyWithDetails} />
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <PropertyFeatures features={featuresList} />
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="xl:col-span-4">
            <div id="contact-sidebar" className="sticky top-8">
              <PropertyContact 
                propertyId={String(property.id)} 
                propertyTitle={property.title_bg} 
                propertyPrice={property.price_eur ?? 0} 
              />
            </div>
          </div>
        </div>

        {/* Related Properties - full width below the grid */}
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

// Inline component shells removed; using shared components


