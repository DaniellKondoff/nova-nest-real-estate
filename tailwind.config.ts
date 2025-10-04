/**
 * Nova Nest Real Estate – Tailwind CSS Configuration (TypeScript)
 *
 * - Extends, does not replace, Tailwind defaults
 * - Class-based dark mode strategy
 * - Typography plugin enabled
 * - Next.js-friendly content globs
 */

import type { Config } from "tailwindcss";

// Tailwind v4+ automatically picks up @tailwindcss/postcss from devDependencies.
// We still import the typography plugin here to extend prose styles.
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette
        primary: {
          DEFAULT: "#1a2642", // Primary Navy
          light: "#2c3e50",
          dark: "#0f172a",
        },
        accent: {
          DEFAULT: "#d4af37", // Accent Gold
          light: "#f0d78c",
          dark: "#b8960e",
        },
        // Neutrals
        white: "#ffffff",
        charcoal: "#2d3748",
        lightGray: "#f8f9fa",
        // Additional brand colors
        "nova-gold": "#d4af37",
      },

      fontFamily: {
        // Use CSS variable from next/font to ensure Inter loads correctly
        sans: [
          "var(--font-inter)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },

      // Inter weights we rely on from next/font config
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
      },

      // 8px grid system
      spacing: {
        0: "0rem",
        1: "0.25rem", // 4px
        2: "0.5rem", // 8px
        3: "0.75rem", // 12px
        4: "1rem", // 16px
        5: "1.25rem", // 20px
        6: "1.5rem", // 24px
        7: "1.75rem", // 28px
        8: "2rem", // 32px
        10: "2.5rem", // 40px
        12: "3rem", // 48px
        14: "3.5rem", // 56px
        16: "4rem", // 64px
        20: "5rem", // 80px
        24: "6rem", // 96px
        28: "7rem", // 112px
        32: "8rem", // 128px
        40: "10rem", // 160px
        48: "12rem", // 192px
        56: "14rem", // 224px
        64: "16rem", // 256px
      },

      // 8px radius for cards as default
      borderRadius: {
        DEFAULT: "0.5rem", // 8px
        sm: "0.375rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },

      // Subtle, minimalist shadows
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(26, 38, 66, 0.05)",
        soft: "0 4px 14px rgba(26, 38, 66, 0.08)",
        lift: "0 8px 28px rgba(26, 38, 66, 0.12)",
        card: "0 10px 30px rgba(26, 38, 66, 0.10)",
        gold: "0 4px 16px rgba(212, 175, 55, 0.25)",
      },

      // Minimalist type scale
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.2" }],
        sm: ["0.875rem", { lineHeight: "1.35" }],
        base: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.125rem", { lineHeight: "1.55" }],
        xl: ["1.25rem", { lineHeight: "1.4" }],
        "2xl": ["1.5rem", { lineHeight: "1.35" }],
        "3xl": ["1.875rem", { lineHeight: "1.25" }],
        "4xl": ["2.25rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
      },

      // Gradient backgrounds
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #1a2642 0%, #2c3e50 100%)",
        "gradient-accent": "linear-gradient(135deg, #d4af37 0%, #f0d78c 100%)",
      },
    },
  },
  plugins: [typography],
};

export default config;


