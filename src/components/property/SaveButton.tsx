"use client";

import React from "react";
import { Heart } from "lucide-react";
import { toggleSaved, useSavedIds } from "@/lib/saved/store";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  propertyId: number;
  /** card: round icon over the card image · detail: labelled pill next to "Споделете" */
  variant?: "card" | "detail";
  className?: string;
}

/**
 * Heart toggle for "Избрани имоти" (localStorage, no account).
 * Sits above the card's stretched link (z-10), so tapping it never opens the listing.
 */
export default function SaveButton({ propertyId, variant = "card", className }: SaveButtonProps): React.ReactElement {
  const ids = useSavedIds();
  const saved = ids.includes(propertyId);
  const [announcement, setAnnouncement] = React.useState("");

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleSaved(propertyId);
    const count = nowSaved ? ids.length + 1 : ids.length - 1;
    setAnnouncement(nowSaved ? `Добавено в избрани (${Math.min(count, 50)})` : "Премахнато от избрани");
  };

  const label = saved ? "Премахни от избрани" : "Запази в избрани";
  const icon = (
    <Heart
      className={cn(
        "h-5 w-5 transition-[color,fill,transform] duration-200 motion-reduce:transition-none",
        saved ? "scale-110 fill-accent text-accent" : "text-primary"
      )}
      aria-hidden="true"
    />
  );

  return (
    <>
      {variant === "card" ? (
        <button
          type="button"
          onClick={onClick}
          aria-pressed={saved}
          aria-label={label}
          title={label}
          className={cn(
            "relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur-sm",
            "transition-transform hover:scale-105 active:scale-90 motion-reduce:transform-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            className
          )}
        >
          {icon}
        </button>
      ) : (
        <button
          type="button"
          onClick={onClick}
          aria-pressed={saved}
          aria-label={label}
          className={cn(
            "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl border bg-white px-3 text-sm sm:px-4 font-semibold text-primary transition-colors active:scale-[0.97] motion-reduce:transform-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            saved ? "border-accent bg-accent/10" : "border-gray-300 hover:border-primary",
            className
          )}
        >
          {icon}
          {/* Icon-only on phones so price + both actions fit one row at 360px */}
          <span className="hidden sm:inline">{saved ? "Запазено" : "Запази"}</span>
        </button>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}
