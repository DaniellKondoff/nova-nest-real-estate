"use client";

import Link from "next/link";
import { site } from "@/config/site";
import { setConsent, useConsent, useConsentPanelOpen } from "@/lib/consent/store";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-primary px-4 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

/**
 * Compact cookie consent card. Non-blocking (no overlay, focus is not stolen), shown until the
 * visitor decides or when reopened from the footer. "Accept" and "Reject" are equal in size (GDPR).
 * Sits above the property page's mobile bottom bar via --fab-offset.
 */
export default function CookieConsentBanner() {
  const consent = useConsent();
  const reopened = useConsentPanelOpen();

  if (consent !== "unknown" && !reopened) return null;

  return (
    <div
      role="region"
      aria-label="Бисквитки"
      className="fixed inset-x-3 bottom-[calc(var(--fab-offset)+0.75rem)] z-[60] rounded-2xl bg-white p-3.5 shadow-lift ring-1 ring-primary/10 motion-safe:animate-fade-up sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-full sm:max-w-sm"
    >
      <p className="text-sm leading-snug text-primary/80">
        Използваме бисквитки за статистика – само с ваше съгласие.{" "}
        <Link
          href={site.legal.privacyPolicyPath}
          className="inline-block py-2 font-medium text-accent-dark underline underline-offset-2"
        >
          Повече
        </Link>
      </p>
      <div className="mt-1 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={() => setConsent(false)} className={`${buttonClass} bg-white text-primary hover:bg-primary/5`}>
          Отказвам
        </button>
        <button type="button" onClick={() => setConsent(true)} className={`${buttonClass} bg-primary text-white hover:bg-primary-light`}>
          Приемам
        </button>
      </div>
    </div>
  );
}
