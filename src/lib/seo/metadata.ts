/**
 * SEO Metadata Generation Utilities for Nova Nest Real Estate
 * Provides functions to generate Next.js 14 Metadata objects
 */

import type { Metadata } from 'next';
import type { PageMetadata, OpenGraphMetadata, TwitterCardMetadata } from '@/types/seo';
import { SEO_CONFIG, DEFAULT_OG_IMAGE, DEFAULT_TWITTER_CARD, THEME_COLOR } from './config';

/**
 * Generates a complete Next.js Metadata object for a page
 * @param pageData - Page-specific metadata
 * @returns Next.js Metadata object
 */
export function generateMetadata(pageData: PageMetadata): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    image,
    noIndex = false
  } = pageData;

  const fullTitle = `${title} | ${SEO_CONFIG.siteName}`;
  const fullUrl = `${SEO_CONFIG.siteUrl}${path}`;
  const fullDescription = description || SEO_CONFIG.defaultDescription;
  const allKeywords = [...SEO_CONFIG.primaryKeywords, ...keywords];
  const ogImage = image || DEFAULT_OG_IMAGE.url;

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    authors: [{ name: SEO_CONFIG.siteName }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: generateOpenGraphMetadata({
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      image: ogImage
    }),
    twitter: generateTwitterCardMetadata({
      title: fullTitle,
      description: fullDescription,
      image: ogImage
    }),
    alternates: {
      canonical: fullUrl,
      languages: {
        'bg-BG': fullUrl,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    category: 'real estate',
    classification: 'Business',
    other: {
      'geo.region': 'BG-24',
      'geo.placename': SEO_CONFIG.location.city,
      'geo.position': `${SEO_CONFIG.location.coordinates.lat};${SEO_CONFIG.location.coordinates.lng}`,
      'ICBM': `${SEO_CONFIG.location.coordinates.lat}, ${SEO_CONFIG.location.coordinates.lng}`,
      'contact:phone_number': SEO_CONFIG.contact.phone,
      'contact:email': SEO_CONFIG.contact.email,
      'contact:country_name': SEO_CONFIG.location.country,
      'contact:locality': SEO_CONFIG.location.city,
      'contact:region': SEO_CONFIG.location.region,
    }
  };

  return metadata;
}

/**
 * Generates OpenGraph metadata for social media sharing
 * @param data - OpenGraph data
 * @returns OpenGraph metadata object
 */
export function generateOpenGraphMetadata(data: {
  title: string;
  description: string;
  url: string;
  image: string;
}): OpenGraphMetadata {
  return {
    title: data.title,
    description: data.description,
    url: data.url,
    siteName: SEO_CONFIG.siteName,
    locale: SEO_CONFIG.locale,
    type: 'website',
    images: [
      {
        url: data.image,
        width: DEFAULT_OG_IMAGE.width,
        height: DEFAULT_OG_IMAGE.height,
        alt: DEFAULT_OG_IMAGE.alt,
      }
    ],
  };
}

/**
 * Generates Twitter Card metadata for Twitter sharing
 * @param data - Twitter Card data
 * @returns Twitter Card metadata object
 */
export function generateTwitterCardMetadata(data: {
  title: string;
  description: string;
  image: string;
}): TwitterCardMetadata {
  return {
    card: DEFAULT_TWITTER_CARD.card,
    site: DEFAULT_TWITTER_CARD.site,
    creator: DEFAULT_TWITTER_CARD.creator,
    title: data.title,
    description: data.description,
    image: data.image,
    imageAlt: DEFAULT_OG_IMAGE.alt,
  };
}

/**
 * Helper function to generate page metadata with common patterns
 * @param title - Page title
 * @param description - Page description
 * @param path - Page path
 * @param options - Additional options
 * @returns PageMetadata object
 */
export function generatePageMetadata(
  title: string,
  description: string,
  path: string,
  options: {
    keywords?: string[];
    image?: string;
    noIndex?: boolean;
  } = {}
): PageMetadata {
  return {
    title,
    description,
    path,
    keywords: options.keywords,
    image: options.image,
    noIndex: options.noIndex,
  };
}

/**
 * Generates the default site metadata for the root layout
 * @returns Default Metadata object
 */
export function generateDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(SEO_CONFIG.siteUrl),
    title: {
      template: `%s | ${SEO_CONFIG.siteName}`,
      default: SEO_CONFIG.defaultTitle,
    },
    description: SEO_CONFIG.defaultDescription,
    keywords: SEO_CONFIG.primaryKeywords,
    authors: [{ name: SEO_CONFIG.siteName }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: SEO_CONFIG.locale,
      url: SEO_CONFIG.siteUrl,
      title: SEO_CONFIG.defaultTitle,
      description: SEO_CONFIG.defaultDescription,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: DEFAULT_OG_IMAGE.url,
          width: DEFAULT_OG_IMAGE.width,
          height: DEFAULT_OG_IMAGE.height,
          alt: DEFAULT_OG_IMAGE.alt,
        }
      ],
    },
    twitter: {
      card: DEFAULT_TWITTER_CARD.card,
      site: DEFAULT_TWITTER_CARD.site,
      creator: DEFAULT_TWITTER_CARD.creator,
      title: SEO_CONFIG.defaultTitle,
      description: SEO_CONFIG.defaultDescription,
      images: [DEFAULT_OG_IMAGE.url],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.png', type: 'image/png' },
      ],
      apple: [
        { url: '/favicon.png', type: 'image/png' },
      ],
    },
    manifest: '/manifest.json',
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    category: 'real estate',
    classification: 'Business',
    other: {
      'geo.region': 'BG-24',
      'geo.placename': SEO_CONFIG.location.city,
      'geo.position': `${SEO_CONFIG.location.coordinates.lat};${SEO_CONFIG.location.coordinates.lng}`,
      'ICBM': `${SEO_CONFIG.location.coordinates.lat}, ${SEO_CONFIG.location.coordinates.lng}`,
      'contact:phone_number': SEO_CONFIG.contact.phone,
      'contact:email': SEO_CONFIG.contact.email,
      'contact:country_name': SEO_CONFIG.location.country,
      'contact:locality': SEO_CONFIG.location.city,
      'contact:region': SEO_CONFIG.location.region,
    }
  };
}

/**
 * Generates the default viewport configuration for the root layout
 * @returns Viewport configuration object
 */
export function generateDefaultViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: THEME_COLOR,
  };
}
