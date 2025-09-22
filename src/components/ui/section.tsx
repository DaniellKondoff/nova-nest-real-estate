import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const container = "mx-auto w-full max-w-6xl px-4 md:px-6";

const sectionVariants = cva("w-full", {
  variants: {
    tone: {
      navy: "bg-navy text-white",
      white: "bg-white text-charcoal",
    },
    spacing: {
      normal: "py-12 md:py-16",
      tight: "py-8 md:py-12",
      loose: "py-16 md:py-24",
    },
  },
  defaultVariants: {
    tone: "white",
    spacing: "normal",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, tone, spacing, children, ...props }, ref) => {
    return (
      <section ref={ref} className={cn(sectionVariants({ tone, spacing }), className)} {...props}>
        <div className={container}>{children}</div>
      </section>
    );
  }
);
Section.displayName = "Section";


