import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logoLight from "../../../public/images/logo.png";
// Designer TODO: Replace the alias below when `public/images/logo-dark.png` is provided
// with the actual dark asset import to ensure better contrast on white backgrounds.
// import logoDark from "../../../public/images/logo-dark.png";
import logoDark from "../../../public/images/logo.png";

type LogoSize = "sm" | "md" | "lg" | "xl";
type LogoVariant = "light" | "dark";

export interface LogoProps {
  /** Size variant; defaults to "lg" for headers */
  size?: LogoSize;
  /** Additional Tailwind classes for layout overrides */
  className?: string;
  /** Image priority; defaults to true for above-the-fold usage */
  priority?: boolean;
  /** Visual variant for different backgrounds; defaults to "light" */
  variant?: LogoVariant;
}

// Height per size; width is auto via the intrinsic ratio of the static import.
const sizeToHeightClass: Record<LogoSize, string> = {
  sm: "h-8",  // 32px – compact/footer
  md: "h-10", // 40px – mobile header
  lg: "h-12", // 48px – desktop header
  xl: "h-16", // 64px – hero
};

/** Server component – the asset is a static import, so no runtime error fallback is needed. */
export default function Logo({
  size = "lg",
  className,
  priority = true,
  variant = "light",
}: LogoProps) {
  const heightClass = sizeToHeightClass[size] ?? sizeToHeightClass.lg;
  const imageByVariant = variant === "dark" ? logoDark : logoLight;

  return (
    <Link
      href="/"
      aria-label="Nova Nest Real Estate – начало"
      className={cn(
        "inline-flex items-center rounded no-underline transition-opacity duration-200 hover:opacity-85",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
        className
      )}
    >
      <Image
        src={imageByVariant}
        alt="Nova Nest Real Estate - Недвижими имоти Стара Загора"
        priority={priority}
        unoptimized // Small logo doesn't benefit from optimization
        className={cn(heightClass, "w-auto select-none")}
      />
    </Link>
  );
}
