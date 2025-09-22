/**
 * Nova Nest Real Estate – Tailwind Theme Configuration
 * Tailwind CSS v4 compatible config extending utilities.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: "#1a2642",
        gold: "#d4af37",
        white: "#ffffff",
        charcoal: "#2d3748",
        "gray-light": "#f8f9fa",
      },
      fontFamily: {
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
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
      },
      spacing: {
        // Generous white space scale (in rem)
        0: "0rem",
        1: "0.25rem", // 4px
        2: "0.5rem", // 8px
        3: "0.75rem", // 12px
        4: "1rem", // 16px
        6: "1.5rem", // 24px
        8: "2rem", // 32px
        10: "2.5rem", // 40px
        12: "3rem", // 48px
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
      borderRadius: {
        DEFAULT: "0.5rem", // 8px standard
        sm: "0.375rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(26, 38, 66, 0.05)",
        soft: "0 4px 14px rgba(26, 38, 66, 0.08)",
        lift: "0 8px 28px rgba(26, 38, 66, 0.12)",
        card: "0 10px 30px rgba(26, 38, 66, 0.10)",
        gold: "0 4px 16px rgba(212, 175, 55, 0.25)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up-fade": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
        "slide-up-fade": "slide-up-fade 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scale-in 250ms ease-out",
      },
      fontSize: {
        // Minimalist typography scale
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
    },
  },
};


