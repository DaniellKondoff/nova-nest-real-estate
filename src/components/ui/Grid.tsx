import * as React from "react";
import { cn } from "@/lib/design-tokens";

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";
type ColCount = 1 | 2 | 3 | 4 | 6 | 12;

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: Partial<Record<Breakpoint, ColCount>>;
  gap?: "sm" | "md" | "lg" | "xl";
}

const gapClass: Record<NonNullable<GridProps["gap"]>, string> = {
  sm: "gap-4", // 1rem
  md: "gap-6", // 1.5rem
  lg: "gap-8", // 2rem
  xl: "gap-12", // 3rem
};

function colsToClass(cols?: GridProps["cols"]): string {
  if (!cols) return "grid-cols-3"; // default
  const order: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];
  const parts: string[] = [];
  for (const bp of order) {
    const n = cols[bp];
    if (!n) continue;
    const prefix = bp === "xs" ? "" : `${bp}:`;
    parts.push(`${prefix}grid-cols-${n}`);
  }
  return parts.length ? parts.join(" ") : "grid-cols-3";
}

/**
 * Grid – Responsive grid layout for property listings.
 *
 * Example:
 * <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">...</Grid>
 */
export const Grid: React.FC<GridProps> = ({ cols, gap = "md", className, children, ...rest }) => {
  return (
    <div className={cn("grid", gapClass[gap], colsToClass(cols), className)} {...rest}>
      {children}
    </div>
  );
};


