import React from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, Home, Images } from "lucide-react";
import type { PropertyImage as PropertyImageType } from "@/types/property";
import { cn } from "@/lib/utils";
import PropertyGalleryLightbox from "./PropertyGalleryLightbox";

export interface PropertyGalleryProps {
  images: PropertyImageType[];
  propertyTitle: string;
  priority?: boolean;
}

const BENTO_COUNT = 5;

/** Grid placement for the lg+ bento, depending on how many images exist */
function bentoClasses(total: number): { grid: string; item: (idx: number) => string } {
  if (total === 1) return { grid: "lg:grid-cols-1 lg:grid-rows-1", item: () => "" };
  if (total < BENTO_COUNT) {
    // Large image left, the rest stacked on the right
    return {
      grid: `lg:grid-cols-3 ${total === 2 ? "lg:grid-rows-1" : total === 3 ? "lg:grid-rows-2" : "lg:grid-rows-3"}`,
      item: (idx) => (idx === 0 ? "lg:col-span-2 lg:row-span-full" : ""),
    };
  }
  return { grid: "lg:grid-cols-4 lg:grid-rows-2", item: (idx) => (idx === 0 ? "lg:col-span-2 lg:row-span-2" : "") };
}

/**
 * Property gallery – server component.
 * - Mobile/tablet: full-bleed, swipeable CSS scroll-snap strip (works without JS), one photo per flick,
 *   per-slide counter; prev/next arrows only for mouse/trackpad
 * - lg+: bento grid (1 large + 4 small) with a "+N снимки" tile
 * - Tapping any image opens the lightbox (client island via event delegation)
 */
export default function PropertyGallery({ images, propertyTitle, priority = false }: PropertyGalleryProps) {
  const sorted = [...(images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.order ?? 0) - (b.order ?? 0)
  );
  const total = sorted.length;

  if (total === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-primary to-primary-light text-white/80 sm:rounded-card lg:aspect-[21/9]">
        <div className="flex flex-col items-center gap-2">
          <Home className="h-10 w-10 text-accent" aria-hidden="true" />
          <span>Няма налични снимки</span>
        </div>
      </div>
    );
  }

  const bento = bentoClasses(total);
  const extra = total - BENTO_COUNT;

  return (
    <PropertyGalleryLightbox images={sorted.map((img) => ({ url: img.url, alt: img.alt_text || propertyTitle }))}>
      <div className="relative">
        <ul
          aria-label={`Снимки на имота (${total})`}
          className={cn(
            "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain no-scrollbar sm:gap-2 sm:rounded-card",
            "lg:grid lg:h-[min(62vh,560px)] lg:gap-2 lg:overflow-hidden",
            bento.grid
          )}
        >
          {sorted.map((img, idx) => {
            const isLastBento = idx === BENTO_COUNT - 1 && extra > 0;
            return (
              <li
                key={img.id}
                className={cn(
                  "relative aspect-[4/3] w-full shrink-0 snap-center snap-always sm:w-[85%] md:w-[70%] lg:aspect-auto lg:w-auto",
                  total === 1 && "sm:w-full md:w-full lg:aspect-[21/9]",
                  idx >= BENTO_COUNT && "lg:hidden",
                  bento.item(idx)
                )}
              >
                <button
                  type="button"
                  data-gallery-index={idx}
                  aria-label={`Отвори снимка ${idx + 1} от ${total}`}
                  className="group absolute inset-0 overflow-hidden bg-gray-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent sm:rounded-xl lg:rounded-none"
                >
                  <Image
                    src={img.url}
                    alt={img.alt_text || propertyTitle}
                    fill
                    priority={priority && idx === 0}
                    quality={idx === 0 ? 85 : 75}
                    sizes={
                      idx === 0
                        ? "(min-width: 1280px) 640px, (min-width: 1024px) 50vw, (min-width: 768px) 70vw, (min-width: 640px) 85vw, 100vw"
                        : "(min-width: 1280px) 320px, (min-width: 1024px) 25vw, (min-width: 768px) 70vw, (min-width: 640px) 85vw, 100vw"
                    }
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  {/* Per-slide counter (mobile strip) */}
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur lg:hidden">
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    {idx + 1} / {total}
                  </span>
                  {/* "+N" overlay on the last bento tile */}
                  {isLastBento && (
                    <span className="absolute inset-0 hidden items-center justify-center bg-primary/60 text-lg font-semibold text-white backdrop-blur-[2px] lg:flex">
                      +{extra} снимки
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Strip arrows for mouse/trackpad below lg (touch users swipe) */}
        {total > 1 &&
          (["prev", "next"] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              data-gallery-scroll={dir}
              aria-label={dir === "prev" ? "Предишна снимка" : "Следваща снимка"}
              className={cn(
                "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary shadow-lift transition-colors hover:bg-white pointer-fine:max-lg:flex",
                dir === "prev" ? "left-3" : "right-3"
              )}
            >
              {dir === "prev" ? (
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          ))}

        {total > 1 && (
          <button
            type="button"
            data-gallery-index={0}
            className="absolute bottom-4 right-4 hidden h-11 items-center gap-2 rounded-xl bg-white/95 px-4 text-sm font-semibold text-primary shadow-lift transition-colors hover:bg-white lg:inline-flex"
          >
            <Images className="h-4 w-4" aria-hidden="true" />
            Всички снимки ({total})
          </button>
        )}
      </div>
    </PropertyGalleryLightbox>
  );
}
