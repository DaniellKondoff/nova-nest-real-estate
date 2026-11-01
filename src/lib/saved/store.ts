/**
 * Saved listings ("Избрани имоти") – device-only, no account.
 * Property ids live in localStorage (newest first); components read them via useSavedIds().
 * The server snapshot is always empty, so SSR markup is "not saved" and the client fills in after hydration.
 */

import { useSyncExternalStore } from "react";

export const SAVED_STORAGE_KEY = "nn:saved:v1";
export const MAX_SAVED = 50;
const CHANGE_EVENT = "nn:saved";
const EMPTY: number[] = [];

function parse(raw: string | null): number[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    const ids = value.filter((v): v is number => Number.isInteger(v) && v > 0);
    return [...new Set(ids)].slice(0, MAX_SAVED);
  } catch {
    return EMPTY;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(SAVED_STORAGE_KEY);
  } catch {
    return null; // storage disabled (privacy mode, blocked cookies)
  }
}

// Cache by raw string so useSyncExternalStore gets a stable reference
let cachedRaw: string | null = null;
let cachedIds: number[] = EMPTY;

export function getSavedIds(): number[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedIds = parse(raw);
  }
  return cachedIds;
}

function write(ids: number[]): void {
  try {
    if (ids.length === 0) window.localStorage.removeItem(SAVED_STORAGE_KEY);
    else window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_SAVED)));
  } catch {
    // Quota exceeded / storage disabled – the toggle simply doesn't persist
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function isSaved(id: number): boolean {
  return getSavedIds().includes(id);
}

/** Adds (to the front) or removes an id; returns true when it is now saved */
export function toggleSaved(id: number): boolean {
  const ids = getSavedIds();
  if (ids.includes(id)) {
    write(ids.filter((x) => x !== id));
    return false;
  }
  write([id, ...ids]);
  return true;
}

export function removeSaved(remove: number[]): void {
  if (remove.length === 0) return;
  const drop = new Set(remove);
  write(getSavedIds().filter((id) => !drop.has(id)));
}

/**
 * Undo: puts `restore` back at their positions in `previousOrder` (the list before removal).
 * Anything saved in the meantime stays, in front.
 */
export function restoreSaved(restore: number[], previousOrder: number[] = restore): void {
  if (restore.length === 0) return;
  const current = getSavedIds();
  const back = new Set([...restore, ...current]);
  const newer = current.filter((id) => !previousOrder.includes(id));
  write([...new Set([...newer, ...previousOrder.filter((id) => back.has(id))])]);
}

export function clearSaved(): void {
  write(EMPTY);
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === SAVED_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage); // other tabs
  window.addEventListener(CHANGE_EVENT, onChange); // this tab
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const getServerSnapshot = () => EMPTY;

export function useSavedIds(): number[] {
  return useSyncExternalStore(subscribe, getSavedIds, getServerSnapshot);
}
