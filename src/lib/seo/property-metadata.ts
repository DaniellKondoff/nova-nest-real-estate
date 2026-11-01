/**
 * Dynamic Property Metadata Generation for Nova Nest Real Estate
 * Generates SEO-optimized metadata for property detail pages
 */

import type { Metadata } from 'next';
import type { PropertyWithDetails } from '@/types/property';
import { formatPrice } from '@/components/property/utils';
import { SEO_CONFIG, absoluteUrl } from './config';
import { INDEX_ROBOTS, NOINDEX_FOLLOW_ROBOTS, TITLE_TEMPLATE, toMetaDescription } from './metadata';
import { propertyPath } from './property-slug';

/** Length of the brand suffix the root template appends */
const SUFFIX_LENGTH = TITLE_TEMPLATE.replace('%s', '').length;
/** Google truncates titles at roughly 60 characters */
const MAX_TITLE_LENGTH = 65;

/** Sold or rented listings stay reachable for visitors, but leave the index */
export function isClosedListing(status: string | null | undefined): boolean {
  return status === 'sold' || status === 'rented';
}

function hasPrice(price: number | null | undefined): price is number {
  return typeof price === 'number' && price > 0;
}

/** "кв. Казански" for city districts, "село Обручище" for villages (stored as neighborhoods) */
export function neighborhoodLabel(name: string | null | undefined): string | null {
  const clean = name?.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const village = clean.match(/^(?:село|с\.)\s*(.+)$/i);
  return village ? `село ${village[1]}` : `кв. ${clean}`;
}

/** Normalizes shouted admin headlines ("ПРОДАВА 2-СТАЕН") to sentence case; mixed-case titles stay as typed */
export function displayTitle(title: string): string {
  const clean = title.replace(/\s+/g, ' ').trim();
  if (/[a-zа-я]/.test(clean)) return clean;
  const lower = clean.toLocaleLowerCase('bg');
  return lower.charAt(0).toLocaleUpperCase('bg') + lower.slice(1);
}

/** Whole square metres for headlines and snippets ("53.01" → "53"); the schema keeps the exact value */
function displayArea(areaSqm: number): string {
  return `${Math.round(areaSqm)} м²`;
}

/**
 * Admin descriptions often start with shouted, pipe-separated fact lines
 * ("2+КУХНЯ | КВ. ОПЪЛЧЕНСКИ | 53 КВ.М") that repeat the facts already in the snippet.
 * Keeps only the prose lines.
 */
function metaDescriptionText(raw: string): string {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || line.includes('|')) return false;
      const letters = line.match(/\p{L}/gu) ?? [];
      const upper = letters.filter((c) => c !== c.toLocaleLowerCase('bg')).length;
      return letters.length > 0 && upper / letters.length <= 0.6;
    })
    .join(' ');
}

function headlineParts(property: PropertyWithDetails) {
  const { property: prop, neighborhood, category } = property;
  const kind = `${category?.name_bg ?? 'Имот'} ${prop.operation_type === 'rent' ? 'под наем' : 'за продажба'}`;
  const area = prop.area_sqm ? `, ${displayArea(prop.area_sqm)}` : '';
  const nbh = neighborhoodLabel(neighborhood?.name_bg);
  const where = nbh ? `, ${nbh}` : '';
  return { kind, area, where };
}

/**
 * Fact-based H1: "Апартамент за продажба, 53 м², кв. Опълченски".
 * Room adjectives (двустаен…) are left out on purpose – admins count the kitchen inconsistently.
 */
export function propertyHeadline(property: PropertyWithDetails): string {
  const { kind, area, where } = headlineParts(property);
  return `${kind}${area}${where}`;
}

/**
 * "Апартамент за продажба, 53 м², кв. Опълченски – 79 990 €" (the root template appends "| Nova Nest").
 * Mirrors the H1; an explicit admin seo_title wins when it fits.
 */
function generatePropertyTitle(property: PropertyWithDetails): string {
  const { property: prop } = property;
  const { kind, area, where } = headlineParts(property);
  const price = hasPrice(prop.price_eur) ? ` – ${formatPrice(prop.price_eur)}` : '';
  const seoTitle = prop.seo_title?.replace(/\s+/g, ' ').trim();

  const candidates = [
    ...(seoTitle ? [seoTitle] : []),
    `${kind}${area}${where}${price}`,
    `${kind}${where}${price}`,
    `${kind}${area}${where}`,
  ];
  return candidates.find((c) => c.length + SUFFIX_LENGTH <= MAX_TITLE_LENGTH) ?? `${kind}${where}`;
}

/**
 * "Апартамент за продажба в Аязмото, Стара Загора: 68 м², 2 стаи, етаж 5/8. Цена 89 000 € (1 309 €/м²). …"
 */
function generatePropertyDescription(property: PropertyWithDetails): string {
  const { property: prop, category, neighborhood } = property;

  if (prop.seo_description) return toMetaDescription(prop.seo_description);

  const operation = prop.operation_type === 'rent' ? 'под наем' : 'за продажба';
  const nbh = neighborhoodLabel(neighborhood?.name_bg);
  const where = nbh ? `в ${nbh}, Стара Загора` : 'в Стара Загора';
  const facts: string[] = [];
  if (prop.area_sqm) facts.push(displayArea(prop.area_sqm));
  if (prop.rooms) facts.push(prop.rooms === 1 ? '1 стая' : `${prop.rooms} стаи`);
  if (typeof prop.floor === 'number') facts.push(`етаж ${prop.floor}${prop.total_floors ? `/${prop.total_floors}` : ''}`);

  let text = `${category?.name_bg ?? 'Имот'} ${operation} ${where}${facts.length ? `: ${facts.join(', ')}` : ''}.`;
  if (hasPrice(prop.price_eur)) {
    const perSqm = prop.area_sqm && prop.operation_type !== 'rent'
      ? ` (${formatPrice(Math.round(prop.price_eur / prop.area_sqm))}/м²)`
      : '';
    text += ` Цена ${formatPrice(prop.price_eur)}${perSqm}.`;
  }
  const prose = prop.description_bg ? metaDescriptionText(prop.description_bg) : '';
  if (prose) text += ` ${prose}`;

  return toMetaDescription(text);
}

/**
 * Generates comprehensive metadata for property detail pages.
 * The OG image comes from the route's opengraph-image.tsx (file-based metadata wins).
 * @param property - Property with details
 * @returns Next.js Metadata object optimized for SEO
 */
export function generatePropertyMetadata(property: PropertyWithDetails): Metadata {
  const { property: prop } = property;

  const title = generatePropertyTitle(property);
  const socialTitle = TITLE_TEMPLATE.replace('%s', title);
  const description = generatePropertyDescription(property);
  const url = absoluteUrl(propertyPath(prop.id, prop.slug));

  return {
    title,
    description,
    robots: isClosedListing(prop.status) ? NOINDEX_FOLLOW_ROBOTS : INDEX_ROBOTS,
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
    alternates: { canonical: url },
  };
}

/**
 * Generates metadata for property not found case
 * @returns Default metadata for 404 case
 */
export function generatePropertyNotFoundMetadata(): Metadata {
  return {
    title: 'Имотът не е намерен',
    description: 'Търсеният имот не е намерен. Разгледайте нашите други предложения за недвижими имоти в Стара Загора.',
    robots: { index: false, follow: true },
  };
}
