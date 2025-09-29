/**
 * Nova Nest Real Estate – Design Tokens
 * Centralized, typed tokens for consistent styling across the app.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Colors – includes brand palettes and semantic colors.
 */
export const colors = {
  primary: {
    DEFAULT: "#1a2642",
    light: "#2c3e50",
    dark: "#0f172a",
  },
  accent: {
    DEFAULT: "#d4af37",
    light: "#f0d78c",
    dark: "#b8960e",
  },
  neutral: {
    white: "#ffffff",
    charcoal: "#2d3748",
    lightGray: "#f8f9fa",
  },
  semantic: {
    success: "#16a34a", // green-600
    warning: "#d97706", // amber-600
    error: "#dc2626", // red-600
    info: "#2563eb", // blue-600
  },
} as const;

export type BrandColors = typeof colors;
export type SemanticColorName = keyof typeof colors.semantic;

/**
 * Typography – Inter family, weights, sizes, line heights and letter spacing.
 * Inter is provided by next/font and exposed via the CSS variable --font-inter.
 */
export const typography = {
  fontFamily:
    "var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontWeight: {
    300: 300,
    400: 400,
    500: 500,
    600: 600,
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },
  lineHeight: {
    tight: 1.2,
    relaxed: 1.6,
  },
  letterSpacing: {
    // Slightly increased tracking improves readability for Bulgarian Cyrillic.
    normal: "0em",
    wide: "0.01em",
    wider: "0.02em",
  },
} as const;

export type Typography = typeof typography;

/**
 * Spacing – 8px grid values.
 */
export const spacing = {
  4: "0.25rem", // 4px
  8: "0.5rem", // 8px
  12: "0.75rem", // 12px
  16: "1rem", // 16px
  24: "1.5rem", // 24px
  32: "2rem", // 32px
  48: "3rem", // 48px
  64: "4rem", // 64px
  96: "6rem", // 96px
  128: "8rem", // 128px
} as const;

export type SpacingKey = keyof typeof spacing;

/**
 * Border radius – minimalist radii.
 */
export const borderRadius = {
  sm: "4px",
  DEFAULT: "8px",
  lg: "12px",
  full: "9999px",
} as const;

export type BorderRadius = typeof borderRadius;

/**
 * Shadows – subtle elevation set for cards and UI.
 */
export const shadows = {
  sm: "0 1px 2px 0 rgba(26, 38, 66, 0.05)",
  DEFAULT: "0 4px 14px rgba(26, 38, 66, 0.08)",
  md: "0 8px 28px rgba(26, 38, 66, 0.12)",
  lg: "0 10px 30px rgba(26, 38, 66, 0.10)",
} as const;

export type Shadows = typeof shadows;

/**
 * Utility: Merge conditional class names in a Tailwind-aware manner.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Get a semantic color value by name.
 * @example getColorValue('success') -> "#16a34a"
 */
export function getColorValue(name: SemanticColorName): string {
  return colors.semantic[name];
}

/**
 * Get a spacing value from the 8px grid by numeric key.
 * @example getSpacing(24) -> "1.5rem"
 */
export function getSpacing(key: SpacingKey): string {
  return spacing[key];
}

/**
 * Aggregate tokens for convenient imports.
 */
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Tokens = typeof tokens;

