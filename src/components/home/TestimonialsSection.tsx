import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/design-tokens";
import { Section } from "@/components/ui/section";
import { Heading, Text } from "@/components/ui/Typography";
import { Card } from "@/components/ui/card";

const wrapperVariants = cva("w-full", {
  variants: {
    variant: {
      navy: "bg-primary text-white",
      white: "bg-white text-charcoal",
    },
  },
  defaultVariants: {
    variant: "white",
  },
});

export type TestimonialsVariant = "navy" | "white";

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

export interface TestimonialsSectionProps
  extends Omit<React.ComponentPropsWithoutRef<"section">, "children">,
    VariantProps<typeof wrapperVariants> {
  heading?: string;
  subheading?: string;
  items?: TestimonialItem[];
  /**
   * If true, shows carousel controls and enables horizontal navigation.
   * If false, renders a responsive grid.
   */
  carousel?: boolean;
}

export function TestimonialsSection({
  className,
  variant = "white",
  heading = "Какво казват нашите клиенти",
  subheading,
  items = [],
  carousel = false,
  ...rest
}: TestimonialsSectionProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const isNavy = variant === "navy";

  const handlePrev = () => {
    const next = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(next);
    focusSlide(next);
  };

  const handleNext = () => {
    const next = items.length === 0 ? 0 : (activeIndex + 1) % items.length;
    setActiveIndex(next);
    focusSlide(next);
  };

  const focusSlide = (index: number) => {
    if (!containerRef.current) return;
    const slide = containerRef.current.querySelector<HTMLElement>(`[data-index="${index}"]`);
    slide?.focus();
  };

  const onKeyDownControls = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Color accents per design philosophy (40% navy / 35% white / 15% gold)
  // We use subtle gold accent underline and bullet to keep balance.
  return (
    <Section
      tone={isNavy ? "navy" : "white"}
      className={cn(wrapperVariants({ variant }),
        isNavy ? "bg-gradient-to-b from-primary to-primary/95" : "",
        className
      )}
      aria-label="Testimonials section"
      {...rest}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className={cn(
          "mb-8 md:mb-12",
          isNavy ? "text-white" : "text-charcoal"
        )}>
          <Heading as="h2" size="h2" weight="semibold" color={isNavy ? "white" : "primary"} className="tracking-wide">
            {heading}
          </Heading>
          {subheading ? (
            <Text as="p" size="lg" color={isNavy ? "white" : "gray"} className={cn("mt-3", isNavy ? "text-white/80" : "text-gray-600")}> 
              {subheading}
            </Text>
          ) : null}
          <div className={cn("mt-4 h-1 w-16 rounded-full", isNavy ? "bg-accent" : "bg-accent")} />
        </div>

        {carousel ? (
          <div
            className="relative"
            role="region"
            aria-roledescription="carousel"
            aria-label="Клиентски отзиви"
            onKeyDown={onKeyDownControls}
          >
            <div className="flex items-center justify-between mb-4" aria-hidden={items.length <= 1}>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm",
                  isNavy ? "border-white/20 text-white hover:bg-white/10" : "border-black/10 text-primary hover:bg-black/5"
                )}
                aria-label="Предишен отзив"
                onClick={handlePrev}
              >
                ←
              </button>
              <div className={cn("text-sm", isNavy ? "text-white/80" : "text-charcoal/70")}>
                {items.length > 0 ? activeIndex + 1 : 0} / {items.length}
              </div>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm",
                  isNavy ? "border-white/20 text-white hover:bg-white/10" : "border-black/10 text-primary hover:bg-black/5"
                )}
                aria-label="Следващ отзив"
                onClick={handleNext}
              >
                →
              </button>
            </div>

            <div
              ref={containerRef}
              className="grid grid-cols-1 gap-4 md:gap-6"
              aria-live="polite"
            >
              {items.length === 0 ? (
                <EmptyState isNavy={isNavy} />
              ) : (
                <TestimonialCard
                  key={items[activeIndex].id}
                  data-index={activeIndex}
                  tabIndex={0}
                  quote={items[activeIndex].quote}
                  author={items[activeIndex].author}
                  role={items[activeIndex].role}
                  isNavy={isNavy}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {items.length === 0 ? (
              <EmptyState isNavy={isNavy} />
            ) : (
              items.map((it, idx) => (
                <TestimonialCard
                  key={it.id}
                  data-index={idx}
                  tabIndex={0}
                  quote={it.quote}
                  author={it.author}
                  role={it.role}
                  isNavy={isNavy}
                />
              ))
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string;
  author: string;
  role?: string;
  isNavy: boolean;
}

function TestimonialCard({ quote, author, role, isNavy, className, ...rest }: TestimonialCardProps) {
  return (
    <Card
      variant="elevated"
      padding="lg"
      className={cn(
        "h-full",
        // White cards on white background: subtle border; on navy: maintain white card for contrast
        isNavy ? "bg-white text-charcoal shadow-soft" : "bg-white text-charcoal"
      )}
      {...rest}
    >
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-start gap-3">
          <span className="text-accent text-2xl" aria-hidden>“</span>
          <Text as="p" size="lg" color="charcoal" className="leading-relaxed">
            {quote}
          </Text>
        </div>
        <div className="h-px w-full bg-black/5" />
        <div className="flex items-baseline justify-between">
          <div>
            <Text as="p" size="base" weight="semibold" color="charcoal">
              {author}
            </Text>
            {role ? (
              <Text as="p" size="sm" color="gray" className="mt-0.5">
                {role}
              </Text>
            ) : null}
          </div>
          <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-gold" aria-hidden />
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ isNavy }: { isNavy: boolean }) {
  return (
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
  );
}

export default TestimonialsSection;


