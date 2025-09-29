import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/design-tokens";

type ContainerElement = "div" | "section" | "main";

const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      full: "max-w-full",
    },
    padding: {
      none: "px-0",
      sm: "px-4",
      md: "px-4 sm:px-6 lg:px-8",
      lg: "px-8",
    },
  },
  defaultVariants: {
    size: "xl",
    padding: "md",
  },
});

export type ContainerProps<T extends ContainerElement = "div"> =
  React.PropsWithChildren<
    {
      as?: T;
      className?: string;
    } & VariantProps<typeof containerVariants>
  > &
    Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">;

/**
 * Container – Centers content with configurable max-width and responsive padding.
 *
 * Example:
 * <Container size="xl" padding="lg">...</Container>
 */
export function Container<T extends ContainerElement = "div">(
  props: ContainerProps<T>
) {
  const { as, className, size, padding, children, ...rest } = props as ContainerProps;
  const Component = (as ?? "div") as React.ElementType;
  return (
    <Component className={cn(containerVariants({ size, padding }), className)} {...rest}>
      {children}
    </Component>
  );
}


