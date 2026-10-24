import * as React from "react";
import { MessageSquare, Quote, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import ScrollRowControls from "@/components/ui/ScrollRowControls";
import { getCachedApprovedTestimonials } from "@/lib/queries/testimonials";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  heading?: string;
  subheading?: string;
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`Оценка ${rating} от 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn("h-4 w-4", i < Math.round(rating) ? "fill-accent text-accent" : "fill-gray-200 text-gray-200")}
        />
      ))}
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

/**
 * Testimonials – every card is server-rendered (indexable) in a CSS scroll-snap row.
 * Mobile: swipe, with the next card peeking in. md+: optional arrow controls (tiny client island).
 */
export async function TestimonialsSection({
  heading = "Какво казват нашите клиенти",
  subheading = "Доверени от собственици, купувачи и инвеститори в Стара Загора.",
}: TestimonialsSectionProps) {
  const raw = await getCachedApprovedTestimonials().catch(() => []);
  const testimonials = raw.slice(0, 12);
  const avg = testimonials.length
    ? testimonials.reduce((sum, t) => sum + (t.rating ?? 0), 0) / testimonials.length
    : 0;

  return (
    <Section tone="muted" aria-labelledby="testimonials-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Клиентски отзиви"
          title={heading}
          description={subheading}
          align="left"
          className="reveal mb-0 md:mb-0"
        />
        {testimonials.length > 0 && (
          <div className="flex items-center justify-between gap-6 md:flex-col md:items-end">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{avg.toFixed(1)}</span>
              <div>
                <Stars rating={avg} />
                <p className="mt-0.5 text-sm text-charcoal/70">{testimonials.length} отзива</p>
              </div>
            </div>
            <ScrollRowControls targetId="testimonials-row" className="hidden md:flex" />
          </div>
        )}
      </div>

      {testimonials.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-gray-300 bg-white p-8 text-center text-charcoal/70">
          <MessageSquare className="mx-auto mb-3 h-6 w-6 text-accent-dark" aria-hidden="true" />
          <p>Все още няма добавени отзиви.</p>
        </div>
      ) : (
        <ul
          id="testimonials-row"
          className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 no-scrollbar sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0 md:mt-10 lg:gap-6"
        >
          {testimonials.map((t) => (
            <li
              key={t.id}
              className="flex w-[85%] shrink-0 snap-start flex-col rounded-card border border-border bg-white p-6 shadow-card sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-3rem)/3)]"
            >
              <Quote className="h-8 w-8 text-accent/40" aria-hidden="true" />
              <blockquote className="mt-3 flex-1 leading-relaxed text-charcoal">
                <p className="line-clamp-[8]">{t.comment_text}</p>
              </blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent"
                >
                  {initials(t.client_name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">{t.client_name}</p>
                  <Stars rating={t.rating} className="mt-0.5" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export default TestimonialsSection;
