import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/design-tokens";
import { ChevronDown, X, Search } from "lucide-react";

export type SelectOption = { value: string; label: string };

const selectStyles = cva(
  "w-full rounded-md bg-white text-base text-charcoal placeholder:text-charcoal/60 outline-none transition-colors duration-200 border border-charcoal/20 focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:border-accent disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "py-2 px-3 text-sm",
        md: "py-2.5 px-3 text-base",
        lg: "py-3.5 px-4 text-lg",
      },
      variant: {
        default: "bg-white",
        filled: "bg-lightGray border-transparent",
        outlined: "bg-transparent border-primary",
      },
      hasIcon: {
        true: "pr-9",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      hasIcon: true,
    },
  }
);

export type SelectProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "value"> &
  VariantProps<typeof selectStyles> & {
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    helperText?: string;
    disabled?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    required?: boolean;
  };

/**
 * Select – Custom combobox with search and keyboard navigation.
 *
 * Example:
 * <Select 
 *   label="Квартал"
 *   placeholder="Изберете квартал"
 *   options={[{ value: 'centrum', label: 'Център' }]}
 *   value={selectedNeighborhood}
 *   onChange={setSelectedNeighborhood}
 * />
 */
export const Select = React.forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      className,
      label,
      placeholder = "Изберете...",
      options,
      value,
      onChange,
      error,
      helperText,
      disabled,
      size,
      variant,
      clearable = true,
      searchable = true,
      required,
      id,
      ...rest
    },
    ref
  ) => {
    const autoId = React.useId();
    const selectId = id ?? autoId;

    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState<number>(-1);

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);

    const selectedOption = options.find((o) => o.value === value) || null;
    const filtered = query
      ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : options;

    React.useEffect(() => {
      function onClickOutside(e: MouseEvent) {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target as Node)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const openList = () => {
      if (disabled) return;
      setOpen(true);
      setTimeout(() => listRef.current?.focus(), 0);
    };
    const closeList = () => {
      setOpen(false);
      setActiveIndex(-1);
      setQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.("");
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openList();
        setActiveIndex(0);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeList();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min((i < 0 ? 0 : i) + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = filtered[activeIndex];
        if (opt) {
          onChange?.(opt.value);
          closeList();
        }
      }
    };

    return (
      <div className="flex w-full flex-col gap-1.5" ref={containerRef}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-primary">
            {label} {required && <span aria-hidden="true" className="text-red-600">*</span>}
          </label>
        )}

        {/* Combobox Control */}
        <div
          className={cn(selectStyles({ size, variant, hasIcon: true }), "relative flex items-center")}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${selectId}-listbox`}
          aria-haspopup="listbox"
          aria-invalid={!!error || undefined}
          aria-owns={`${selectId}-listbox`}
          onClick={() => (open ? closeList() : openList())}
          onKeyDown={handleKeyDown}
        >
          {searchable ? (
            <>
              <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-charcoal/60" />
              <input
                ref={(node) => {
                  inputRef.current = node;
                  if (typeof ref === "function") ref(node as any);
                  else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
                }}
                id={selectId}
                className="w-full bg-transparent pl-8 pr-8 py-1.5 text-current placeholder:text-charcoal/60 focus:outline-none"
                placeholder={selectedOption ? selectedOption.label : placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpen(true)}
                aria-autocomplete="list"
                aria-controls={`${selectId}-listbox`
                }
              />
            </>
          ) : (
            <div className="w-full truncate py-1.5 pr-8">
              {selectedOption ? selectedOption.label : (
                <span className="text-charcoal/60">{placeholder}</span>
              )}
            </div>
          )}

          {/* Clear button */}
          {clearable && selectedOption && (
            <button
              type="button"
              className="absolute right-8 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-charcoal/10"
              onClick={handleClear}
              aria-label="Изчисти избора"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-charcoal/60" />
        </div>

        {/* Dropdown */}
        <div
          className={cn(
            "relative",
            open ? "block" : "hidden"
          )}
        >
          <ul
            id={`${selectId}-listbox`}
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-charcoal/15 bg-white py-1 shadow-lg outline-none animate-in fade-in-50"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-charcoal/70">Няма резултати</li>
            ) : (
              filtered.map((opt, idx) => {
                const isActive = idx === activeIndex;
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "cursor-pointer select-none px-3 py-2 text-sm",
                      isActive ? "bg-lightGray" : "",
                      isSelected ? "text-primary font-medium" : "text-charcoal"
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      // Prevent blur before click handler
                      e.preventDefault();
                    }}
                    onClick={() => {
                      onChange?.(opt.value);
                      closeList();
                    }}
                  >
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {helperText && (
          <span className="text-xs text-charcoal/70">{helperText}</span>
        )}
        {error && (
          <span className="text-xs text-red-600">{error}</span>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";


