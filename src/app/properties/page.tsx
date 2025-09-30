import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { appConfig, buildCanonicalUrl } from "@/lib/config";
import { getServerClient } from "@/lib/supabase/server";
import { getAllNeighborhoods } from "@/lib/queries/neighborhoods";
import { getAllPropertyCategories } from "@/lib/queries/categories";
import { getPublishedProperties } from "@/lib/queries/properties";
import type { PropertyWithDetails, PropertySearchFilters, PropertyCategory } from "@/types/property";
import type { StaraZagoraNeighborhood } from "@/types/search";
import PropertyCard from "@/components/property/PropertyCard";
import ResultsSummary from "@/components/property/ResultsSummary";

// SEO metadata for /properties (Bulgarian)
export const metadata: Metadata = {
  title: "Имоти в Стара Загора | Nova Nest Real Estate",
  description:
    "Открийте най-добрите имоти за продажба и под наем в Стара Загора. Апартаменти, къщи, офиси и парцели с професионално обслужване.",
  alternates: {
    canonical: buildCanonicalUrl("/properties"),
  },
  keywords: [
    "имоти стара загора",
    "апартаменти стара загора",
    "къщи стара загора",
    "офиси стара загора",
    "имоти под наем стара загора",
    "недвижими имоти стара загора",
    "агенция имоти стара загора",
  ],
  openGraph: {
    title: "Имоти в Стара Загора | Nova Nest Real Estate",
    description:
      "Открийте най-добрите имоти за продажба и под наем в Стара Загора. Апартаменти, къщи, офиси и парцели с професионално обслужване.",
    url: buildCanonicalUrl("/properties"),
    siteName: appConfig.siteName,
    locale: "bg_BG",
    type: "website",
  },
};

type PropertiesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

type PropertyListItem = {
  id: number | string;
  title_bg: string;
  price_eur: number | null;
  operation_type: "sale" | "rent";
  address_bg: string | null;
  area_sqm: number | null;
  rooms: number | null;
  bedrooms: number | null;
  is_new: boolean | null;
  created_at: string;
  neighborhood: { name_bg: string } | null;
  images?: { url: string; is_primary?: boolean; alt_text_bg?: string | null }[];
};

const PAGE_SIZE = 20;

function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function buildItemListStructuredData(items: { id: string | number; name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name,
    })),
  } as const;
}

async function fetchInitialData(page: number) {
  const supabase = getServerClient();
  void supabase; // ensure server client is initialized for SSR cookies

  // Note: existing getPublishedProperties does not paginate; we fetch all then slice.
  // Future: replace with a dedicated paginated RPC or query.
  const [neighborhoods, categories, allPublished] = await Promise.all([
    getAllNeighborhoods().catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[properties] getAllNeighborhoods error:", e);
      return [] as StaraZagoraNeighborhood[];
    }),
    getAllPropertyCategories().catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[properties] getAllPropertyCategories error:", e);
      return [] as PropertyCategory[];
    }),
    getPublishedProperties().catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[properties] getPublishedProperties error:", e);
      return [] as unknown as PropertyListItem[];
    }),
  ]);

  // Sort newest first (created_at desc) if present
  const sorted = (allPublished as any[]).slice().sort((a, b) => {
    const tA = new Date(a.created_at ?? 0).getTime();
    const tB = new Date(b.created_at ?? 0).getTime();
    return tB - tA;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (clampedPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIndex, startIndex + PAGE_SIZE) as PropertyListItem[];

  return {
    neighborhoods,
    categories,
    properties: pageItems,
    total,
    totalPages,
    page: clampedPage,
  };
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
      {message}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="col-span-full text-center text-gray-600" role="status" aria-live="polite">
      Зареждане на имоти...
    </div>
  );
}

export default async function PropertiesPage(props: PropertiesPageProps): Promise<React.ReactElement> {
  const pageParam = Array.isArray(props.searchParams?.page) ? props.searchParams?.page[0] : props.searchParams?.page;
  const page = toInt(pageParam, 1);

  try {
    const { properties, neighborhoods, categories, total, totalPages, page: safePage } = await fetchInitialData(page);

    // Build ItemList structured data
    const itemsForSchema = properties.map((p) => ({
      id: p.id,
      name: p.title_bg,
      url: buildCanonicalUrl(`/imoti/${p.id}`),
    }));
    const itemListSchema = buildItemListStructuredData(itemsForSchema);

    return (
      <main className="bg-gray-50">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-[#1a2642]">Имоти в Стара Загора</h1>
                <p className="mt-2 text-gray-600">Разгледайте актуални оферти за продажба и наем</p>
              </div>
              <ResultsSummary total={total} page={safePage} pageSize={PAGE_SIZE} />
            </div>

            {/* Filters placeholder (client integration in future) */}
            <div className="mb-8 rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-gray-700">
                Филтри и сортиране ще бъдат добавени скоро. Начална подредба: най-нови.
              </div>
            </div>

            {/* Grid */}
            <Suspense fallback={<LoadingBlock />}> 
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.length === 0 ? (
                  <ErrorBlock message="Няма намерени имоти. Опитайте да промените филтрите." />
                ) : (
                  properties.map((p) => {
                    const primary = (p.images || []).find((i) => i.is_primary) || (p.images || [])[0];
                    return (
                      <PropertyCard
                        key={String(p.id)}
                        id={String(p.id)}
                        title_bg={p.title_bg}
                        price_eur={p.price_eur ?? 0}
                        operation_type={p.operation_type === "rent" ? "rent" : "sale"}
                        address_bg={p.address_bg ?? ""}
                        neighborhood={{ name_bg: p.neighborhood?.name_bg ?? "" }}
                        area_sqm={p.area_sqm ?? undefined}
                        rooms={p.rooms ?? undefined}
                        bedrooms={p.bedrooms ?? undefined}
                        primary_image={{ image_url: primary?.url ?? "/images/window.svg", alt_text_bg: primary?.alt_text_bg ?? p.title_bg }}
                        is_new={Boolean(p.is_new)}
                        created_at={p.created_at}
                        href={`/imoti/${p.id}`}
                      />
                    );
                  })
                )}
              </div>
            </Suspense>

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-between">
              <div className="text-sm text-gray-600">Страница {safePage} от {totalPages}</div>
              <div className="flex gap-2">
                <a
                  href={safePage > 1 ? `/properties?page=${safePage - 1}` : "#"}
                  aria-disabled={safePage <= 1}
                  className={[
                    "rounded-lg border px-4 py-2 text-sm",
                    safePage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-100",
                  ].join(" ")}
                >
                  Назад
                </a>
                <a
                  href={safePage < totalPages ? `/properties?page=${safePage + 1}` : "#"}
                  aria-disabled={safePage >= totalPages}
                  className={[
                    "rounded-lg border px-4 py-2 text-sm",
                    safePage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-100",
                  ].join(" ")}
                >
                  Напред
                </a>
              </div>
            </div>

            {/* Structured data */}
            <script
              type="application/ld+json"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
            />
          </div>
        </section>
      </main>
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[properties] page render error:", error);
    return (
      <main className="bg-gray-50">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#1a2642] mb-4">Имоти в Стара Загора</h1>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
              Възникна грешка при зареждане на имотите. Моля, опитайте отново по-късно.
            </div>
          </div>
        </section>
      </main>
    );
  }
}



