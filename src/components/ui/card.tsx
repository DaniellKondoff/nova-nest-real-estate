import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "relative rounded-md bg-white border border-black/5 shadow-subtle", // base
  {
    variants: {
      intent: {
        base: "",
        property:
          "transition-shadow hover:shadow-card overflow-hidden",
        testimonial:
          "border-l-4 border-navy pl-5",
      },
    },
    defaultVariants: {
      intent: "base",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, intent, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(cardVariants({ intent }), className)} {...props} />
    );
  }
);
Card.displayName = "Card";

export const CardImage: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { src?: string; alt?: string }
> = ({ className, src, alt, children, ...props }) => {
  return (
    <div className={cn("aspect-[16/10] w-full overflow-hidden bg-gray-light", className)} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
      ) : (
        children
      )}
    </div>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div className={cn("p-4 md:p-5", className)} {...props} />;
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div className={cn("p-4 md:p-5 border-b border-black/5", className)} {...props} />;
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div className={cn("p-4 md:p-5 border-t border-black/5", className)} {...props} />;
};


