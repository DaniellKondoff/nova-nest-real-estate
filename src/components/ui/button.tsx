import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Button – Nova Nest Real Estate UI component
 *
 * Variants: primary (gold), secondary (navy), outline, outline-light (for dark bgs), ghost, link, danger
 * Sizes: sm (40px), md (44px, default), lg (48px), xl (56px), icon (44×44)
 * `asChild` renders the styles onto the single child (e.g. next/link) – keeps links crawlable.
 *
 * Example:
 * <Button variant="primary" size="lg">Търсене</Button>
 * <Button asChild variant="secondary"><Link href="/properties/">Имоти</Link></Button>
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-primary shadow-gold hover:bg-accent-dark hover:text-white focus-visible:ring-accent",
        secondary:
          "bg-primary text-white hover:bg-primary-light focus-visible:ring-primary",
        outline:
          "border-2 border-primary/15 bg-white text-primary hover:border-primary hover:bg-primary/5 focus-visible:ring-primary",
        "outline-light":
          "border-2 border-white/30 bg-white/5 text-white backdrop-blur-sm hover:border-accent hover:text-accent focus-visible:ring-accent focus-visible:ring-offset-primary",
        ghost:
          "bg-transparent text-primary hover:bg-primary/5 focus-visible:ring-primary/40",
        link:
          "h-auto px-0 text-primary underline-offset-4 decoration-accent hover:underline focus-visible:ring-primary/40",
        danger:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
          {children}
        </Slot>
      );
    }

    const isDisabled = disabled || isLoading;
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span className="inline-flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {rightIcon && !isLoading && (
          <span className="inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
