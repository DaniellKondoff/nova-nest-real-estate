import type { PropertyType } from "@/types/property";

/**
 * SEO meta tag primitives for pages.
 *
 * Example:
 * const meta: SEOMetaTags = {
 *   title: "Имоти в Стара Загора | Nova Nest Real Estate",
 *   description: "Купи или наеми имот в Стара Загора. Професионално обслужване.",
 *   keywords: ["имоти", "Стара Загора", "апартаменти", "къщи"],
 *   canonical_url: "https://novanest.bg/",
 *   og_title: "Nova Nest Real Estate",
 *   og_description: "Имоти в Стара Загора",
 *   og_image: "https://novanest.bg/og.jpg",
 *   og_type: "website",
 *   twitter_card: "summary_large_image",
 * };
 */
export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string[];
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: "website" | "article";
  twitter_card: "summary" | "summary_large_image";
}

/**
 * LocalBusiness JSON-LD schema for Google, tailored to Stara Zagora.
 *
 * Example JSON-LD:
 * const ld: LocalBusiness = {
 *   "@context": "https://schema.org",
 *   "@type": "RealEstateAgent",
 *   name: "Nova Nest Real Estate",
 *   address: {
 *     streetAddress: "бул. Цар Симеон Велики 100",
 *     addressLocality: "Stara Zagora",
 *     postalCode: "6000",
 *     addressCountry: "BG",
 *   },
 *   telephone: "+359 88 123 4567",
 *   email: "contact@novanest.bg",
 *   url: "https://novanest.bg",
 *   geo: { latitude: 42.4258, longitude: 25.6345 },
 *   opening_hours: ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"],
 *   price_range: "$$",
 *   serves_cuisine: null,
 *   area_served: "Stara Zagora",
 *   business_type: "RealEstateAgent",
 * };
 */
export interface LocalBusiness {
  "@context"?: "https://schema.org";
  "@type": "RealEstateAgent";
  name: "Nova Nest Real Estate";
  address: {
    streetAddress: string;
    addressLocality: "Stara Zagora" | string;
    postalCode: string;
    addressCountry: "BG" | string;
  };
  telephone: string; // Bulgarian format like +359 XX XXX XXXX
  email: string;
  url: string;
  geo: {
    latitude: number;
    longitude: number;
  };
  opening_hours: string[];
  price_range: "$$";
  serves_cuisine: null;
  area_served: "Stara Zagora" | string;
  business_type: "RealEstateAgent";
}

/**
 * Property/Product JSON-LD for individual property pages.
 *
 * Example JSON-LD:
 * const product: PropertySchema = {
 *   "@context": "https://schema.org",
 *   "@type": "Product",
 *   name: "Тристаен апартамент в Стара Загора",
 *   description: "Просторен апартамент близо до центъра.",
 *   image: ["https://novanest.bg/p/123/1.jpg"],
 *   offers: {
 *     price: 125000,
 *     priceCurrency: "EUR",
 *     availability: "InStock",
 *   },
 *   location: {
 *     address: {
 *       streetAddress: "ул. Христо Ботев 10",
 *       addressLocality: "Stara Zagora",
 *       postalCode: "6000",
 *       addressCountry: "BG",
 *     },
 *     geo: { latitude: 42.4258, longitude: 25.6345 },
 *   },
 *   additional_property: {
 *     rooms: 3,
 *     area: 95,
 *   },
 * };
 */
export interface PropertySchema {
  "@context"?: "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image: string[];
  offers: {
    price: number;
    priceCurrency: "BGN" | "EUR";
    availability: "InStock" | "OutOfStock" | "PreOrder";
  };
  location: {
    address: {
      streetAddress: string;
      addressLocality: "Stara Zagora" | string;
      postalCode: string;
      addressCountry: "BG" | string;
    };
    geo: {
      latitude: number;
      longitude: number;
    };
  };
  additional_property: {
    rooms: number;
    area: number; // sqm
  };
}

/**
 * RealEstateAgent schema for organization/person pages.
 */
export interface RealEstateAgentSchema {
  "@context"?: "https://schema.org";
  "@type"?: "RealEstateAgent";
  name: string;
  telephone: string;
  email: string;
  url: string;
  serves_area: "Stara Zagora" | string;
  speciality: PropertyType[];
}

/**
 * Breadcrumb list for SEO.
 *
 * Example:
 * const breadcrumbs: BreadcrumbList = {
 *   "@context": "https://schema.org",
 *   "@type": "BreadcrumbList",
 *   items: [
 *     { name: "Начало", url: "https://novanest.bg/", position: 1 },
 *     { name: "Имоти", url: "https://novanest.bg/imoti", position: 2 },
 *   ],
 * };
 */
export interface BreadcrumbList {
  "@context"?: "https://schema.org";
  "@type"?: "BreadcrumbList";
  items: Array<{
    name: string;
    url: string;
    position: number;
  }>;
}

/**
 * Organization schema for brand footprint.
 */
export interface OrganizationSchema {
  "@context"?: "https://schema.org";
  "@type"?: "Organization";
  name: string;
  logo: string;
  url: string;
  same_as: string[]; // social profiles
  contact_point: {
    telephone: string;
    email: string;
  };
}

/**
 * Local SEO content structure for neighborhood landing pages.
 */
export interface LocalSEOPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  schema_markup: LocalBusiness | PropertySchema;
  content_blocks: any[];
}

/**
 * Sitemap entries for generating XML sitemaps.
 */
export interface SitemapEntry {
  url: string;
  last_modified: Date;
  change_frequency: "daily" | "weekly" | "monthly";
  priority: number; // 0-1
}

/**
 * Indexing preferences per page.
 */
export interface SearchEngineIndexing {
  robots: "index,follow" | "noindex,nofollow";
  canonical: string;
  alternate_languages: Array<{
    hreflang: string;
    href: string;
  }>;
}


