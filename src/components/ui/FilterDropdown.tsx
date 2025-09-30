"use client";

import * as React from "react";
import { Check, ChevronDown, Search as SearchIcon, X } from "lucide-react";
import { cn } from "@/lib/design-tokens";

export interface FilterOption {
  value: number | string;
  label: string;
}

export interface FilterDropdownProps {
  label: string;
  placeholder?: string;
  options: FilterOption[];
  selected: (number | string)[];
  onChange: (next: (number | string)[]) => void;
  className?: string;
}

// Accessible dropdown with searchable, checkable list and bulk actions
const DROPDOWN_BUTTON_CLASSES =
  "inline-flex items-center justify-between w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#2d3748] hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]";

export default function FilterDropdown({
  label,
  placeholder = "Изберете...",
  options,
  selected,
  onChange,
  className,
}: FilterDropdownProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const selectedCount = selected.length;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function toggleValue(v: number | string) {
    if (selected.includes(v)) {
      onChange(selected.filter((x) => x !== v));
    } else {
      onChange([...selected, v]);
    }
  }

  function selectAll() {
    onChange(options.map((o) => o.value));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-wide" style={{ color: "#1a2642" }}>{label}</span>
        {selectedCount > 0 && (
          <span className="ml-2 inline-flex items-center rounded-full bg-[#d4af37]/10 px-2 py-0.5 text-xs font-medium" style={{ color: "#1a2642" }}>
            {selectedCount}
          </span>
        )}
      </div>

      <button
        ref={buttonRef}
        type="button"
        className={cn(DROPDOWN_BUTTON_CLASSES)}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate text-left">
          {selectedCount > 0 ? `${selectedCount} избрани` : placeholder}
        </span>
        <span className="ml-2 inline-flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              aria-label="Изчисти избраните"
              className="rounded p-1 text-[#2d3748] hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-[#2d3748]" />
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={label}
          className="z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="relative w-full">
              <input
                className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#2d3748] placeholder:text-[#2d3748]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                placeholder="Търсене..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Търсене в опциите"
              />
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2d3748]/60" />
            </div>
            <button
              type="button"
              className="rounded-md border border-gray-200 px-3 py-2 text-xs text-[#1a2642] hover:bg-gray-50"
              onClick={selectAll}
            >
              Избери всички
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-200 px-3 py-2 text-xs text-[#1a2642] hover:bg-gray-50"
              onClick={clearAll}
            >
              Изчисти
            </button>
          </div>

          <div className="max-h-56 overflow-auto rounded-md border border-gray-100">
            <ul role="listbox" aria-multiselectable className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <li className="p-3 text-sm text-gray-500">Няма резултати.</li>
              ) : (
                filtered.map((opt) => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <li key={String(opt.value)}>
                      <label className={cn("flex cursor-pointer items-center justify-between gap-3 p-3 text-sm", isSelected ? "bg-[#d4af37]/10" : "hover:bg-gray-50")}> 
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-[#d4af37] focus:ring-[#d4af37]"
                            checked={isSelected}
                            onChange={() => toggleValue(opt.value)}
                            aria-checked={isSelected}
                          />
                          <span className="text-[#2d3748]">{opt.label}</span>
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-[#d4af37]" aria-hidden />}
                      </label>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="rounded-md bg-[#d4af37] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8960e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
              onClick={() => setOpen(false)}
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


