"use client";

import React from "react";
import Image from "next/image";
import { Camera, X, ChevronLeft, ChevronRight, Home } from "lucide-react";
import type { PropertyImage as PropertyImageType } from "@/types/property";
import { createPortal } from "react-dom";

export interface PropertyGalleryProps {
  images: PropertyImageType[];
  propertyTitle: string;
  priority?: boolean;
}

// Extend incoming image type with optional created_at for sorting fallback when available
type GalleryImage = PropertyImageType;

export default function PropertyGallery({ images, propertyTitle, priority = false }: PropertyGalleryProps): React.ReactElement {
  // Normalize and sort images: primary first, then by display_order, then by created_at
  const sortedImages: GalleryImage[] = React.useMemo(() => {
    const list: GalleryImage[] = (images ?? []).slice();
    list.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      const ao = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
      const bo = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
      return ao - bo;
    });
    return list;
  }, [images]);

  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState<boolean>(false);
  const [mainLoaded, setMainLoaded] = React.useState<boolean>(false);

  const total = sortedImages.length;
  const current = sortedImages[currentIndex];

  // Handle keyboard navigation and ESC for lightbox
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((idx) => (idx - 1 + total) % total);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((idx) => (idx + 1) % total);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, total]);

  // Preload adjacent images when lightbox is open
  React.useEffect(() => {
    if (!isLightboxOpen || total < 2) return;
    const preload = (idx: number) => {
      const img = sortedImages[idx];
      if (!img) return;
      const src = img.url;
      if (!src) return;
      const pre = new window.Image();
      pre.src = src;
    };
    preload((currentIndex + 1) % total);
    preload((currentIndex - 1 + total) % total);
  }, [isLightboxOpen, currentIndex, total, sortedImages]);

  // Touch gesture support in lightbox
  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 40; // px
    if (delta > threshold) {
      setCurrentIndex((idx) => (idx + 1) % total);
    } else if (delta < -threshold) {
      setCurrentIndex((idx) => (idx - 1 + total) % total);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className="relative w-full rounded-lg bg-gray-100 aspect-[16/9] flex items-center justify-center text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <Home className="h-8 w-8" aria-hidden />
          <span>Няма налични снимки</span>
        </div>
      </div>
    );
  }

  const mainSrc = current.url;
  const mainAlt = current.alt_text || propertyTitle;

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
        {!mainLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <Image
          src={mainSrc}
          alt={mainAlt}
          fill
          quality={85}
          priority={priority}
          sizes="100vw"
          style={{ objectFit: "cover" }}
          onLoadingComplete={() => setMainLoaded(true)}
          className="cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Counter badge */}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/70 backdrop-blur px-3 py-1 text-white text-sm inline-flex items-center gap-2">
          <Camera className="h-4 w-4" aria-hidden />
          <span className="font-medium">{currentIndex + 1} / {total}</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-3 -mx-1 px-1">
        <div
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onWheel={(e) => {
            // horizontal scroll with mouse wheel
            const el = e.currentTarget as HTMLDivElement;
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              el.scrollLeft += e.deltaY;
            }
          }}
        >
          {sortedImages.map((img, idx) => {
            const thumbSrc = img.url;
            const isActive = idx === currentIndex;
            return (
              <button
                key={String(img.id)}
                type="button"
                className={`relative w-24 h-24 rounded-md overflow-hidden border-2 ${isActive ? "border-[#d4af37]" : "border-transparent"} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Покажи изображение ${idx + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                <Image
                  src={thumbSrc}
                  alt={img.alt_text || propertyTitle}
                  fill
                  sizes="96px"
                  quality={70}
                  className="object-cover transition-opacity duration-300 hover:opacity-80"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && typeof document !== "undefined" && createPortal(
        <Lightbox
          images={sortedImages}
          startIndex={currentIndex}
          onClose={() => setIsLightboxOpen(false)}
          onIndexChange={setCurrentIndex}
          propertyTitle={propertyTitle}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />,
        document.body
      )}

      {/* SR-only live region for announcing index changes */}
      <span className="sr-only" aria-live="polite">
        Показано изображение {currentIndex + 1} от {total}
      </span>
    </div>
  );
}

type LightboxProps = {
  images: GalleryImage[];
  startIndex: number;
  onClose: () => void;
  onIndexChange: (idx: number) => void;
  propertyTitle: string;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
};

function Lightbox({ images, startIndex, onClose, onIndexChange, propertyTitle, onTouchStart, onTouchMove, onTouchEnd }: LightboxProps) {
  const [index, setIndex] = React.useState<number>(startIndex);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const total = images.length;

  React.useEffect(() => {
    onIndexChange(index);
  }, [index, onIndexChange]);

  // Focus management: focus close button when mounted
  React.useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const prev = React.useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const next = React.useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  const src = images[index].url;
  const alt = images[index].alt_text || propertyTitle;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Галерия на имота"
      onClick={(e) => {
        // click outside to close (avoid clicks on controls/image)
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        ref={closeButtonRef}
        type="button"
        aria-label="Затвори"
        className="absolute top-4 right-4 z-50 rounded-full p-2 bg-black/20 hover:bg-black/40 text-white hover:text-[#d4af37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] transition-all duration-200"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="h-7 w-7" />
      </button>

      {/* Prev/Next */}
      <button
        type="button"
        aria-label="Предишна снимка"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full p-3 bg-black/20 hover:bg-black/40 text-white hover:text-[#d4af37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] transition-all duration-200"
        onClick={(e) => { 
          e.preventDefault();
          e.stopPropagation(); 
          prev(); 
          setLoaded(false); 
        }}
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <button
        type="button"
        aria-label="Следваща снимка"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full p-3 bg-black/20 hover:bg-black/40 text-white hover:text-[#d4af37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] transition-all duration-200"
        onClick={(e) => { 
          e.preventDefault();
          e.stopPropagation(); 
          next(); 
          setLoaded(false); 
        }}
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/20 rounded-full px-4 py-2 text-sm text-white">
        {index + 1} / {total}
      </div>

      {/* Centered image */}
      <div className="absolute inset-0 flex items-center justify-center">
        {!loaded && (
          <div className="absolute h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        )}
        <div className="relative max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="90vw"
            quality={85}
            style={{ objectFit: "contain" }}
            onLoadingComplete={() => setLoaded(true)}
            priority
          />
        </div>
      </div>
    </div>
  );
}


