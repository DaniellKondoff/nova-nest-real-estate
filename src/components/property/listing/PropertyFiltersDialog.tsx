"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { buildPropertiesHref } from "@/lib/search/params";
import { cn } from "@/lib/utils";
import PropertyFilterForm, { type PropertyFilterFormProps } from "./PropertyFilterForm";
import { ListingLink } from "./PropertiesNavigation";

interface PropertyFiltersDialogProps extends Omit<PropertyFilterFormProps, "variant" | "id" | "onSubmitted"> {
  activeCount: number;
  /** Trigger label – "Филтри" on mobile, "Всички филтри" next to the desktop bar */
  label?: string;
  className?: string;
}

const FORM_ID = "property-filters-full";

/**
 * Full filter set in a bottom sheet (mobile) / side panel (md+).
 * Radix Dialog handles focus trap, scroll lock and Escape.
 */
export default function PropertyFiltersDialog({
  activeCount,
  label = "Филтри",
  className,
  ...formProps
}: PropertyFiltersDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-[15px] font-semibold text-primary shadow-subtle transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            activeCount > 0 && "border-primary",
            className
          )}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {label}
          {activeCount > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-primary">
              {activeCount}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-primary/50 backdrop-blur-sm data-[state=open]:animate-[fade-up_0.2s_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-[61] flex flex-col bg-white shadow-2xl outline-none",
            // Mobile: bottom sheet
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl",
            // md+: right side panel
            "md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[28rem] md:rounded-none md:rounded-l-3xl",
            "data-[state=open]:animate-[fade-up_0.25s_ease-out]"
          )}
        >
          <div className="flex justify-center pt-3 md:hidden" aria-hidden="true">
            <div className="h-1.5 w-10 rounded-full bg-gray-300" />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 md:py-5">
            <Dialog.Title className="text-lg font-bold text-primary">Филтри</Dialog.Title>
            <Dialog.Close
              aria-label="Затвори филтрите"
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-charcoal/60 transition-colors hover:bg-gray-100 hover:text-primary"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            <PropertyFilterForm {...formProps} variant="full" id={FORM_ID} onSubmitted={() => setOpen(false)} />
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-gray-100 bg-white px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <ListingLink
              href={buildPropertiesHref({ sort: formProps.filters.sort })}
              onClickCapture={() => setOpen(false)}
              className="inline-flex h-12 items-center justify-center rounded-xl px-4 font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:bg-gray-50"
            >
              Изчисти
            </ListingLink>
            <button
              type="submit"
              form={FORM_ID}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-accent font-semibold text-primary shadow-gold transition-colors hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Покажи резултатите
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
