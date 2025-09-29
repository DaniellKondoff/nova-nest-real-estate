import * as React from "react";
import { cn } from "@/lib/design-tokens";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Testimonial {
  id: string;
  testimonial: string;
  clientName: string;
  rating: number;
  role?: string;
}

export interface TestimonialCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  testimonials: Testimonial[];
  variant?: "navy" | "white";
  autoPlay?: boolean; // not implemented yet
  autoPlayInterval?: number; // not implemented yet
  showNavigation?: boolean;
  showIndicators?: boolean;
}

export function TestimonialCarousel({
  testimonials,
  variant = "white",
  autoPlay = true, // placeholder for future enhancement
  autoPlayInterval = 5000, // placeholder for future enhancement
  showNavigation = true,
  showIndicators = true,
  className,
  ...rest
}: TestimonialCarouselProps) {
  const [itemsPerView, setItemsPerView] = React.useState(1);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [isFocused, setIsFocused] = React.useState(false);

  const totalPages = Math.max(1, Math.ceil((testimonials?.length || 0) / itemsPerView));

  React.useEffect(() => {
    const compute = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      if (w < 640) setItemsPerView(1);
      else if (w < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  React.useEffect(() => {
    // Clamp page index if pages shrink
    setPageIndex((idx) => Math.min(idx, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const goTo = (idx: number) => {
    const next = Math.max(0, Math.min(totalPages - 1, idx));
    setPageIndex(next);
  };
  const goPrev = () => goTo(pageIndex - 1);
  const goNext = () => goTo(pageIndex + 1);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  const pages: Testimonial[][] = React.useMemo(() => {
    const arr = testimonials || [];
    const groups: Testimonial[][] = [];
    for (let i = 0; i < arr.length; i += itemsPerView) {
      groups.push(arr.slice(i, i + itemsPerView));
    }
    return groups.length ? groups : [[]];
  }, [testimonials, itemsPerView]);

  const isNavy = variant === "navy";
  const btnBase = "inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 transition-colors duration-200 ease-out";
  const btnSize = "h-12 w-12 min-h-[44px] min-w-[44px]"; // 48px
  const btnTone = isNavy
    ? "bg-white text-accent hover:bg-accent hover:text-white"
    : "bg-primary text-accent hover:bg-accent hover:text-white";

  return (
    <div
      className={cn("relative mx-auto w-full max-w-7xl py-16", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Клиентски отзиви"
      onKeyDown={onKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...rest}
    >
      {/* Track viewport */}
      <div className="relative overflow-hidden">
        {/* Slides track */}
        <div
          className="flex w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${pageIndex * 100}%)` }}
          aria-live="polite"
        >
          {pages.map((page, idx) => (
            <div
              key={idx}
              className="w-full shrink-0 px-1"
              role="group"
              aria-roledescription="slide"
              aria-label={`Слайд ${idx + 1} от ${totalPages}`}
            >
              <div
                className={cn(
                  "grid grid-cols-1 gap-4 md:gap-6",
                  itemsPerView === 1 ? "" : itemsPerView === 2 ? "sm:grid-cols-2" : "lg:grid-cols-3"
                )}
              >
                {page.length === 0 ? (
                  <div
                    className={cn(
                      "rounded-md border p-6 text-center",
                      isNavy ? "border-white/15 text-white/80" : "border-black/10 text-charcoal/70"
                    )}
                    role="status"
                    aria-live="polite"
                  >
                    Няма налични отзиви в момента.
                  </div>
                ) : (
                  page.map((t) => (
                    <TestimonialCard
                      key={t.id}
                      testimonial={t.testimonial}
                      clientName={t.clientName}
                      rating={t.rating}
                      role={t.role}
                      variant={variant}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {showNavigation && totalPages > 1 && (
          <>
            <button
              type="button"
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 shadow-soft",
                btnBase,
                btnSize,
                btnTone,
                "hidden sm:flex",
                pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={goPrev}
              aria-label="Предишни отзиви"
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 shadow-soft",
                btnBase,
                btnSize,
                btnTone,
                "hidden sm:flex",
                pageIndex >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={goNext}
              aria-label="Следващи отзиви"
              disabled={pageIndex >= totalPages - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {showIndicators && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Индикатори на слайдове">
          {Array.from({ length: totalPages }).map((_, i) => {
            const active = i === pageIndex;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Към слайд ${i + 1} от ${totalPages}`}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all duration-200",
                  active ? "bg-accent scale-110" : "bg-[#cbd5e1] hover:bg-accent/60"
                )}
                onClick={() => goTo(i)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TestimonialCarousel;


