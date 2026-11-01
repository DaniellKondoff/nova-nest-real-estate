"use client";

import React from "react";
import { Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UndoSnackbarProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms (paused while hovered/focused) */
  duration?: number;
}

/**
 * Bottom snackbar with an undo action – replaces blocking confirm() dialogs.
 * Phones: full-width in the thumb zone above the home indicator; sm+: compact card bottom-left.
 * Render it with a changing `key` to restart the timer for a new message.
 */
export default function UndoSnackbar({ message, onUndo, onDismiss, duration = 6000 }: UndoSnackbarProps) {
  const [visible, setVisible] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const remaining = React.useRef(duration);
  const dismissRef = React.useRef(onDismiss);
  React.useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  // Enter transition on the next frame
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Countdown that keeps the remaining time across pauses
  React.useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const timer = window.setTimeout(() => dismissRef.current(), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(1500, remaining.current - (Date.now() - started));
    };
  }, [paused]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
      <div
        role="status"
        aria-live="polite"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className={cn(
          "pointer-events-auto mx-auto flex min-h-14 w-full max-w-md items-center gap-2 rounded-card bg-primary py-1.5 pl-4 pr-1.5 text-white shadow-lift ring-1 ring-white/10 sm:mx-0",
          "transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        )}
      >
        <p className="min-w-0 flex-1 text-[15px] leading-snug">{message}</p>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 font-semibold text-accent transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
          Върни
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Затвори"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
