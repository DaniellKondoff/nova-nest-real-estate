import type { SEOMetaTags, LocalBusiness, PropertySchema } from "@/types/seo";
import type { Property } from "@/types/property";
import { appConfig, buildCanonicalUrl } from "@/lib/config";

// Local SEO constants for Stara Zagora real estate
export const PRIMARY_KEYWORDS: string[] = [
  "имоти стара загора",
  "апартаменти стара загора",
  "къщи стара загора",
  "агенция недвижими имоти стара загора",
];

export const LONG_TAIL_KEYWORDS: string[] = [
  "двустаен апартамент център стара загора",
  "къща с двор самара стара загора",
  "офис под наем стара загора",
];

// URL structure mapping
export const URLS = {
  propertiesCity: "/imoti-stara-zagora",
  apartmentsCenter: "/apartamenti-centrum-stara-zagora",
  housesSamara: "/kushi-samara-stara-zagora",
} as const;

// Business & social profiles
export const BUSINESS = {
  name: "Nova Nest Real Estate",
  legalName: "Nova Nest OOD",
  url: appConfig.appUrl,
  phone: "+359 88 123 4567",
  email: "info@novanest.bg",
  address: {
    streetAddress: "бул. Цар Симеон Велики 100",
    addressLocality: "Stara Zagora",
    postalCode: "6000",
    addressCountry: "BG",
  },
  geo: { latitude: 42.4258, longitude: 25.6345 },
  openingHours: ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"],
  priceRange: "$$",
  social: {
    facebook: "https://www.facebook.com/novanest.bg",
    instagram: "https://www.instagram.com/novanest.bg",
    linkedin: "https://www.linkedin.com/company/novanest",
  },
} as const;

export const DEFAULT_META: Omit<SEOMetaTags, "canonical_url"> & { canonical_url?: string } = {
  title: "Имоти в Стара Загора | Nova Nest Real Estate",
  description:
    "Купи или наеми имот в Стара Загора. Апартаменти, къщи и офиси с професионално обслужване от Nova Nest.",
  keywords: [...PRIMARY_KEYWORDS, ...LONG_TAIL_KEYWORDS],
  canonical_url: undefined,
  og_title: "Nova Nest Real Estate",
  og_description: "Имоти в Стара Загора – апартаменти, къщи, офиси",
  og_image: `${appConfig.appUrl}/og.jpg`,
  og_type: "website",
  twitter_card: "summary_large_image",
};

// LocalBusiness structured data template for the Nova Nest office
export function getLocalBusinessSchema(): LocalBusiness {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: BUSINESS.name,
    address: BUSINESS.address,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    url: BUSINESS.url,
    geo: BUSINESS.geo,
    opening_hours: BUSINESS.openingHours,
    price_range: "$$",
    serves_cuisine: null,
    area_served: "Stara Zagora",
    business_type: "RealEstateAgent",
  };
}

// Default meta templates for dynamic pages
export function generatePropertyMeta(property: Property): SEOMetaTags {
  const title = `${property.title} | Имоти Стара Загора | ${appConfig.siteName}`;
  const description = `${property.description.substring(0, 155)}...`;
  const canonical_url = buildCanonicalUrl(`/imot/${property.id}`);
  const image = property.images.find((img) => img.is_primary) || property.images[0];
  return {
    title,
    description,
    keywords: [
      ...PRIMARY_KEYWORDS,
      property.location.neighborhood_id,
      property.type.toLowerCase?.() ?? String(property.type),
    ],
    canonical_url,
    og_title: title,
    og_description: description,
    og_image: image ? image.url : `${appConfig.appUrl}/og.jpg`,
    og_type: "article",
    twitter_card: "summary_large_image",
  };
}

export function generateNeighborhoodMeta(
  slug: keyof typeof URLS,
  opts?: { title?: string; description?: string }
): SEOMetaTags {
  const path = URLS[slug];
  const canonical_url = buildCanonicalUrl(path);
  const title =
    opts?.title ??
    (slug === "propertiesCity"
      ? "Имоти в Стара Загора – апартаменти, къщи, офиси"
      : slug === "apartmentsCenter"
      ? "Апартаменти в Центъра на Стара Загора"
      : "Къщи в квартал Самара – Стара Загора");
  const description =
    opts?.description ??
    "Открий своя нов дом в Стара Загора с Nova Nest. Локални оферти и професионално съдействие.";
  return {
    ...DEFAULT_META,
    title,
    description,
    keywords: PRIMARY_KEYWORDS,
    canonical_url,
    og_title: title,
    og_description: description,
    og_image: `${appConfig.appUrl}/og.jpg`,
    og_type: "website",
    twitter_card: "summary_large_image",
  };
}

// Structured data helpers
export function getPropertyStructuredData(property: Property): PropertySchema {
  const imageUrls = property.images.map((i) => i.url).slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: property.description,
    image: imageUrls,
    offers: {
      price: property.price,
      priceCurrency: property.currency,
      availability: property.is_active ? "InStock" : "OutOfStock",
    },
    location: {
      address: {
        streetAddress: property.location.address,
        addressLocality: property.location.city,
        postalCode: "6000",
        addressCountry: "BG",
      },
      geo: {
        latitude: property.location.latitude ?? 42.4258,
        longitude: property.location.longitude ?? 25.6345,
      },
    },
    additional_property: {
      rooms: property.features.rooms,
      area: property.features.area_sqm,
    },
  };
}

export function getStructuredData(type: "business"): LocalBusiness;
export function getStructuredData(type: "property", property: Property): PropertySchema;
export function getStructuredData(type: "business" | "property", property?: Property): any {
  if (type === "business") return getLocalBusinessSchema();
  if (type === "property" && property) return getPropertyStructuredData(property);
  throw new Error("Invalid structured data request");
}


