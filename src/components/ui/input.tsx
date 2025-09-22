import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const baseInputClasses =
  "w-full rounded-md border border-[color:var(--nn-charcoal-border,_#2d3748_/_20%)] bg-white px-3 py-2 text-base text-charcoal placeholder:text-charcoal/50 outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:border-gold transition disabled:opacity-50 disabled:cursor-not-allowed";

export const Input = React.forwardRef<HTMLInputElement, FormFieldProps>(
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
        <input
          id={inputId}
          ref={ref}
          className={cn(baseInputClasses, error && "border-red-500 focus-visible:ring-red-500", className)}
          aria-invalid={!!error}
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          {...props}
        />
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
            className={cn(
              baseInputClasses,
              "pl-9",
              error && "border-red-500 focus-visible:ring-red-500",
              className
            )}
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
              baseInputClasses,
              "appearance-none pr-8",
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


