"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import type { ViewMode } from "@/types/search";

export interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps): React.ReactElement {
  function set(view: ViewMode) {
    if (view === currentView) return;
    onViewChange(view);
    try {
      window.localStorage.setItem("nn-view-mode", view);
    } catch {
      // ignore storage errors
    }
  }

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem("nn-view-mode") as ViewMode | null;
      if (saved === "grid" || saved === "list") {
        onViewChange(saved);
      }
    } catch {
      // ignore
    }
    // onViewChange is controlled by parent; intentionally not included
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isGrid = currentView === "grid";
  const isList = currentView === "list";

  return (
    <div role="group" aria-label="Избор на изглед" className="inline-flex items-center rounded-md border border-gray-300 overflow-hidden">
      <button
        type="button"
        aria-label="Изглед решетка"
        aria-pressed={isGrid}
        onClick={() => set("grid")}
        className={[
          "p-2",
          isGrid ? "bg-[#d4af37] text-white" : "bg-white text-[#1a2642] hover:bg-gray-50",
        ].join(" ")}
        title="Изглед решетка"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Изглед списък"
        aria-pressed={isList}
        onClick={() => set("list")}
        className={[
          "p-2 border-l border-gray-300",
          isList ? "bg-[#d4af37] text-white" : "bg-white text-[#1a2642] hover:bg-gray-50",
        ].join(" ")}
        title="Изглед списък"
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );
}


