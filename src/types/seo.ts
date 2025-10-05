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
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}

export interface OpenGraphMetadata {
  title: string;
  description: string;
  url: string;
  siteName: string;
  locale: string;
  type: 'website' | 'article';
  images: Array<{
    url: string;
    width: number;
    height: number;
    alt: string;
  }>;
}

export interface TwitterCardMetadata {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}