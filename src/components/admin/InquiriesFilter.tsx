"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/design-tokens";

export interface InquiriesFilterProps {
  onStatusFilter: (status: string | null) => void;
  onTypeFilter: (type: string | null) => void;
}

// Status filter options
const statusOptions = [
  { value: null, label: "Всички" },
  { value: "new", label: "Нови" },
  { value: "in_progress", label: "Прочетени" },
  { value: "responded", label: "Отговорени" },
];

// Inquiry type filter options
const typeOptions = [
  { value: null, label: "Всички типове" },
  { value: "general", label: "Общо" },
  { value: "property_interest", label: "Интерес към имот" },
  { value: "viewing_request", label: "Заявка за оглед" },
  { value: "valuation", label: "Оценка" },
  { value: "selling", label: "Продажба" },
  { value: "renting", label: "Наемане" },
];

interface FilterDropdownProps {
  label: string;
  options: { value: string | null; label: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

function FilterDropdown({ label, options, value, onChange, className }: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(opt => opt.value === value);

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

  return (
    <div className={cn("relative", className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-wide" style={{ color: "#1a2642" }}>
          {label}
        </span>
      </div>

      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "inline-flex items-center justify-between w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#2d3748] hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] h-10"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate text-left">
          {selectedOption?.label || "Изберете..."}
        </span>
        <ChevronDown className="h-4 w-4 text-[#2d3748] ml-2" />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <div className="max-h-56 overflow-auto rounded-lg border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {options.map((option) => (
                <li key={option.value || "all"}>
                  <button
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                      value === option.value ? "bg-[#d4af37]/10 text-[#1a2642]" : "text-[#2d3748]"
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InquiriesFilter({ onStatusFilter, onTypeFilter }: InquiriesFilterProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  const handleStatusChange = (status: string | null) => {
    setSelectedStatus(status);
    onStatusFilter(status);
  };

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type);
    onTypeFilter(type);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg mb-4 border border-gray-200">
      <div className="w-full sm:w-48">
        <FilterDropdown
          label="Статус"
          options={statusOptions}
          value={selectedStatus}
          onChange={handleStatusChange}
        />
      </div>
      <div className="w-full sm:w-48">
        <FilterDropdown
          label="Тип запитване"
          options={typeOptions}
          value={selectedType}
          onChange={handleTypeChange}
        />
      </div>
    </div>
  );
}
