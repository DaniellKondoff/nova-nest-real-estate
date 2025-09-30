"use client";

import * as React from "react";
import { cn } from "@/lib/design-tokens";

export interface PriceRangeValue {
  min?: number;
  max?: number;
}

export interface PriceRangeInputProps {
  label: string;
  suffix?: string;
  value: PriceRangeValue;
  onChange: (value: PriceRangeValue) => void;
  className?: string;
  ariaDescribedBy?: string;
}

function formatBgNumber(n: number | undefined): string {
  if (n === undefined || n === null) return "";
  return new Intl.NumberFormat("bg-BG").format(n);
}

function parseNumber(input: string): number | undefined {
  const clean = input.replace(/\s+/g, "").replace(/\./g, "").replace(/,/g, "");
  const n = Number(clean);
  return Number.isFinite(n) ? n : undefined;
}

export default function PriceRangeInput({ label, suffix = "€", value, onChange, className, ariaDescribedBy }: PriceRangeInputProps): React.ReactElement {
  const [localMin, setLocalMin] = React.useState<string>(value.min?.toString() ?? "");
  const [localMax, setLocalMax] = React.useState<string>(value.max?.toString() ?? "");

  React.useEffect(() => {
    setLocalMin(value.min !== undefined ? String(value.min) : "");
    setLocalMax(value.max !== undefined ? String(value.max) : "");
  }, [value.min, value.max]);

  const hasError = value.min !== undefined && value.max !== undefined && value.min > value.max;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 text-sm font-medium uppercase tracking-wide" style={{ color: "#1a2642" }}>{label}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="От..."
            className={cn(
              "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-[#2d3748] placeholder:text-[#2d3748]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]",
              hasError && "border-[#ef4444] focus-visible:ring-[#ef4444]"
            )}
            value={localMin}
            onChange={(e) => {
              const raw = e.target.value;
              setLocalMin(raw);
              onChange({ min: parseNumber(raw), max: value.max });
            }}
            aria-invalid={hasError || undefined}
            aria-describedby={ariaDescribedBy}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#2d3748]/60">{suffix}</span>
        </div>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="До..."
            className={cn(
              "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-[#2d3748] placeholder:text-[#2d3748]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]",
              hasError && "border-[#ef4444] focus-visible:ring-[#ef4444]"
            )}
            value={localMax}
            onChange={(e) => {
              const raw = e.target.value;
              setLocalMax(raw);
              onChange({ min: value.min, max: parseNumber(raw) });
            }}
            aria-invalid={hasError || undefined}
            aria-describedby={ariaDescribedBy}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#2d3748]/60">{suffix}</span>
        </div>
      </div>
      {hasError && (
        <p className="mt-1 text-xs text-[#ef4444]" role="alert" id={ariaDescribedBy}>
          Минималната стойност трябва да е по-малка или равна на максималната.
        </p>
      )}
    </div>
  );
}


