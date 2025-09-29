import * as React from "react";
import { cn } from "@/lib/design-tokens";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import TestimonialSkeleton from "@/components/testimonials/TestimonialSkeleton";
import { getApprovedTestimonials, type Testimonial as QueryTestimonial, DatabaseError } from "@/lib/queries/testimonials";
import { AlertCircle, MessageSquare } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

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
  autoPlay = true,
  autoPlayInterval = 5000,
  showNavigation = true,
  showIndicators = true,
  className,
  ...rest
}: TestimonialCarouselProps) {
  const [data, setData] = React.useState<Testimonial[]>(testimonials ?? []);
  const [loading, setLoading] = React.useState<boolean>(!testimonials || testimonials.length === 0);
  const [error, setError] = React.useState<string | null>(null);
  const [itemsPerView, setItemsPerView] = React.useState(1);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [manualPaused, setManualPaused] = React.useState(false);
  const pauseCounterRef = React.useRef(0);
  const intervalRef = React.useRef<number | null>(null);
  const lastNavTimeRef = React.useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  const totalPages = Math.max(1, Math.ceil((data?.length || 0) / itemsPerView));

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

  const goTo = React.useCallback((idx: number) => {
    const next = Math.max(0, Math.min(totalPages - 1, idx));
    setPageIndex(next);
  }, [totalPages]);
  const goPrev = React.useCallback(() => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 250) return; // debounce rapid clicks
    lastNavTimeRef.current = now;
    goTo(pageIndex - 1);
  }, [goTo, pageIndex]);
  const goNext = React.useCallback(() => {
    const now = Date.now();
    if (now - lastNavTimeRef.current < 250) return; // debounce rapid clicks
    lastNavTimeRef.current = now;
    goTo(pageIndex + 1);
  }, [goTo, pageIndex]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === " ") {
      e.preventDefault();
      setManualPaused((p) => !p);
    }
  };

  const pages: Testimonial[][] = React.useMemo(() => {
    const arr = data || [];
    const groups: Testimonial[][] = [];
    for (let i = 0; i < arr.length; i += itemsPerView) {
      groups.push(arr.slice(i, i + itemsPerView));
    }
    return groups.length ? groups : [[]];
  }, [data, itemsPerView]);

  const isNavy = variant === "navy";
  const btnBase = "inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 transition-colors duration-200 ease-out";
  const btnSize = "h-12 w-12 min-h-[44px] min-w-[44px]"; // 48px
  const btnTone = isNavy
    ? "bg-white text-accent hover:bg-accent hover:text-white"
    : "bg-primary text-accent hover:bg-accent hover:text-white";

  // Auto-play management
  const isActuallyPaused = (pauseCounterRef.current > 0) || manualPaused;
  const stopAutoPlay = React.useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  const startAutoPlay = React.useCallback(() => {
    stopAutoPlay();
    if (!autoPlay || isActuallyPaused || totalPages <= 1 || prefersReducedMotion) return;
    intervalRef.current = window.setInterval(() => {
      setPageIndex((idx) => Math.min(totalPages - 1, idx + 1));
    }, Math.max(2000, autoPlayInterval));
  }, [autoPlay, autoPlayInterval, isActuallyPaused, stopAutoPlay, totalPages, prefersReducedMotion]);

  React.useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay, pageIndex, itemsPerView]);

  const incrementPause = () => {
    pauseCounterRef.current = Math.max(0, pauseCounterRef.current + 1);
    stopAutoPlay();
  };
  const decrementPause = () => {
    pauseCounterRef.current = Math.max(0, pauseCounterRef.current - 1);
    startAutoPlay();
  };

  // Fetch data on mount if not provided
  React.useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (testimonials && testimonials.length > 0) {
        setLoading(false);
        setData(testimonials);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res: QueryTestimonial[] = await getApprovedTestimonials(10);
        if (!cancelled) {
          setData(res as unknown as Testimonial[]);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          if (e instanceof DatabaseError) {
            setError("Не успяхме да заредим отзивите. Моля, опитайте отново.");
          } else {
            setError("Възникна грешка при зареждане на отзивите.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [testimonials]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setData([]);
    // Re-run the effect by toggling dependency via a micro-state update
    void (async () => {
      try {
        const res: QueryTestimonial[] = await getApprovedTestimonials(10);
        setData(res as unknown as Testimonial[]);
      } catch (e: unknown) {
        if (e instanceof DatabaseError) {
          setError("Проблем с връзката. Проверете интернет свързването си");
        } else {
          setError("Възникна грешка при зареждане на отзивите.");
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div
      className={cn("relative mx-auto w-full max-w-7xl py-16", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Клиентски отзиви"
      onKeyDown={onKeyDown}
      onMouseEnter={incrementPause}
      onMouseLeave={decrementPause}
      onFocusCapture={incrementPause}
      onBlurCapture={decrementPause}
      {...rest}
    >
      <span className="sr-only" role="status" aria-live="polite">
        Слайд {pageIndex + 1} от {totalPages}
      </span>
      {/* Loading State */}
      {loading ? (
        <TestimonialSkeleton variant={variant} />
      ) : error ? (
        <div className={cn("mt-4 rounded-md border p-6 text-center", isNavy ? "border-white/15 text-white/90" : "border-black/10 text-charcoal/80")}> 
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <AlertCircle className="h-5 w-5 text-accent" />
          </div>
          <p>Не успяхме да заредим отзивите. Моля, опитайте отново.</p>
          <button
            type="button"
            onClick={retry}
            className={cn("mt-4 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm", isNavy ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-white hover:bg-primary/90")}
          >
            Опитайте отново
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className={cn("mt-4 rounded-md border p-6 text-center", isNavy ? "border-white/15 text-white/80" : "border-black/10 text-charcoal/70")}>
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <MessageSquare className="h-5 w-5 text-accent" />
          </div>
          <p>Все още няма добавени отзиви.</p>
        </div>
      ) : null}

      {/* Track viewport */}
      <div className="relative overflow-hidden">
        {/* Slides track with Framer Motion */}
        <div className="relative w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pageIndex}
              role="group"
              aria-roledescription="slide"
              aria-label={`Слайд ${pageIndex + 1} от ${totalPages}`}
              className="w-full px-1"
              initial={prefersReducedMotion ? false : { opacity: 0, x: 100 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                const dx = info.offset.x;
                const threshold = 50;
                if (dx < -threshold) {
                  goNext();
                } else if (dx > threshold) {
                  goPrev();
                }
              }}
            >
              <div
                className={cn(
                  "grid grid-cols-1 gap-4 md:gap-6",
                  itemsPerView === 1 ? "" : itemsPerView === 2 ? "sm:grid-cols-2" : "lg:grid-cols-3"
                )}
              >
                {(pages[pageIndex] || []).length === 0 ? (
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
                  (pages[pageIndex] || []).map((t) => (
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {showNavigation && totalPages > 1 && !loading && !error && data.length > 0 && (
          <>
            <motion.button
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.button
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </>
        )}
      </div>

      {/* Indicators */}
      {showIndicators && totalPages > 1 && !loading && !error && data.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Индикатори на слайдове">
          {Array.from({ length: totalPages }).map((_, i) => {
            const active = i === pageIndex;
            return (
              <motion.button
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
                whileHover={{ scale: 1.1 }}
                animate={active ? { scale: 1.2 } : { scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TestimonialCarousel;


