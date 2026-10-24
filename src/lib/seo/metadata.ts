/**
 * SEO Metadata Generation Utilities for Nova Nest Real Estate
 * Provides functions to generate Next.js Metadata objects
 */

import type { Metadata } from 'next';
import type { PageMetadata } from '@/types/seo';
import { SEO_CONFIG, DEFAULT_OG_IMAGE, THEME_COLOR, absoluteUrl } from './config';

/** Root title template – page titles must NOT contain the brand themselves (short brand leaves room for keywords) */
export const TITLE_TEMPLATE = '%s | Nova Nest';

/** Robots directives for indexable pages (large image previews for listing photos) */
export const INDEX_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

/** Keep crawling links on the page, but keep the page itself out of the index */
export const NOINDEX_FOLLOW_ROBOTS: Metadata['robots'] = { index: false, follow: true };

/** Local business hints – harmless for Google, still read by some regional engines */
const GEO_META = {
  'geo.region': 'BG-24',
  'geo.placename': SEO_CONFIG.location.city,
  'geo.position': `${SEO_CONFIG.location.coordinates.lat};${SEO_CONFIG.location.coordinates.lng}`,
  'ICBM': `${SEO_CONFIG.location.coordinates.lat}, ${SEO_CONFIG.location.coordinates.lng}`,
};

/**
 * Trims text to a search-snippet friendly length on a word boundary
 * @param text - Source text (whitespace is collapsed)
 * @param maxLength - Maximum length including the ellipsis
 */
export function toMetaDescription(text: string, maxLength = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
}

/**
 * Generates a complete Next.js Metadata object for a page
 * @param pageData - Page-specific metadata; `title` is without the brand (the root template adds it)
 * @returns Next.js Metadata object
 */
export function generateMetadata(pageData: PageMetadata): Metadata {
  const { title, description, path, image, noIndex = false, absoluteTitle = false } = pageData;

  const url = absoluteUrl(path);
  const fullDescription = toMetaDescription(description || SEO_CONFIG.defaultDescription);
  const socialTitle = absoluteTitle ? title : TITLE_TEMPLATE.replace('%s', title);
  const images = [{ ...DEFAULT_OG_IMAGE, ...(image ? { url: image } : {}) }];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: fullDescription,
    robots: noIndex ? NOINDEX_FOLLOW_ROBOTS : INDEX_ROBOTS,
    openGraph: {
      title: socialTitle,
      description: fullDescription,
      url,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: fullDescription,
      images: images.map((img) => img.url),
    },
    alternates: { canonical: url },
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
      template: TITLE_TEMPLATE,
      default: SEO_CONFIG.defaultTitle,
    },
    description: SEO_CONFIG.defaultDescription,
    applicationName: SEO_CONFIG.siteName,
    authors: [{ name: SEO_CONFIG.siteName }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: INDEX_ROBOTS,
    openGraph: {
      type: 'website',
      locale: SEO_CONFIG.locale,
      url: absoluteUrl('/'),
      title: SEO_CONFIG.defaultTitle,
      description: SEO_CONFIG.defaultDescription,
      siteName: SEO_CONFIG.siteName,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
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
    other: GEO_META,
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
    viewportFit: "cover" as const,
    interactiveWidget: "resizes-content" as const,
    colorScheme: "light" as const,
  };
}
