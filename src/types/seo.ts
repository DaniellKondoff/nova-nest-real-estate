/**
 * SEO Configuration Types for Nova Nest Real Estate
 */

export interface SEOLocation {
  city: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ContactInfo {
  phone: string;
  email: string;
}

export interface SocialMedia {
  facebook: string;
  instagram: string;
}

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  primaryKeywords: string[];
  locale: string;
  location: SEOLocation;
  contact: ContactInfo;
  social: SocialMedia;
}

export interface PageMetadata {
  /** Page title without the brand – the root layout template appends it */
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  /** Use the title verbatim (it already carries its own brand suffix) */
  absoluteTitle?: boolean;
}
