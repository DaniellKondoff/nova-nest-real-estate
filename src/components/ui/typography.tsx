import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, typography as typeTokens } from "@/lib/design-tokens";

type AsProp<T extends React.ElementType> = { as?: T };
type PropsToOmit<T extends React.ElementType, P> = keyof (AsProp<T> & P);
type PolymorphicComponentProps<T extends React.ElementType, Props = {}> =
  React.PropsWithChildren<Props & AsProp<T>> &
    Omit<React.ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>;

/**
 * Heading – Polymorphic heading component h1–h6 using Nova Nest tokens.
 *
 * Example:
 * <Heading as="h1" size="h1" color="white">Открийте своето ново гнездо</Heading>
 */
const headingVariants = cva(
  "font-sans tracking-wide",
  {
    variants: {
      size: {
        h1: "text-5xl md:text-6xl", // 48–64px
        h2: "text-4xl md:text-5xl", // 36–48px
        h3: "text-3xl md:text-4xl", // 30–36px
        h4: "text-2xl md:text-3xl", // 24–30px
        h5: "text-xl md:text-2xl", // 20–24px
        h6: "text-lg md:text-xl", // 18–20px
      },
      weight: {
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
      },
      color: {
        primary: "text-primary",
        accent: "text-accent",
        white: "text-white",
        charcoal: "text-charcoal",
      },
    },
    defaultVariants: {
      size: "h2",
      weight: "semibold",
      color: "primary",
    },
  }
);

export type HeadingOwnProps = VariantProps<typeof headingVariants> & {
  /** Force line height to 1.2 for better headline rhythm */
  tight?: boolean;
};

export type HeadingProps<T extends React.ElementType> = PolymorphicComponentProps<
  T,
  HeadingOwnProps
>;

export const Heading = React.forwardRef(
  <T extends React.ElementType = "h2">(
    { as, size, weight, color, tight = true, className, children, ...rest }: HeadingProps<T>,
    ref: React.Ref<Element>
  ) => {
    const Component = (as ?? (size as string)) as React.ElementType;
    const lh = tight ? "leading-tight" : ""; // 1.2
    return (
      <Component
        ref={ref as any}
        className={cn("antialiased", headingVariants({ size, weight, color }), lh, className)}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = "Heading";

/**
 * Text – Polymorphic text component for paragraphs/spans with variants.
 *
 * Example:
 * <Text size="lg" color="charcoal">Професионални услуги за недвижими имоти</Text>
 */
const textVariants = cva(
  "font-sans",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
      weight: {
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
      },
      color: {
        primary: "text-primary",
        accent: "text-accent",
        charcoal: "text-charcoal",
        white: "text-white",
        gray: "text-gray-600",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      size: "base",
      weight: "normal",
      color: "charcoal",
      align: "left",
    },
  }
);

export type TextOwnProps = VariantProps<typeof textVariants> & {
  /** Force line height to 1.6 for comfortable reading */
  relaxed?: boolean;
};

export type TextProps<T extends React.ElementType> = PolymorphicComponentProps<
  T,
  TextOwnProps
>;

export const Text = React.forwardRef(
  <T extends React.ElementType = "p">(
    { as, size, weight, color, align, relaxed = true, className, children, ...rest }: TextProps<T>,
    ref: React.Ref<Element>
  ) => {
    const Component = (as ?? "p") as React.ElementType;
    const lh = relaxed ? "leading-relaxed" : ""; // ~1.6
    return (
      <Component
        ref={ref as any}
        className={cn("antialiased", textVariants({ size, weight, color, align }), lh, className)}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);
Text.displayName = "Text";

export { typeTokens };

 