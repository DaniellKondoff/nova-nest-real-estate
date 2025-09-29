import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Square, Home as HomeIcon, Bed } from "lucide-react";

export type OperationType = "sale" | "rent";

export interface PropertyCardProps {
  id: string;
  title_bg: string;
  price_eur: number;
  operation_type: OperationType;
  address_bg: string;
  neighborhood: { name_bg: string };
  area_sqm?: number;
  rooms?: number;
  bedrooms?: number;
  primary_image: { image_url: string; alt_text_bg?: string };
  is_new?: boolean;
  created_at: string; // ISO string
  href?: string; // optional for future routing
  className?: string;
}

function formatPriceEUR(value: number): string {
  try {
    return new Intl.NumberFormat("bg-BG", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Fallback without Intl in unlikely environments
    return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
}

function isPropertyNew(isNewFlag: boolean | undefined, createdAtISO: string): boolean {
  if (isNewFlag) return true;
  const created = new Date(createdAtISO).getTime();
  if (Number.isNaN(created)) return false;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - created <= sevenDaysMs;
}

function getOperationLabel(type: OperationType): string {
  return type === "sale" ? "Продажба" : "Наем";
}

function getPriceSuffix(type: OperationType): string {
  return type === "rent" ? "/мес" : "";
}

export default function PropertyCard(props: PropertyCardProps): React.ReactElement {
  const {
    id,
    title_bg,
    price_eur,
    operation_type,
    address_bg,
    neighborhood,
    area_sqm,
    rooms,
    bedrooms,
    primary_image,
    is_new,
    created_at,
    href,
    className,
  } = props;

  const newBadge = isPropertyNew(is_new, created_at);
  const priceText = `€ ${formatPriceEUR(price_eur)}${getPriceSuffix(operation_type)}`;
  const operationLabel = getOperationLabel(operation_type);
  const locationText = `Квартал ${neighborhood?.name_bg}, Стара Загора`;
  const imageAlt = primary_image?.alt_text_bg || title_bg;

  const CardWrapper: React.ElementType = href ? Link : "div";
  const wrapperProps = href ? { href, "aria-label": `${title_bg} – ${operationLabel}` } : { "aria-label": `${title_bg} – ${operationLabel}` };

  return (
    <CardWrapper
      {...(wrapperProps as any)}
      className={[
        "block h-full overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={primary_image?.image_url || "/images/window.svg"}
          alt={imageAlt}
          fill
          priority={false}
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        {newBadge ? (
          <span className="absolute right-0 top-0 rounded-bl-lg bg-[#d4af37] px-3 py-1 text-sm font-semibold text-white">
            НОВО
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#1a2642]">{priceText}</div>
          <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{operationLabel}</span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-gray-900">{title_bg}</h3>

        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" aria-hidden />
          <span>{locationText}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {typeof area_sqm === "number" && area_sqm > 0 ? (
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" aria-hidden />
              <span>{area_sqm} m²</span>
            </div>
          ) : null}
          {typeof rooms === "number" && rooms > 0 ? (
            <div className="flex items-center gap-1">
              <HomeIcon className="h-4 w-4" aria-hidden />
              <span>{rooms} стаи</span>
            </div>
          ) : null}
          {typeof bedrooms === "number" && bedrooms > 0 ? (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" aria-hidden />
              <span>{bedrooms} спални</span>
            </div>
          ) : null}
        </div>
      </div>
    </CardWrapper>
  );
}


