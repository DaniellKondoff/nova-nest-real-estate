/**
 * Cookie / analytics consent (GDPR, Google Consent Mode v2) – device-only, no account.
 * The choice lives in localStorage; the GA init script (components/analytics/GoogleAnalytics.tsx)
 * reads the same key before gtag loads, so returning visitors never fire a "denied" hit first.
 * The server snapshot is always "unknown", so SSR renders no banner.
 */

import { useSyncExternalStore } from "react";

import { CONSENT_STORAGE_KEY } from "./constants";

const CHANGE_EVENT = "nn:consent";

export type ConsentState = "unknown" | "granted" | "denied";

type GtagFn = (...args: unknown[]) => void;

function readState(): ConsentState {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return "unknown";
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === "object" && "analytics" in value) {
      return (value as { analytics: unknown }).analytics === true ? "granted" : "denied";
    }
  } catch {
    // storage disabled or corrupt value – treat as undecided
  }
  return "unknown";
}

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  return readState();
}

/** Tells Google about the choice. Only analytics is ever granted – we run no ads. */
function updateGoogleConsent(analytics: boolean): void {
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag !== "function") return;
  gtag("consent", "update", { analytics_storage: analytics ? "granted" : "denied" });
}

export function setConsent(analytics: boolean): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics, ts: Date.now() }));
  } catch {
    // Storage disabled – the choice applies for this page view only
  }
  updateGoogleConsent(analytics);
  panelOpen = false;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// "Reopen from footer" flag (module state, not persisted)
let panelOpen = false;

export function openConsentPanel(): void {
  panelOpen = true;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function closeConsentPanel(): void {
  panelOpen = false;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage); // other tabs
  window.addEventListener(CHANGE_EVENT, onChange); // this tab
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, getConsent, () => "unknown" as ConsentState);
}

export function useConsentPanelOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => panelOpen,
    () => false,
  );
}
