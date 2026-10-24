import React from "react";
import { MessageSquare, Phone } from "lucide-react";

interface MobileContactBarProps {
  phoneNumber: string;
  /** Anchor id of the inquiry form to jump to */
  formAnchor?: string;
}

/**
 * Fixed bottom call/inquiry bar for mobile & tablet (server component – plain links).
 * `data-mobile-bottom-bar` lifts floating buttons (chat, back-to-top) above it via CSS.
 */
export default function MobileContactBar({ phoneNumber, formAnchor = "contact-sidebar" }: MobileContactBarProps): React.ReactElement {
  return (
    <div
      data-mobile-bottom-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(26,38,66,0.08)] backdrop-blur xl:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
        <a
          href={`tel:${phoneNumber}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-light active:scale-[0.98]"
        >
          <Phone className="h-5 w-5" aria-hidden />
          Обадете се
        </a>
        <a
          href={`#${formAnchor}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-primary transition-colors hover:bg-accent-light active:scale-[0.98]"
        >
          <MessageSquare className="h-5 w-5" aria-hidden />
          Запитване
        </a>
      </div>
    </div>
  );
}
