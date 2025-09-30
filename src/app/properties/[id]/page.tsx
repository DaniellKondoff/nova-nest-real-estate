import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { getPropertyById } from "@/lib/queries/properties";
import type { PropertyWithDetails } from "@/types/property";
import type { Database } from "@/types/database.generated";
import type { PropertyWithRelations } from "@/lib/queries/properties";

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

async function fetchPropertyDetails(idNum: number): Promise<PropertyWithDetails | null> {
  // Base property with neighborhood and images
  const base: PropertyWithRelations | null = await getPropertyById(idNum);
  if (!base) return null;

  const supabase = await getSupabaseClient();

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
        images: ogImages as any,
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

      {/* Main layout */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {/* Image gallery */}
            <PropertyGallery images={images} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <PropertyHeader property={property} neighborhood={neighborhood} />
            <PropertyContact propertyId={property.id} />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <PropertyDescription description={property.description_bg ?? ""} />
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

// Minimal component shells (to be replaced with full implementations)
function PropertyGallery({ images }: { images: ImageRow[] }) {
  return (
    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
      {images && images.length > 0 ? (
        <img src={images[0].url} alt={images[0].alt_text_bg ?? "Снимка на имот"} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-400">Няма изображения</div>
      )}
    </div>
  );
}

function PropertyHeader({ property, neighborhood }: { property: PropertyRow; neighborhood: NeighborhoodRow | null }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-[#1a2642]">{property.title_bg}</h1>
      <div className="text-[#2d3748]">
        {neighborhood?.name_bg ? `${neighborhood.name_bg}, Стара Загора` : "Стара Загора"}
      </div>
      {typeof property.price_eur === "number" && (
        <div className="text-xl font-medium text-[#1a2642]"><span className="text-[#d4af37]">€</span> {property.price_eur.toLocaleString("bg-BG")}</div>
      )}
    </div>
  );
}

function PropertyDescription({ description }: { description: string }) {
  return (
    <div className="prose max-w-none">
      <h2 className="text-xl font-semibold text-[#1a2642] mb-4">Описание</h2>
      <p className="text-[#2d3748] whitespace-pre-line">{description || "Няма налично описание."}</p>
    </div>
  );
}

function PropertyFeatures({ features }: { features: FeatureRow[] }) {
  if (!features || features.length === 0) return null;
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1a2642] mb-4">Характеристики</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {features.map((f) => (
          <div key={f.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#2d3748] bg-white">
            {f.name_bg}
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyContact({ propertyId }: { propertyId: number }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white">
      <h2 className="text-lg font-semibold text-[#1a2642] mb-3">Запитване за имота</h2>
      <p className="text-sm text-[#2d3748] mb-4">Свържете се с нас за повече информация.</p>
      <a href={`/kontakt?propertyId=${propertyId}`} className="inline-flex items-center justify-center rounded-md bg-[#d4af37] px-4 py-2 text-white hover:bg-[#c09d2f]">
        Изпрати запитване
      </a>
    </div>
  );
}

function NeighborhoodInfo({ neighborhood }: { neighborhood: NeighborhoodRow | null }) {
  if (!neighborhood) return null;
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1a2642] mb-4">Квартал</h2>
      <div className="text-[#2d3748]">{neighborhood.name_bg}</div>
    </div>
  );
}


