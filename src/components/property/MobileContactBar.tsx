import React from "react";
import { MessageCircle, MessageSquare, Phone } from "lucide-react";
import { viberHref } from "@/lib/contact-links";

interface MobileContactBarProps {
  phoneNumber: string;
  /** Formatted price, e.g. "79 990 €" (null → "Цена при запитване") */
  price: string | null;
  isRent?: boolean;
  /** Short location under the price, e.g. "кв. Казански" */
  location?: string | null;
  /** Anchor id of the inquiry form to jump to */
  formAnchor?: string;
  /** Pre-filled Viber message (e.g. with the listing URL) */
  viberDraft?: string;
}

/**
 * Fixed bottom bar for mobile & tablet (server component – plain links): price stays in view while scrolling,
 * one tap to call or jump to the inquiry form.
 * `data-mobile-bottom-bar` lifts floating buttons (chat, back-to-top) above it via CSS.
 */
export default function MobileContactBar({
  phoneNumber,
  price,
  isRent = false,
  location,
  formAnchor = "contact-sidebar",
  viberDraft,
}: MobileContactBarProps): React.ReactElement {
  return (
    <div
      data-mobile-bottom-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(26,38,66,0.08)] backdrop-blur xl:hidden"
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold leading-tight text-primary">
            {price ?? "Цена при запитване"}
            {price && isRent && <span className="text-sm font-medium text-charcoal/75"> / мес.</span>}
          </p>
          {location && <p className="truncate text-xs text-charcoal/75">{location}</p>}
        </div>
        <a
          href={`tel:${phoneNumber}`}
          aria-label="Обадете се"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-light active:scale-[0.98]"
        >
          <Phone className="h-5 w-5" aria-hidden />
        </a>
        <a
          href={viberHref(viberDraft)}
          aria-label="Пишете ни във Viber"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-viber text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
        </a>
        <a
          href={`#${formAnchor}`}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 font-semibold text-primary transition-colors hover:bg-accent-light active:scale-[0.98] max-[399px]:px-3"
        >
          <MessageSquare className="h-5 w-5" aria-hidden />
          <span className="max-[399px]:sr-only">Запитване</span>
        </a>
      </div>
    </div>
  );
}
