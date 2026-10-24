"use client";

import React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxImage {
  url: string;
  alt: string;
}

/**
 * Client island for the server-rendered gallery: listens (via event delegation) for clicks on
 * elements with `data-gallery-index` and opens a full-screen, swipeable lightbox.
 */
export default function PropertyGalleryLightbox({
  images,
  children,
  className,
}: {
  images: LightboxImage[];
  children: React.ReactNode;
  className?: string;
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-gallery-index]");
    if (!target) return;
    const idx = Number(target.dataset.galleryIndex);
    if (Number.isFinite(idx)) setOpenIndex(idx);
  };

  return (
    <div className={className} onClick={onClick}>
      {children}
      {openIndex !== null &&
        createPortal(
          <Lightbox images={images} startIndex={openIndex} onClose={() => setOpenIndex(null)} />,
          document.body
        )}
    </div>
  );
}

function Lightbox({ images, startIndex, onClose }: { images: LightboxImage[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = React.useState(startIndex);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const touchStartX = React.useRef<number | null>(null);
  const total = images.length;

  const prev = React.useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const next = React.useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  // Focus, keyboard and scroll lock
  React.useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose, prev, next]);

  // Preload neighbours
  React.useEffect(() => {
    if (total < 2) return;
    [index + 1, index - 1].forEach((i) => {
      const img = images[(i + total) % total];
      if (img) new window.Image().src = img.url;
    });
  }, [index, images, total]);

  const current = images[index];
  const controlClass =
    "flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col bg-black/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Галерия на имота"
      onTouchStart={(e) => (touchStartX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStartX.current == null || e.touches.length > 0) return;
        const delta = touchStartX.current - (e.changedTouches[0]?.clientX ?? touchStartX.current);
        if (delta > 50) next();
        else if (delta < -50) prev();
        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <p className="text-sm font-medium tabular-nums text-white/80" aria-live="polite">
          {index + 1} / {total}
        </p>
        <button ref={closeRef} type="button" aria-label="Затвори галерията" className={controlClass} onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt}
          fill
          sizes="100vw"
          quality={85}
          className="object-contain"
          priority
        />
      </div>

      {total > 1 && (
        <div className="flex items-center justify-center gap-6 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button type="button" aria-label="Предишна снимка" className={controlClass} onClick={prev}>
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button type="button" aria-label="Следваща снимка" className={controlClass} onClick={next}>
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      )}
    </div>
  );
}
