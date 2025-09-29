import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/design-tokens";
import { Text } from "@/components/ui/Typography";
import { Star, Quote } from "lucide-react";

const cardVariants = cva(
  "relative rounded-md transition-transform duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
  {
    variants: {
      variant: {
        navy: "bg-[#2a3654] text-white",
        white: "bg-white text-primary border border-[#e5e7eb] shadow-subtle",
      },
      padding: {
        md: "p-6",
        lg: "p-8",
      },
      hoverScale: {
        true: "hover:scale-[1.02]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "white",
      padding: "lg",
      hoverScale: true,
    },
  }
);

export interface TestimonialCardProps extends VariantProps<typeof cardVariants> {
  testimonial: string; // Bulgarian testimonial text
  clientName: string; // Client initials (e.g., "М.И.")
  rating: number; // 1-5 star rating
  role?: string; // Optional client role
  className?: string;
}

export function TestimonialCard({
  testimonial,
  clientName,
  rating,
  role,
  variant = "white",
  padding,
  hoverScale,
  className,
  ...rest
}: TestimonialCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  const isNavy = variant === "navy";

  return (
    <div
      className={cn(cardVariants({ variant, padding, hoverScale }), className)}
      role="article"
      aria-label="Клиентски отзив"
      tabIndex={0}
      {...rest}
    >
      {/* Decorative quote icon */}
      <Quote
        aria-hidden
        className={cn(
          "absolute -top-3 left-4 h-6 w-6",
          isNavy ? "text-accent" : "text-accent"
        )}
      />

      {/* Testimonial text */}
      <blockquote className="mt-2">
        <Text as="p" size="lg" color={isNavy ? "white" : "charcoal"} className="leading-relaxed">
          {testimonial}
        </Text>
      </blockquote>

      {/* Stars */}
      <div className="mt-4 inline-flex items-center gap-1" aria-label={`Оценка: ${safeRating} от 5`}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const filled = idx < safeRating;
          return (
            <Star
              key={idx}
              aria-hidden
              className={cn("h-5 w-5", filled ? "text-accent fill-accent" : isNavy ? "text-white/40" : "text-charcoal/30")}
            />
          );
        })}
      </div>

      {/* Divider */}
      <div className={cn("my-5 h-px w-full", isNavy ? "bg-white/15" : "bg-black/5")} />

      {/* Client info */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className={cn("font-medium", isNavy ? "text-white" : "text-primary")}>
            {clientName}
          </p>
          {role ? (
            <p className={cn("mt-0.5 text-sm", isNavy ? "text-white/80" : "text-charcoal/70")}>{role}</p>
          ) : null}
        </div>
        <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-gold" aria-hidden />
      </div>
    </div>
  );
}

export default TestimonialCard;


