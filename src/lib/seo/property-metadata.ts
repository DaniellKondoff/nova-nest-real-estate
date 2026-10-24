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

/**
 * "Продава 2-стаен, Казански – 86 000 €" (the root template appends "| Nova Nest")
 * Uses the admin title when it fits; long titles fall back to a fact-based one
 * ("Апартамент за продажба, 53 м², Опълченски – 79 990 €") so Google doesn't truncate it.
 */
function generatePropertyTitle(property: PropertyWithDetails): string {
  const { property: prop, neighborhood, category } = property;
  const base = (prop.seo_title || prop.title_bg).replace(/\s+/g, ' ').trim();
  const nbh = neighborhood?.name_bg.trim();
  const withNbh = nbh && !base.toLowerCase().includes(nbh.toLowerCase()) ? `${base}, ${nbh}` : base;
  const price = hasPrice(prop.price_eur) ? ` – ${formatPrice(prop.price_eur)}` : '';

  const facts = `${category?.name_bg ?? 'Имот'} ${prop.operation_type === 'rent' ? 'под наем' : 'за продажба'}`;
  const area = prop.area_sqm ? `, ${prop.area_sqm} м²` : '';
  const where = nbh ? `, ${nbh}` : '';

  const candidates = [
    `${withNbh}${price}`,
    withNbh,
    base,
    `${facts}${area}${where}${price}`,
    `${facts}${where}${price}`,
    `${facts}${where}`,
  ];
  return candidates.find((c) => c.length + SUFFIX_LENGTH <= MAX_TITLE_LENGTH) ?? `${facts}${where}`;
}

/**
 * "Апартамент за продажба в Аязмото, Стара Загора: 68 м², 2 стаи, етаж 5/8. Цена 89 000 € (1 309 €/м²). …"
 */
function generatePropertyDescription(property: PropertyWithDetails): string {
  const { property: prop, category, neighborhood } = property;

  if (prop.seo_description) return toMetaDescription(prop.seo_description);

  const operation = prop.operation_type === 'rent' ? 'под наем' : 'за продажба';
  const where = neighborhood?.name_bg ? `в ${neighborhood.name_bg}, Стара Загора` : 'в Стара Загора';
  const facts: string[] = [];
  if (prop.area_sqm) facts.push(`${prop.area_sqm} м²`);
  if (prop.rooms) facts.push(prop.rooms === 1 ? '1 стая' : `${prop.rooms} стаи`);
  if (typeof prop.floor === 'number') facts.push(`етаж ${prop.floor}${prop.total_floors ? `/${prop.total_floors}` : ''}`);

  let text = `${category?.name_bg ?? 'Имот'} ${operation} ${where}${facts.length ? `: ${facts.join(', ')}` : ''}.`;
  if (hasPrice(prop.price_eur)) {
    const perSqm = prop.area_sqm && prop.operation_type !== 'rent'
      ? ` (${formatPrice(Math.round(prop.price_eur / prop.area_sqm))}/м²)`
      : '';
    text += ` Цена ${formatPrice(prop.price_eur)}${perSqm}.`;
  }
  if (prop.description_bg) text += ` ${prop.description_bg}`;

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
