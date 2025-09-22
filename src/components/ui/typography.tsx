import * as React from "react";
import { cn } from "@/lib/utils";

type BaseProps = React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean };

export const H1: React.FC<BaseProps> = ({ className, ...props }) => (
  <h1
    className={cn(
      "font-semibold text-[48px] leading-[1.1] md:text-[64px] tracking-tight text-navy",
      className
    )}
    {...props}
  />
);

export const H2: React.FC<BaseProps> = ({ className, ...props }) => (
  <h2
    className={cn(
      "font-medium text-[36px] leading-[1.15] md:text-[48px] tracking-tight text-navy",
      className
    )}
    {...props}
  />
);

export const H3: React.FC<BaseProps> = ({ className, ...props }) => (
  <h3
    className={cn(
      "font-medium text-[28px] leading-[1.2] md:text-[32px] tracking-tight text-navy",
      className
    )}
    {...props}
  />
);

export const H4: React.FC<BaseProps> = ({ className, ...props }) => (
  <h4
    className={cn(
      "font-medium text-[22px] leading-[1.25] md:text-[24px] tracking-tight text-navy",
      className
    )}
    {...props}
  />
);

type TextProps = React.HTMLAttributes<HTMLParagraphElement>;

export const Text: React.FC<TextProps> = ({ className, ...props }) => (
  <p className={cn("text-charcoal text-base leading-relaxed", className)} {...props} />
);

export const Lead: React.FC<TextProps> = ({ className, ...props }) => (
  <p
    className={cn(
      "text-charcoal/90 text-lg md:text-xl leading-[1.6]",
      className
    )}
    {...props}
  />
);


