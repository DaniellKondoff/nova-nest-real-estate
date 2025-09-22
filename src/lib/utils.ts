import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { componentVariants, type SectionVariant } from "./design-tokens";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function sectionVariant(
  variant: SectionVariant,
  options?: { className?: string }
): string {
  const base = componentVariants.section[variant]?.className ?? "section";
  return cn(base, options?.className);
}


