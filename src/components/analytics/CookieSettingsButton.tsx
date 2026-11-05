"use client";

import { openConsentPanel } from "@/lib/consent/store";

/** Footer link that reopens the consent banner – withdrawing consent must be as easy as giving it. */
export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentPanel} className={className}>
      Настройки за бисквитки
    </button>
  );
}
