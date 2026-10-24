"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Prev/next buttons for a server-rendered horizontal scroll-snap row (by element id).
 * The row itself works without JS (swipe / trackpad); this only adds pointer controls.
 */
export default function ScrollRowControls({ targetId, className }: { targetId: string; className?: string }) {
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  React.useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 4);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  const scroll = (dir: 1 | -1) => {
    const el = document.getElementById(targetId);
    el?.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-subtle transition-colors hover:border-accent hover:bg-accent disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className={cn("flex gap-2", className)}>
      <button type="button" aria-label="Назад" aria-controls={targetId} disabled={atStart} onClick={() => scroll(-1)} className={btn}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" aria-label="Напред" aria-controls={targetId} disabled={atEnd} onClick={() => scroll(1)} className={btn}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
