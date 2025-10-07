import type { Metadata } from "next";
import type { Neighborhood } from "@/lib/queries/neighborhoods";
import { appConfig } from "@/lib/config";

/**
 * Generate SEO metadata for neighborhood landing pages
 * @param neighborhood - The neighborhood data
 * @param propertyCount - Number of properties in this neighborhood
 * @returns Metadata object for Next.js
 */
export function generateNeighborhoodMetadata(
  neighborhood: Neighborhood, 
  propertyCount: number
): Metadata {
  const siteUrl = appConfig.appUrl;
  const canonicalUrl = `${siteUrl}/${neighborhood.slug}`;
  
  // Generate title
  const title = neighborhood.seo_title || 
    `Имоти в ${neighborhood.name_bg}, Стара Загора - ${propertyCount} обяви | Nova Nest`;
  
  // Generate description
  const description = neighborhood.seo_description || 
    generateDefaultDescription(neighborhood, propertyCount);
  
  // Generate keywords
  const keywords = generateNeighborhoodKeywords(neighborhood);
  
  // Generate Open Graph image - using fallback generic image
  // TODO: Create neighborhood-specific images if needed in the future
  const ogImage = `${siteUrl}/images/og-default.svg`;
  
  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Nova Nest Real Estate",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Имоти в ${neighborhood.name_bg}, Стара Загора`,
        },
      ],
      locale: "bg_BG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate default description for neighborhood pages
 * @param neighborhood - The neighborhood data
 * @param propertyCount - Number of properties
 * @returns Generated description string
 */
function generateDefaultDescription(neighborhood: Neighborhood, propertyCount: number): string {
  const descriptionStart = neighborhood.description 
    ? neighborhood.description.substring(0, 100)
    : `Квартал ${neighborhood.name_bg} в Стара Загора`;
  
  return `Открийте ${propertyCount} имота в ${neighborhood.name_bg}, Стара Загора. Апартаменти, къщи и офиси за продажба и под наем. ${descriptionStart}...`;
}

/**
 * Generate SEO keywords for neighborhood pages
 * @param neighborhood - The neighborhood data
 * @returns Array of keyword strings
 */
function generateNeighborhoodKeywords(neighborhood: Neighborhood): string[] {
  const baseKeywords = [
    `имоти ${neighborhood.name_bg}`,
    `апартаменти ${neighborhood.name_bg}`,
    `къщи ${neighborhood.name_bg}`,
    `${neighborhood.name_bg} стара загора`,
    `недвижими имоти ${neighborhood.name_bg}`,
    "имоти стара загора",
    "апартаменти стара загора",
    "къщи стара загора",
    "nova nest",
    "агенция недвижими имоти",
  ];

  // Add specific keywords based on neighborhood name
  const specificKeywords = getNeighborhoodSpecificKeywords(neighborhood.name_bg);
  
  return [...baseKeywords, ...specificKeywords];
}

/**
 * Get neighborhood-specific keywords based on the neighborhood name
 * @param neighborhoodName - The neighborhood name in Bulgarian
 * @returns Array of specific keywords
 */
function getNeighborhoodSpecificKeywords(neighborhoodName: string): string[] {
  const keywordMap: Record<string, string[]> = {
    "Център": [
      "апартаменти център стара загора",
      "имоти център стара загора",
      "жилища център стара загора",
      "офиси център стара загора",
    ],
    "Самара": [
      "къщи самара стара загора",
      "имоти самара стара загора",
      "къщи с двор самара",
      "семейни къщи самара",
    ],
    "Железник": [
      "имоти железник стара загора",
      "апартаменти железник",
      "къщи железник стара загора",
    ],
    "Аязмото": [
      "имоти аязмото стара загора",
      "апартаменти аязмото",
      "къщи аязмото стара загора",
    ],
    "Казански": [
      "имоти казански стара загора",
      "апартаменти казански",
      "къщи казански стара загора",
    ],
    "Три чучура": [
      "имоти три чучура стара загора",
      "апартаменти три чучура",
      "къщи три чучура стара загора",
    ],
    "Индустриална зона": [
      "офиси индустриална зона стара загора",
      "складове индустриална зона",
      "производствени помещения стара загора",
    ],
  };

  return keywordMap[neighborhoodName] || [];
}

/**
 * Generate structured data for neighborhood pages
 * @param neighborhood - The neighborhood data
 * @param propertyCount - Number of properties
 * @returns Structured data object
 */
export function generateNeighborhoodStructuredData(
  neighborhood: Neighborhood,
  propertyCount: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: neighborhood.name_bg,
    description: neighborhood.description || `Квартал ${neighborhood.name_bg} в Стара Загора`,
    containedInPlace: {
      "@type": "City",
      name: "Стара Загора",
      addressCountry: "BG",
    },
    geo: neighborhood.center_lat && neighborhood.center_lng ? {
      "@type": "GeoCoordinates",
      latitude: neighborhood.center_lat,
      longitude: neighborhood.center_lng,
    } : undefined,
    additionalProperty: {
      "@type": "PropertyValue",
      name: "available_properties",
      value: propertyCount,
    },
    url: `${appConfig.appUrl}/${neighborhood.slug}`,
  };
}
