"use client";

import { useEffect, useRef, ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  propertyTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  isBulk?: boolean;
  title?: string;
  message?: string | ReactNode;
}

export default function DeleteConfirmModal({
  isOpen,
  propertyTitle,
  onConfirm,
  onCancel,
  loading = false,
  isBulk = false,
  title,
  message,
}: DeleteConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel, loading]);

  // Handle outside click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        {/* Heading */}
        <h3
          id="modal-title"
          className="text-lg font-semibold text-gray-900 text-center mb-2"
        >
          {title || "Изтриване на имот"}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center mb-6">
          {message ? (
            message
          ) : isBulk ? (
            <>
              Сигурни ли сте, че искате да изтриете{" "}
              <span className="font-semibold text-gray-900">{propertyTitle}</span>?
              Всички избрани имоти ще бъдат архивирани.
            </>
          ) : (
            <>
              Сигурни ли сте, че искате да изтриете{" "}
              <span className="font-semibold text-gray-900">&quot;{propertyTitle}&quot;</span>?
              Това действие не може да бъде отменено.
            </>
          )}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Отказ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isBulk ? "Изтрий всички" : "Изтрий"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

