import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/design-tokens";
import { Search, ChevronDown } from "lucide-react";

/**
 * Input – Accessible form input with size/variant styles, icons, and validation.
 *
 * Example:
 * <Input 
 *   label="Имейл адрес" 
 *   placeholder="example@email.com"
 *   type="email"
 *   error="Невалиден имейл"
 * />
 */

const inputStyles = cva(
  "w-full rounded-md text-charcoal placeholder:text-charcoal/60 outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "py-2 px-4 text-sm",
        md: "py-3 px-6 text-base",
        lg: "py-4 px-8 text-lg",
      },
      variant: {
        default: "bg-white border border-charcoal/20 focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:border-accent",
        filled: "bg-lightGray border border-transparent focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:border-accent",
        outlined: "bg-transparent border border-primary text-charcoal focus-visible:ring-2 focus-visible:ring-primary/60",
      },
      status: {
        default: "",
        error: "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
        success: "border-green-600 focus-visible:ring-green-600 focus-visible:border-green-600",
      },
      hasLeftIcon: {
        true: "pl-10",
        false: "",
      },
      hasRightIcon: {
        true: "pr-10",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      status: "default",
      hasLeftIcon: false,
      hasRightIcon: false,
    },
  }
);

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof inputStyles> & {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    success?: boolean;
  };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      size,
      variant,
      disabled,
      leftIcon,
      rightIcon,
      success,
      required,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;
    const status: "default" | "error" | "success" = error ? "error" : success ? "success" : "default";

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-primary">
            {label} {required && <span aria-hidden="true" className="text-red-600">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/60">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputStyles({ size, variant, status, hasLeftIcon: !!leftIcon, hasRightIcon: !!rightIcon }),
              className
            )}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            required={required}
            {...props}
          />
          {rightIcon && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/60">
              {rightIcon}
            </span>
          )}
        </div>
        {helperText && (
          <span id={helperId} className="text-xs text-charcoal/70">
            {helperText}
          </span>
        )}
        {error && (
          <span id={errorId} className="text-xs text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export type SearchInputProps = Omit<FormFieldProps, "type">;

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-navy">
            {label}
          </label>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/60" />
          <input
            id={inputId}
            ref={ref}
            type="search"
            className={cn(inputStyles({ size: "md", variant: "default", hasLeftIcon: true }), error && "border-red-500 focus-visible:ring-red-500", className)}
            aria-invalid={!!error}
            aria-describedby={hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {hint && (
          <span id={`${inputId}-hint`} className="text-xs text-charcoal/70">
            {hint}
          </span>
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const autoId = React.useId();
    const selectId = id ?? autoId;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-navy">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full rounded-md bg-white text-base text-charcoal placeholder:text-charcoal/60 outline-none transition-colors duration-200 appearance-none pr-8 border border-charcoal/20 focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:border-accent disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500 focus-visible:ring-red-500",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={hint ? `${selectId}-hint` : undefined}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/60" />
        </div>
        {hint && (
          <span id={`${selectId}-hint`} className="text-xs text-charcoal/70">
            {hint}
          </span>
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  inline?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({ className, inline, ...props }) => (
  <div
    className={cn(
      inline ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "flex flex-col gap-4",
      className
    )}
    {...props}
  />
);


