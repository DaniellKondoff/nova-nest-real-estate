import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getServerClient } from "@/lib/supabase/server";
import type { PropertyWithDetails } from "@/types/property";
import type { Database } from "@/types/database.generated";
import type { PropertyWithRelations } from "@/lib/queries/properties";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyHeader from "@/components/property/PropertyHeader";
import PropertyDescription from "@/components/property/PropertyDescription";
import PropertyDetails from "@/components/property/PropertyDetails";
import PropertyFeatures from "@/components/property/PropertyFeatures";
import NeighborhoodInfo from "@/components/property/NeighborhoodInfo";
import PropertyContact from "@/components/property/PropertyContact";

// Route segment config: force dynamic so we always SSR by id
export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ id: string }> };

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];
type CategoryRow = Database["public"]["Tables"]["property_categories"]["Row"];
type ImageRow = Database["public"]["Tables"]["property_images"]["Row"];
type FeatureRow = Database["public"]["Tables"]["property_features"]["Row"];

/**
 * Validate ID format. The current schema uses numeric IDs.
 * We accept only digits to match the DB, otherwise return 404.
 */
function validateIdOrNotFound(id: string): number {
  const isNumeric = /^\d+$/.test(id);
  if (!isNumeric) {
    notFound();
  }
  const idNum = Number(id);
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
      images:property_images(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }

  if (!data) return null;

  // Return flat property with images attached
  return {
    ...data,
    images: data.images || [],
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

  // Features: resolve by IDs stored in properties.features JSON (if array of numbers)
  let features: FeatureRow[] = [];
  const rawFeatures: unknown = (base as unknown as PropertyRow).features;
  if (Array.isArray(rawFeatures) && rawFeatures.every((v) => typeof v === "number")) {
  const { data: feat } = await supabase
      .from("property_features")
      .select("*")
      .in("id", rawFeatures as number[]);
    features = (feat ?? []) as FeatureRow[];
  }

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
    if (!details) notFound();

    const { property, neighborhood, category, images } = details;
    const title = `${property.title_bg} | Nova Nest Real Estate`;
    const description = (property.description_bg ?? "").slice(0, 160);
    const primaryImage = (images ?? []).find((img) => img.is_primary) ?? images[0];
    const ogImages = primaryImage ? [{ url: primaryImage.url, width: primaryImage.width ?? 1200, height: primaryImage.height ?? 630, alt: primaryImage.alt_text_bg ?? property.title_bg }] : undefined;

    const keywords = [
      category?.name_bg,
      neighborhood?.name_bg,
      "Стара Загора",
      "имоти",
    ].filter(Boolean) as string[];

    const canonical = `https://novanest.bg/properties/${id}`;

    return {
      title,
      description,
      keywords,
      alternates: { canonical },
        openGraph: {
          title,
          description,
          url: canonical,
          locale: "bg_BG",
          images: ogImages,
        },
    } satisfies Metadata;
  } catch {
    // If anything goes wrong during metadata generation, surface 404 to avoid leaking errors
    notFound();
  }
}

export default async function PropertyDetailPage({ params }: PageParams) {
  const { id } = await params;
  const idNum = validateIdOrNotFound(id);

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

  const primaryImage = (images ?? []).find((img) => img.is_primary) ?? images[0];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title_bg,
    description: property.description_bg ?? "",
    image: primaryImage?.url,
    offers: {
      "@type": "Offer",
      price: property.price_eur ?? undefined,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `https://novanest.bg/properties/${id}`,
    },
    brand: {
      "@type": "Organization",
      name: "Nova Nest Real Estate",
    },
    category: category?.name_bg,
    areaServed: "Стара Загора",
    material: undefined,
    additionalProperty: undefined,
    // Address/location
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address_bg ?? "",
      addressLocality: "Стара Загора",
      addressCountry: "BG",
    },
  } as const;

  return (
    <main className="bg-white">
      {/* Back link */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/properties" className="text-[#1a2642] hover:text-[#d4af37] text-sm">← Назад към имотите</Link>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto mb-8 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/" className="hover:underline">Начало</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
          <Link href="/properties" className="hover:underline">Имоти</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
          <span className="text-[#1a2642] truncate" title={category?.name_bg ?? property.title_bg}>
            {category?.name_bg ?? property.title_bg}
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
          <span className="text-[#1a2642] font-medium truncate" title={property.title_bg}>{property.title_bg}</span>
        </div>
      </section>

      {/* Header (full width) */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <PropertyHeader property={details as PropertyWithDetails} />
        </div>
      </section>

      {/* Main layout */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {/* Image gallery */}
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
          <div className="lg:col-span-2 space-y-6">
            <PropertyContact propertyId={String(property.id)} propertyTitle={property.title_bg} propertyPrice={property.price_eur ?? 0} />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <PropertyDescription description={property.description_bg ?? ""} />
        </div>
      </section>

      {/* Details grid */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <PropertyDetails property={details as PropertyWithDetails} />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <PropertyFeatures features={featuresList} />
        </div>
      </section>

      {/* Neighborhood */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <NeighborhoodInfo neighborhood={neighborhood} />
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify(structuredData)}</script>
    </main>
  );
}

// Inline component shells removed; using shared components


