"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/design-tokens";
import { Section } from "@/components/ui/section";
import { Heading, Text } from "@/components/ui/Typography";
import TestimonialCarousel, { type Testimonial as CarouselTestimonial } from "@/components/testimonials/TestimonialCarousel";
import TestimonialSkeleton from "@/components/testimonials/TestimonialSkeleton";
import { getApprovedTestimonials } from "@/lib/queries/testimonials";
import { AlertCircle, MessageSquare } from "lucide-react";

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
}

export function TestimonialsSection({
  className,
  variant = "navy",
  heading = "Какво казват нашите клиенти",
  subheading = "Реални отзиви от доволни клиенти",
  ...rest
}: TestimonialsSectionProps) {
  const [data, setData] = React.useState<CarouselTestimonial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const isNavy = variant === "navy";

  React.useEffect(() => {
    let cancelled = false;
    async function fetchTestimonials() {
      setLoading(true);
      setError(null);
      try {
        const res = await getApprovedTestimonials(12);
        if (!cancelled) setData(res as unknown as CarouselTestimonial[]);
      } catch (e: unknown) {
        if (!cancelled) setError("Не успяхме да заредим отзивите. Моля, опитайте отново.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTestimonials();
    return () => { cancelled = true; };
  }, []);

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

        {loading ? (
          <TestimonialSkeleton variant={(variant ?? "navy") as "navy" | "white"} />
        ) : error ? (
          <div className={cn("mt-4 rounded-md border p-6 text-center", isNavy ? "border-white/15 text-white/90" : "border-black/10 text-charcoal/80")}>
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <AlertCircle className="h-5 w-5 text-accent" />
            </div>
            <p>Не успяхме да заредим отзивите. Моля, опитайте отново.</p>
          </div>
        ) : data.length === 0 ? (
          <div className={cn("mt-4 rounded-md border p-6 text-center", isNavy ? "border-white/15 text-white/80" : "border-black/10 text-charcoal/70")}>
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <p>Все още няма добавени отзиви.</p>
          </div>
        ) : (
          <TestimonialCarousel variant={(variant ?? "navy") as "navy" | "white"} testimonials={data} />
        )}
      </div>
    </Section>
  );
}

export default TestimonialsSection;


