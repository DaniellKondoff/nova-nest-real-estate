"use client";

import * as React from "react";
import { cn } from "@/lib/design-tokens";

export interface RoomSelectorProps {
  selected: number[]; // e.g., [1,2,3,4] where 4 means 4+
  onChange: (next: number[]) => void;
  className?: string;
}

const OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
];

export default function RoomSelector({ selected, onChange, className }: RoomSelectorProps): React.ReactElement {
  function toggle(v: number) {
    if (selected.includes(v)) {
      onChange(selected.filter((x) => x !== v));
    } else {
      onChange([...selected, v]);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 text-sm font-medium uppercase tracking-wide" style={{ color: "#1a2642" }}>Брой стаи</div>
      <div className="grid grid-cols-4 gap-2">
        {OPTIONS.map((opt) => {
          const isActive = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              aria-pressed={isActive}
              className={cn(
                "h-10 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2",
                isActive
                  ? "border-[#d4af37] bg-[#d4af37] text-white hover:bg-[#b8960e] focus-visible:ring-[#d4af37]"
                  : "border-gray-200 bg-white text-[#2d3748] hover:bg-gray-50 focus-visible:ring-[#d4af37]"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


