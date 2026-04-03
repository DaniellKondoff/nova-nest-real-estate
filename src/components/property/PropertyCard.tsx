"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Square, BedDouble, Building2 } from "lucide-react";
import type { PropertyWithDetails } from "@/types/property";
import type { Tables } from "@/types/database.generated";
import { getPropertyUrlSlug } from "@/lib/seo/property-slug";

// New API props
export interface PropertyCardProps {
  property: PropertyWithDetails;
  priority?: boolean; // For Next/Image LCP optimization
}

// Legacy props for backward compatibility (used by older components)
interface LegacyPropertyCardProps {
  id: string;
  title_bg: string;
  price_eur: number;
  operation_type: "sale" | "rent";
  address_bg: string;
  neighborhood: { name_bg: string };
  area_sqm?: number;
  rooms?: number;
  bedrooms?: number;
  primary_image: { image_url: string; alt_text_bg?: string };
  is_new?: boolean;
  created_at: string;
  href?: string;
  className?: string;
}

function isLegacyProps(p: PropertyCardProps | LegacyPropertyCardProps): p is LegacyPropertyCardProps {
  return (p as PropertyCardProps).property === undefined;
}

// Helpers
export function isNewProperty(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - created <= sevenDaysMs;
}

export function getOperationTypeLabel(type: "sale" | "rent"): string {
  return type === "sale" ? "Продажба" : "Наем";
}

export function getPrimaryImage(property: PropertyWithDetails): { url: string; alt: string } {
  const primary = property.images.find((img) => (img as Tables<"property_images">).is_primary) || property.images[0];
  const imageUrl = (primary as Tables<"property_images"> | undefined)?.url || "/images/window.svg";
  const imageAlt = (primary as Tables<"property_images"> | undefined)?.alt_text_bg || property.property.title_bg || "Имот";
  return { url: imageUrl, alt: imageAlt };
}

export function formatPropertyDetails(property: PropertyWithDetails): string[] {
  const p = property.property as Tables<"properties">;
  const details: string[] = [];
  if (typeof p.area_sqm === "number" && p.area_sqm > 0) details.push(`${p.area_sqm} m²`);
  if (typeof p.rooms === "number" && p.rooms > 0) details.push(`${p.rooms} стаи`);
  if (typeof p.floor === "number" && p.floor > 0) details.push(`Етаж ${p.floor}`);
  return details;
}

function formatPriceEUR(value: number): string {
  return new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default function PropertyCard(props: PropertyCardProps | LegacyPropertyCardProps): React.ReactElement {
  // Normalize props to PropertyWithDetails
  let property: PropertyWithDetails;
  let priority = false;

  if (isLegacyProps(props)) {
    const p = props;
    const propRow = {
      id: p.id as unknown as Tables<"properties">["id"],
      title_bg: p.title_bg as Tables<"properties">["title_bg"],
      price_eur: p.price_eur as Tables<"properties">["price_eur"],
      operation_type: p.operation_type as unknown as Tables<"properties">["operation_type"],
      address_bg: p.address_bg as Tables<"properties">["address_bg"],
      area_sqm: (p.area_sqm ?? null) as Tables<"properties">["area_sqm"],
      rooms: (p.rooms ?? null) as Tables<"properties">["rooms"],
      bedrooms: (p.bedrooms ?? null) as Tables<"properties">["bedrooms"],
      is_new: (p.is_new ?? null) as Tables<"properties">["is_new"],
      created_at: p.created_at as Tables<"properties">["created_at"],
    } as unknown as Tables<"properties">;

    const images: Tables<"property_images">[] = [
      {
        id: 0 as unknown as Tables<"property_images">["id"],
        url: p.primary_image?.image_url,
        alt_text_bg: (p.primary_image?.alt_text_bg ?? null) as Tables<"property_images">["alt_text_bg"],
        alt_text_en: null as Tables<"property_images">["alt_text_en"],
        is_primary: true as Tables<"property_images">["is_primary"],
        property_id: 0 as unknown as Tables<"property_images">["property_id"],
        sort_order: 0 as unknown as Tables<"property_images">["sort_order"],
        file_size: null as Tables<"property_images">["file_size"],
        filename: null as Tables<"property_images">["filename"],
        height: null as Tables<"property_images">["height"],
        width: null as Tables<"property_images">["width"],
        created_at: new Date().toISOString() as Tables<"property_images">["created_at"],
      },
    ];

    property = {
      property: propRow,
      neighborhood: { name_bg: p.neighborhood?.name_bg } as unknown as Tables<"neighborhoods">,
      category: null as unknown as Tables<"property_categories">,
      images,
    };
    // Optional href/className are ignored in new API
  } else {
    property = props.property;
    priority = Boolean(props.priority);
  }

  const p = property.property as Tables<"properties">;
  const op: "sale" | "rent" = (p.operation_type as unknown as string) === "rent" ? "rent" : "sale";
  const price = typeof p.price_eur === "number" ? p.price_eur : 0;
  const { url, alt } = getPrimaryImage(property);
  const createdAt = String(p.created_at || "");
  const showNew = isNewProperty(createdAt);
  const neighborhoodName = (property.neighborhood as Tables<"neighborhoods"> | null)?.name_bg || "";
  const hasArea = typeof p.area_sqm === "number" && p.area_sqm > 0;
  const rooms = p.rooms;
  const floor = p.floor;

  // Generate SEO-friendly URL with slug if available
  const href = p.slug 
    ? `/properties/${getPropertyUrlSlug(p.id, p.slug)}`
    : `/properties/${String(p.id)}`;

  return (
    <Link
      href={href}
      prefetch
      aria-label={`${p.title_bg} – ${getOperationTypeLabel(op)}`}
      className="block h-full overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-md cursor-pointer"
    >
      {/* Image section */}
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={url}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Operation type badge */}
        <span className="absolute top-4 right-4 rounded bg-white/90 px-2 py-1 text-xs font-medium text-[#1a2642] backdrop-blur-sm">
          {getOperationTypeLabel(op)}
        </span>
        {/* New badge */}
        {showNew ? (
          <span className="absolute top-4 left-4 rounded-md bg-[#d4af37] px-3 py-1 text-xs font-semibold uppercase text-white">НОВО</span>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Price */}
        <div className="mt-4 mb-2 text-xl sm:text-2xl font-semibold text-[#1a2642]">{formatPriceEUR(price)}</div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-base sm:text-lg font-medium text-[#2d3748]">{p.title_bg}</h3>

        {/* Details row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {hasArea ? (
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4" aria-hidden />
              <span>{p.area_sqm} m²</span>
            </div>
          ) : null}
          {typeof rooms === "number" && rooms > 0 ? (
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4" aria-hidden />
              <span>{rooms} стаи</span>
            </div>
          ) : null}
          {typeof floor === "number" && floor > 0 ? (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" aria-hidden />
              <span>Етаж {floor}</span>
            </div>
          ) : null}
        </div>

        {/* Neighborhood */}
        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin className="w-4 h-4" aria-hidden />
          <span>{neighborhoodName ? `Квартал ${neighborhoodName}` : "Стара Загора"}</span>
        </div>
      </div>
    </Link>
  );
}


