import type { Metadata } from "next";
import type { Neighborhood } from "@/lib/queries/neighborhoods";
import { SEO_CONFIG, absoluteUrl } from "./config";
import { generateMetadata as buildMetadata, toMetaDescription } from "./metadata";

/** A description shorter than this is not enough unique text to rank an empty neighborhood page */
const MIN_INDEXABLE_DESCRIPTION = 300;

/**
 * Neighborhood pages with no listings and no real description are thin content:
 * they stay reachable (noindex,follow) but are kept out of the index and the sitemap.
 */
export function isNeighborhoodIndexable(
  neighborhood: Pick<Neighborhood, "description">,
  propertyCount: number
): boolean {
  return propertyCount > 0 || (neighborhood.description?.trim().length ?? 0) >= MIN_INDEXABLE_DESCRIPTION;
}

/** Admin-entered SEO titles are often placeholders ("zora", "Tri-chuchura-ug") – only trust real Bulgarian titles */
function usableSeoTitle(seoTitle: string | null | undefined): string | null {
  const cleaned = seoTitle?.replace(/\s*\|\s*Nova Nest.*$/i, "").trim();
  return cleaned && cleaned.length >= 15 && /[а-яА-Я]/.test(cleaned) ? cleaned : null;
}

function propertyCountLabel(count: number): string {
  return count === 1 ? "1 обява" : `${count} обяви`;
}

/**
 * Generate SEO metadata for neighborhood landing pages
 * @param neighborhood - The neighborhood data
 * @param propertyCount - Number of available properties in this neighborhood
 * @returns Metadata object for Next.js
 */
export function generateNeighborhoodMetadata(neighborhood: Neighborhood, propertyCount: number): Metadata {
  const name = neighborhood.name_bg;
  const title =
    usableSeoTitle(neighborhood.seo_title) ??
    `Имоти в ${name}, Стара Загора${propertyCount > 0 ? ` – ${propertyCountLabel(propertyCount)}` : ""}`;

  const description =
    neighborhood.seo_description && neighborhood.seo_description.length >= 70
      ? neighborhood.seo_description
      : generateDefaultDescription(neighborhood, propertyCount);

  return buildMetadata({
    title,
    description,
    path: `/${neighborhood.slug}/`,
    noIndex: !isNeighborhoodIndexable(neighborhood, propertyCount),
  });
}

function generateDefaultDescription(neighborhood: Neighborhood, propertyCount: number): string {
  const name = neighborhood.name_bg;
  const lead =
    propertyCount > 0
      ? `${propertyCountLabel(propertyCount)} за имоти в ${name}, Стара Загора – апартаменти, къщи и парцели със снимки и цени.`
      : `Търсите имот в ${name}, Стара Загора? Nova Nest ще ви уведоми първи за нови оферти в квартала.`;
  return toMetaDescription(neighborhood.description ? `${lead} ${neighborhood.description}` : lead);
}

/**
 * Generate structured data for neighborhood pages
 * @param neighborhood - The neighborhood data
 * @returns Structured data object
 */
export function generateNeighborhoodStructuredData(neighborhood: Neighborhood) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${neighborhood.name_bg}, ${SEO_CONFIG.location.city}`,
    description: neighborhood.description || `Квартал ${neighborhood.name_bg} в ${SEO_CONFIG.location.city}`,
    containedInPlace: {
      "@type": "City",
      name: SEO_CONFIG.location.city,
      sameAs: "https://www.wikidata.org/wiki/Q191136",
    },
    ...(neighborhood.center_lat && neighborhood.center_lng
      ? { geo: { "@type": "GeoCoordinates", latitude: neighborhood.center_lat, longitude: neighborhood.center_lng } }
      : {}),
    url: absoluteUrl(`/${neighborhood.slug}/`),
  };
}
