"use client";

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/design-tokens";

/**
 * Card – Base card component with subtle variants and padding options.
 *
 * Example:
 * <Card variant="elevated" hoverable onClick={handleClick}>...</Card>
 */
const cardStyles = cva(
  "relative rounded-md bg-white transition-shadow duration-200",
  {
    variants: {
      variant: {
        default: "border border-[#e5e7eb]", // subtle border
        elevated: "border border-[#e5e7eb] shadow-subtle hover:shadow-card",
        outlined: "border-2 border-primary/20",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4 md:p-5",
        lg: "p-6",
      },
      hoverable: {
        true: "hover:shadow-card",
        false: "",
      },
      clickable: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      hoverable: false,
      clickable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof cardStyles>, "clickable"> {
  hoverable?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, onClick, children, ...props }, ref) => {
    const clickable = typeof onClick === "function";
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!clickable) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).click();
      }
    };
    return (
      <div
        ref={ref}
        className={cn(cardStyles({ variant, padding, hoverable, clickable }), className)}
        onClick={onClick}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

type AspectRatio = "16/9" | "4/3" | "1/1" | "auto";
const aspectMap: Record<Exclude<AspectRatio, "auto">, string> = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
};

export interface ImageCardProps extends Omit<CardProps, "children" | "onClick"> {
  imageSrc?: string;
  imageAlt: string;
  aspectRatio?: AspectRatio;
  imagePosition?: "top" | "left" | "right";
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * ImageCard – Card with an image region and content area.
 * Optimized for Next.js Image with proper aspect ratios.
 *
 * Example:
 * <ImageCard imageSrc="/property.jpg" imageAlt="Апартамент в Център" aspectRatio="16/9">...</ImageCard>
 */
export const ImageCard = React.forwardRef<HTMLDivElement, ImageCardProps>(
  (
    {
      className,
      imageSrc,
      imageAlt,
      aspectRatio = "16/9",
      imagePosition = "top",
      variant,
      padding = "md",
      hoverable,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const clickable = typeof onClick === "function";
    const isHorizontal = imagePosition === "left" || imagePosition === "right";
    const imageFirst = imagePosition !== "right";
    const aspectClass = aspectRatio === "auto" ? "" : aspectMap[aspectRatio as Exclude<AspectRatio, "auto">];

    const imageNode = (
      <div className={cn("relative w-full overflow-hidden bg-lightGray", isHorizontal ? "min-h-[180px] basis-2/5" : aspectClass)}>
        {imageSrc ? (
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" sizes="(min-width: 1024px) 600px, 100vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-charcoal/60">Без изображение</div>
        )}
      </div>
    );

    const contentNode = (
      <div className={cn(isHorizontal ? "basis-3/5" : "w-full", padding === "none" ? "p-0" : padding === "sm" ? "p-3" : padding === "md" ? "p-4 md:p-5" : "p-6")}>{children}</div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          cardStyles({ variant, padding: "none", hoverable, clickable }),
          isHorizontal ? "flex gap-0" : "flex flex-col",
          className
        )}
        onClick={onClick}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {imageFirst ? (
          <>
            {imageNode}
            {contentNode}
          </>
        ) : (
          <>
            {contentNode}
            {imageNode}
          </>
        )}
      </div>
    );
  }
);
ImageCard.displayName = "ImageCard";

// Backwards-compatible subcomponents
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-4 md:p-5", className)} {...props} />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-4 md:p-5 border-b border-black/5", className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-4 md:p-5 border-t border-black/5", className)} {...props} />
);


