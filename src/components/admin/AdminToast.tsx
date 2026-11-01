"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface AdminToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const AUTO_DISMISS_MS = 4000;

const AdminToastContext = createContext<AdminToastApi | null>(null);

/** Inline replacement for alert() in the admin panel – mounted once in admin/layout.tsx */
export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev.slice(-2), { id, kind, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const api = useMemo<AdminToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
    }),
    [push]
  );

  return (
    <AdminToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            aria-live={t.kind === "error" ? "assertive" : "polite"}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-card border bg-white py-2 pl-4 pr-1 shadow-card",
              t.kind === "error" ? "border-red-200" : "border-accent/40"
            )}
          >
            {t.kind === "error" ? (
              <AlertCircle className="mt-2.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
            ) : (
              <CheckCircle2 className="mt-2.5 h-5 w-5 shrink-0 text-accent-dark" aria-hidden />
            )}
            <p className="flex-1 py-2 text-sm text-charcoal">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-charcoal/60 hover:bg-gray-light hover:text-primary"
              aria-label="Затвори"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): AdminToastApi {
  const ctx = useContext(AdminToastContext);
  if (!ctx) throw new Error("useAdminToast must be used inside AdminToastProvider");
  return ctx;
}
