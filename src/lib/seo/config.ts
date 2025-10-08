/**
 * SEO Configuration for Nova Nest Real Estate
 * Centralized configuration for all SEO-related settings
 */

import type { SEOConfig } from '@/types/seo';

/**
 * Main SEO configuration object for Nova Nest Real Estate
 * Contains all site-wide SEO settings, contact information, and metadata
 */
export const SEO_CONFIG: SEOConfig = {
  siteName: 'Nova Nest Real Estate',
  siteUrl: 'https://novanest.bg',
  defaultTitle: 'Nova Nest - Недвижими имоти в Стара Загора',
  defaultDescription: 'Професионални услуги за недвижими имоти в Стара Загора. Апартаменти, къщи, офиси за продажба и под наем. Вашият надежден партньор.',
  primaryKeywords: [
    'имоти Стара Загора',
    'апартаменти Стара Загора',
    'къщи за продажба Стара Загора',
    'наем апартаменти Стара Загора',
    'агенция недвижими имоти',
    'недвижими имоти Стара Загора',
    'продажба имоти Стара Загора',
    'под наем Стара Загора',
    'офиси Стара Загора',
    'комерсиални имоти Стара Загора'
  ],
  locale: 'bg_BG',
  location: {
    city: 'Стара Загора',
    region: 'Стара Загора',
    country: 'Bulgaria',
    coordinates: {
      lat: 42.4258,
      lng: 25.6347
    }
  },
  contact: {
    phone: '+359899897776',
    email: 'info@novanest.bg'
  },
  social: {
    facebook: '',
    instagram: ''
  }
};

/**
 * Default OpenGraph image configuration
 * Note: Using SVG placeholder - replace with JPG/PNG for better social media compatibility
 */
export const DEFAULT_OG_IMAGE = {
  url: `${SEO_CONFIG.siteUrl}/images/og-default.svg`,
  width: 1200,
  height: 630,
  alt: `${SEO_CONFIG.siteName} - Недвижими имоти в Стара Загора`
};

/**
 * Default Twitter card configuration
 */
export const DEFAULT_TWITTER_CARD = {
  card: 'summary_large_image' as const,
  site: '@novanest_bg',
  creator: '@novanest_bg'
};

/**
 * Theme color for the application
 */
export const THEME_COLOR = '#1e40af';

/**
 * Viewport configuration
 */
export const VIEWPORT_CONFIG = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
};
