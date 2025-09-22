// Nova Nest Real Estate – Design Tokens

export const colors = {
  navy: "#1a2642",
  gold: "#d4af37",
  white: "#ffffff",
  charcoal: "#2d3748",
  grayLight: "#f8f9fa",
} as const;

export const typography = {
  fontFamily: "var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  weights: {
    300: 300,
    400: 400,
    500: 500,
    600: 600,
  } as const,
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    x2: "1.5rem",
    x3: "1.875rem",
    x4: "2.25rem",
    x5: "3rem",
  } as const,
} as const;

export const spacing = {
  0: "0rem",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
} as const;

export const radii = {
  default: "0.5rem",
  sm: "0.375rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  x2: "1.5rem",
} as const;

export const shadows = {
  subtle: "0 1px 2px 0 rgba(26, 38, 66, 0.05)",
  soft: "0 4px 14px rgba(26, 38, 66, 0.08)",
  lift: "0 8px 28px rgba(26, 38, 66, 0.12)",
  card: "0 10px 30px rgba(26, 38, 66, 0.10)",
  gold: "0 4px 16px rgba(212, 175, 55, 0.25)",
} as const;

export const animations = {
  fadeIn: "fade-in 300ms ease-out",
  slideUpFade: "slide-up-fade 400ms cubic-bezier(0.22, 1, 0.36, 1)",
  scaleIn: "scale-in 250ms ease-out",
} as const;

export type SectionVariant = "navy" | "white";

export const componentVariants = {
  section: {
    navy: {
      background: colors.navy,
      foreground: colors.white,
      link: colors.gold,
      className: "section section--navy",
    },
    white: {
      background: colors.white,
      foreground: colors.charcoal,
      link: colors.navy,
      className: "section section--white",
    },
  },
} as const;

export const tokens = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  animations,
  componentVariants,
} as const;

export type Tokens = typeof tokens;


