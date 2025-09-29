import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

export interface LogoProps {
  /** Size variant; defaults to "lg" for headers */
  size?: LogoSize;
  /** Additional Tailwind classes for layout overrides */
  className?: string;
  /** Image priority; defaults to true for above-the-fold usage */
  priority?: boolean;
}

// Tailwind height mapping per variant. Width is auto via intrinsic ratio.
// Note: "lg" requested 50px is mapped to h-12 (48px) per Tailwind scale.
const sizeToHeightClass: Record<LogoSize, string> = {
  sm: "h-8",  // 32px – compact/footer
  md: "h-10", // 40px – mobile header
  lg: "h-12", // 48px – tablet/desktop header (default)
  xl: "h-16", // 64px – hero
};

// Responsive default sizing guidance:
// - Mobile <768px: md
// - Tablet 768-1023px: lg
// - Desktop ≥1024px: lg
// Consumers can pass `size` to override per context.

const GOLD_HEX = "#d4af37";
const NAVY_HEX = "#1a2642";

export default function Logo({
  size = "lg",
  className,
  priority = true,
}: LogoProps) {
  const [hasError, setHasError] = useState(false);

  // Defensive: if image fails, show a minimal text fallback to avoid layout shift.
  // Also log just once to aid debugging without spamming.
  const handleError = () => {
    if (!hasError) {
      // eslint-disable-next-line no-console
      console.warn("Logo image failed to load: /images/logo.png");
      setHasError(true);
    }
  };

  const heightClass = sizeToHeightClass[size] ?? sizeToHeightClass.lg;

  return (
    <Link
      href="/"
      aria-label="Nova Nest Real Estate начало"
      className={cn(
        // Interaction: subtle opacity hover, focus ring in gold with navy offset
        "inline-block no-underline transition-opacity duration-200 ease-in-out",
        "focus:outline-none focus:ring-2",
        // Using ring-[color] utilities via arbitrary values to match brand colors
        "focus:ring-[" + GOLD_HEX + "] focus:ring-offset-2 focus:ring-offset-[" + NAVY_HEX + "]",
        "hover:opacity-85", // slight dim on hover
        "rounded", // 4px radius
        className
      )}
    >
      {hasError ? (
        <span
          className={cn(
            heightClass,
            "aspect-auto select-none text-[" + GOLD_HEX + "] flex items-center",
            "font-semibold tracking-wide"
          )}
          role="img"
          aria-label="Nova Nest Real Estate – лого (fallback)"
        >
          NOVA NEST
        </span>
      ) : (
        <Image
          src="/images/logo.png"
          alt="Nova Nest Real Estate - Недвижими имоти Стара Загора"
          priority={priority}
          quality={95}
          // Maintain aspect ratio automatically using only height class
          className={cn(heightClass, "w-auto select-none")}
          sizes="(max-width: 767px) 160px, (max-width: 1023px) 200px, 240px"
          onError={handleError}
        />
      )}
    </Link>
  );
}


