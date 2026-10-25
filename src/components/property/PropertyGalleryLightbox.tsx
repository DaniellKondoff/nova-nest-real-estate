"use client";

import React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  url: string;
  alt: string;
}

const ZOOM = 2.5;
/** Slides this far from the current one get their image mounted (the rest stay empty until reached) */
const PRELOAD_RANGE = 2;
const CLOSE_DRAG_PX = 100;

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";

/**
 * Client island for the server-rendered gallery. Via event delegation it:
 * - opens the full-screen lightbox for clicks on `[data-gallery-index]`
 * - scrolls the inline strip for clicks on `[data-gallery-scroll="prev|next"]` (pointer devices below lg)
 * After closing, the strip is scrolled to the photo the visitor stopped at.
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
  const rootRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const scrollBtn = target.closest<HTMLElement>("[data-gallery-scroll]");
    if (scrollBtn) {
      const strip = rootRef.current?.querySelector("ul");
      const slide = strip?.querySelector("li");
      if (strip && slide) {
        const dir = scrollBtn.dataset.galleryScroll === "prev" ? -1 : 1;
        strip.scrollBy({ left: dir * slide.clientWidth, behavior: scrollBehavior() });
      }
      return;
    }
    const opener = target.closest<HTMLElement>("[data-gallery-index]");
    if (!opener) return;
    const idx = Number(opener.dataset.galleryIndex);
    if (!Number.isFinite(idx)) return;
    openerRef.current = opener;
    setOpenIndex(idx);
  };

  const onClose = React.useCallback((lastIndex: number) => {
    setOpenIndex(null);
    const root = rootRef.current;
    const strip = root?.querySelector("ul");
    const slideBtn = root?.querySelector<HTMLElement>(`li [data-gallery-index="${lastIndex}"]`);
    // Strip (below lg): bring the last viewed photo into view and focus it; bento: return focus to the opener.
    // Absolute scrollTo – a relative scrollBy would be stopped at the next slide by snap-stop: always.
    if (strip && slideBtn && strip.scrollWidth > strip.clientWidth) {
      const s = strip.getBoundingClientRect();
      const li = slideBtn.closest("li")!.getBoundingClientRect();
      strip.scrollTo({ left: strip.scrollLeft + li.left - s.left - (s.width - li.width) / 2, behavior: "instant" });
      slideBtn.focus({ preventScroll: true });
    } else {
      openerRef.current?.focus({ preventScroll: true });
    }
  }, []);

  return (
    <div ref={rootRef} className={className} onClick={onClick}>
      {children}
      {openIndex !== null &&
        createPortal(<Lightbox images={images} startIndex={openIndex} onClose={onClose} />, document.body)}
    </div>
  );
}

type ZoomState = { index: number; width: number; height: number; scrollLeft: number; scrollTop: number };

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: LightboxImage[];
  startIndex: number;
  onClose: (lastIndex: number) => void;
}) {
  const total = images.length;
  const [index, setIndex] = React.useState(startIndex);
  const [mounted, setMounted] = React.useState<Set<number>>(() => near(startIndex, total));
  const [zoom, setZoom] = React.useState<ZoomState | null>(null);
  const [dragY, setDragY] = React.useState(0);

  const dialogRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const thumbsRef = React.useRef<HTMLDivElement>(null);
  const slideRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const indexRef = React.useRef(startIndex);
  const lastTap = React.useRef<{ t: number; x: number; y: number } | null>(null);
  const touch = React.useRef<{ x: number; y: number; axis: "x" | "y" | null } | null>(null);
  const closedRef = React.useRef(false);

  indexRef.current = index;

  const finish = React.useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose(indexRef.current);
  }, [onClose]);

  // Closing goes through history so the phone's back button/gesture closes the gallery instead of leaving the page
  const close = React.useCallback(() => {
    if (window.history.state?.gallery) window.history.back();
    else finish();
  }, [finish]);

  const goTo = React.useCallback(
    (i: number, behavior: ScrollBehavior = scrollBehavior()) => {
      const track = trackRef.current;
      if (!track) return;
      const target = Math.min(Math.max(i, 0), total - 1);
      setZoom(null);
      track.scrollTo({ left: target * track.clientWidth, behavior });
    },
    [total]
  );

  // Open: jump to the clicked photo, push a history entry, lock page scroll
  React.useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = startIndex * track.clientWidth;
    if (!window.history.state?.gallery) window.history.pushState({ gallery: true }, "");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    window.addEventListener("popstate", finish);
    return () => {
      window.removeEventListener("popstate", finish);
      document.body.style.overflow = prevOverflow;
    };
  }, [startIndex, finish]);

  // Keep the current photo in place when the phone rotates / the window resizes
  React.useEffect(() => {
    const onResize = () => {
      setZoom(null);
      const track = trackRef.current;
      if (track) track.scrollLeft = indexRef.current * track.clientWidth;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keyboard: Esc, arrows, focus trap
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") goTo(indexRef.current - 1);
      else if (e.key === "ArrowRight") goTo(indexRef.current + 1);
      else if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, goTo]);

  // Current index follows the native scroll-snap position
  const frame = React.useRef(0);
  const onTrackScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track || !track.clientWidth) return;
      const i = Math.min(Math.max(Math.round(track.scrollLeft / track.clientWidth), 0), total - 1);
      if (i === indexRef.current) return;
      setIndex(i);
      setZoom(null);
      setMounted((prev) => {
        const add = [...near(i, total)].filter((n) => !prev.has(n));
        return add.length ? new Set([...prev, ...add]) : prev;
      });
    });
  };

  // Active thumbnail stays visible
  React.useEffect(() => {
    const thumbs = thumbsRef.current;
    const active = thumbs?.children[index] as HTMLElement | undefined;
    if (!thumbs || !active) return;
    thumbs.scrollTo({
      left: active.offsetLeft - (thumbs.clientWidth - active.offsetWidth) / 2,
      behavior: scrollBehavior(),
    });
  }, [index]);

  // Zoom towards a point (slide coordinates); the zoomed box wraps the photo so panning shows no empty bars
  const toggleZoom = (x?: number, y?: number) => {
    if (zoom) return setZoom(null);
    const slide = slideRefs.current[index];
    const img = slide?.querySelector("img");
    if (!slide || !img || !img.naturalWidth) return;
    const W = slide.clientWidth;
    const H = slide.clientHeight;
    const fit = Math.min(W / img.naturalWidth, H / img.naturalHeight);
    const dw = img.naturalWidth * fit;
    const dh = img.naturalHeight * fit;
    const width = Math.max(W, dw * ZOOM);
    const height = Math.max(H, dh * ZOOM);
    const px = x ?? W / 2;
    const py = y ?? H / 2;
    const u = clamp01((px - (W - dw) / 2) / dw);
    const v = clamp01((py - (H - dh) / 2) / dh);
    setZoom({
      index,
      width,
      height,
      scrollLeft: (width - dw * ZOOM) / 2 + u * dw * ZOOM - px,
      scrollTop: (height - dh * ZOOM) / 2 + v * dh * ZOOM - py,
    });
  };

  React.useLayoutEffect(() => {
    if (!zoom) return;
    const slide = slideRefs.current[zoom.index];
    if (slide) slide.scrollTo({ left: zoom.scrollLeft, top: zoom.scrollTop, behavior: "instant" });
  }, [zoom]);

  // Double tap / double click toggles zoom (works the same for touch and mouse)
  const onSlideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const prev = lastTap.current;
    if (prev && now - prev.t < 300 && Math.abs(prev.x - e.clientX) < 30 && Math.abs(prev.y - e.clientY) < 30) {
      lastTap.current = null;
      const rect = e.currentTarget.getBoundingClientRect();
      toggleZoom(e.clientX - rect.left, e.clientY - rect.top);
    } else {
      lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    }
  };

  // Swipe down to close (horizontal swipes are left to native scroll-snap)
  const onTouchStart = (e: React.TouchEvent) => {
    if (zoom || e.touches.length !== 1) return (touch.current = null);
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, axis: null };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = touch.current;
    if (!t || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - t.x;
    const dy = e.touches[0].clientY - t.y;
    if (!t.axis && Math.hypot(dx, dy) > 8) t.axis = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
    if (t.axis === "y") setDragY(Math.max(dy, 0));
  };
  const onTouchEnd = () => {
    if (touch.current?.axis === "y" && dragY > CLOSE_DRAG_PX) close();
    else setDragY(0);
    touch.current = null;
  };

  const dragging = dragY > 0;
  const controlClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-30";

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[1000] flex h-dvh flex-col overscroll-none text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Галерия на имота"
    >
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 bg-black", !dragging && "transition-opacity")}
        style={{ opacity: 1 - Math.min(dragY / 400, 0.6) }}
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between gap-3 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
        <p className="pl-1 text-sm font-medium tabular-nums text-white/80" aria-live="polite">
          {index + 1} / {total}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={zoom ? "Намали снимката" : "Увеличи снимката"}
            aria-pressed={!!zoom}
            className={controlClass}
            onClick={() => toggleZoom()}
          >
            {zoom ? <ZoomOut className="h-5 w-5" aria-hidden="true" /> : <ZoomIn className="h-5 w-5" aria-hidden="true" />}
          </button>
          <button type="button" data-autofocus aria-label="Затвори галерията" className={controlClass} onClick={close}>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Slides: native horizontal scroll-snap = finger-following swipe with momentum */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          className={cn(
            "flex h-full snap-x snap-mandatory overscroll-contain no-scrollbar",
            zoom ? "overflow-hidden" : "overflow-x-auto",
            !dragging && "transition-transform duration-200"
          )}
          style={{ transform: dragging ? `translateY(${dragY}px)` : undefined, touchAction: zoom ? "auto" : "pan-x pinch-zoom" }}
        >
          {images.map((img, i) => {
            const zoomed = zoom?.index === i;
            return (
              <div
                key={img.url + i}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`Снимка ${i + 1} от ${total}`}
                aria-hidden={i !== index}
                onClick={onSlideClick}
                className={cn(
                  "relative w-full shrink-0 snap-center snap-always select-none",
                  zoomed ? "cursor-zoom-out overflow-auto no-scrollbar" : "cursor-zoom-in overflow-hidden"
                )}
              >
                {mounted.has(i) && (
                  <div
                    className="relative"
                    style={zoomed ? { width: zoom.width, height: zoom.height } : { width: "100%", height: "100%" }}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      draggable={false}
                      sizes={zoomed ? `${Math.round(ZOOM * 100)}vw` : "100vw"}
                      quality={85}
                      priority={i === startIndex}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Side arrows for mouse/trackpad; touch users swipe or use the thumbnails */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Предишна снимка"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
              className={cn(controlClass, "absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 pointer-fine:flex")}
            >
              <ChevronLeft className="h-7 w-7" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Следваща снимка"
              disabled={index === total - 1}
              onClick={() => goTo(index + 1)}
              className={cn(controlClass, "absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 pointer-fine:flex")}
            >
              <ChevronRight className="h-7 w-7" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 ? (
        <div
          ref={thumbsRef}
          className={cn(
            "relative flex gap-2 overflow-x-auto overscroll-x-contain px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] no-scrollbar",
            "sm:justify-center-safe",
            dragging && "opacity-0"
          )}
        >
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              aria-label={`Покажи снимка ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => goTo(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                i === index ? "opacity-100 ring-2 ring-accent" : "opacity-50 hover:opacity-80"
              )}
            >
              <Image src={img.url} alt="" fill sizes="56px" quality={70} className="object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <div className="pb-[env(safe-area-inset-bottom)]" />
      )}
    </div>
  );
}

function near(i: number, total: number): Set<number> {
  const s = new Set<number>();
  for (let n = i - PRELOAD_RANGE; n <= i + PRELOAD_RANGE; n++) if (n >= 0 && n < total) s.add(n);
  return s;
}

function clamp01(n: number): number {
  return Math.min(Math.max(n, 0), 1);
}
