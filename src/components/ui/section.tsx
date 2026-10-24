import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Site-wide content container – the single source of page width and gutters. */
export const containerClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

const sectionVariants = cva("w-full", {
  variants: {
    tone: {
      navy: "bg-primary text-white",
      white: "bg-white text-charcoal",
      muted: "bg-gray-light text-charcoal",
    },
    spacing: {
      none: "",
      tight: "py-10 md:py-16",
      normal: "py-12 md:py-20 lg:py-24",
      loose: "py-16 md:py-24 lg:py-32",
    },
  },
  defaultVariants: {
    tone: "white",
    spacing: "normal",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  /** Extra classes for the inner container */
  containerClassName?: string;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, containerClassName, tone, spacing, children, ...props }, ref) => {
    return (
      <section ref={ref} className={cn(sectionVariants({ tone, spacing }), className)} {...props}>
        <div className={cn(containerClass, containerClassName)}>{children}</div>
      </section>
    );
  }
);
Section.displayName = "Section";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** Use light text for dark (navy) sections */
  inverted?: boolean;
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}

/** Consistent section header: gold eyebrow, fluid heading, muted lead. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  inverted = false,
  as: Heading = "h2",
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 md:mb-12",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm",
            inverted ? "text-accent" : "text-accent-dark"
          )}
        >
          <span aria-hidden="true" className="h-px w-6 bg-current" />
          {eyebrow}
        </p>
      )}
      <Heading
        id={id}
        className={cn(
          Heading === "h1" ? "text-display" : "text-h2",
          "font-bold tracking-tight text-balance",
          inverted ? "text-white" : "text-primary"
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg text-pretty",
            inverted ? "text-white/80" : "text-charcoal/75"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
