"use client";

import React from "react";
import Link from "next/link";
import { Heart, Info, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSaved, removeSaved, useSavedIds } from "@/lib/saved/store";
import { cn } from "@/lib/utils";
import SavedListingsView from "@/components/property/saved/SavedListingsView";
import { getSavedListings, type SavedListingsResult } from "./actions";

const MAX_SKELETONS = 6;

function propertiesLabel(n: number): string {
  return n === 1 ? "1 имот" : `${n} имота`;
}

function removedNotice(n: number): string {
  return n === 1
    ? "1 имот вече не е наличен и беше премахнат от списъка."
    : `${n} имота вече не са налични и бяха премахнати от списъка.`;
}

function Skeletons({ count }: { count: number }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: Math.min(Math.max(count, 1), MAX_SKELETONS) }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-card border border-border bg-white shadow-card">
          <div className="aspect-[4/3] animate-pulse bg-gray-light motion-reduce:animate-none" />
          <div className="space-y-3 p-4 sm:p-5">
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-light motion-reduce:animate-none" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-gray-light motion-reduce:animate-none" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-light motion-reduce:animate-none" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-gray-300 bg-white px-6 py-14 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
        <Heart className="h-8 w-8 text-accent-dark" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-primary sm:text-xl">Все още нямате избрани имоти</h2>
      <p className="mt-2 max-w-sm text-charcoal/70">
        Натиснете <Heart className="inline h-4 w-4 align-[-2px] text-accent-dark" aria-hidden="true" />
        <span className="sr-only">сърцето</span> върху обява, за да
        я запазите и сравните по-късно.
      </p>
      <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
        <Link href="/properties/">Разгледайте имотите</Link>
      </Button>
    </div>
  );
}

/**
 * Reads saved ids from localStorage and renders them through the getSavedListings server action.
 * Unsaving a card here updates the store, which refetches the list (old view stays dimmed meanwhile).
 */
export default function SavedListingsClient() {
  const ids = useSavedIds();
  const [mounted, setMounted] = React.useState(false);
  const [result, setResult] = React.useState<SavedListingsResult | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const [pending, startTransition] = React.useTransition();
  const requestRef = React.useRef(0);
  const key = ids.join(",");

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted) return;
    const request = ++requestRef.current;
    if (key === "") {
      setResult(null);
      return;
    }
    const current = key.split(",").map(Number);
    startTransition(async () => {
      const res = await getSavedListings(current);
      if (request !== requestRef.current) return; // a newer request superseded this one
      setResult(res);
      if (res.missing.length > 0) {
        setNotice(removedNotice(res.missing.length));
        removeSaved(res.missing);
      }
    });
  }, [mounted, key, attempt]);

  const onClear = () => {
    if (window.confirm("Да премахнем ли всички избрани имоти?")) {
      setNotice(null);
      clearSaved();
    }
  };

  const count = result && !result.error ? result.items.length : ids.length;
  const loading = !mounted || (ids.length > 0 && result === null);

  return (
    <div>
      {notice && (
        <p role="status" className="mb-5 flex items-start gap-2 rounded-card border border-accent/40 bg-accent/10 p-4 text-sm text-primary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" aria-hidden="true" />
          {notice}
        </p>
      )}

      {loading ? (
        <>
          <span className="sr-only" role="status">
            Зареждане на избраните имоти…
          </span>
          <Skeletons count={ids.length} />
        </>
      ) : ids.length === 0 ? (
        <EmptyState />
      ) : result?.error ? (
        <div role="alert" className="flex flex-col items-center rounded-card border border-border bg-white px-6 py-12 text-center">
          <p className="font-semibold text-primary">Не успяхме да заредим избраните имоти.</p>
          <Button variant="outline" className="mt-4" onClick={() => setAttempt((a) => a + 1)} disabled={pending}>
            <RotateCw className={cn("h-4 w-4", pending && "animate-spin")} aria-hidden="true" />
            Опитайте отново
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-5 flex min-h-11 items-center justify-between gap-4">
            <p className="font-semibold text-primary" aria-live="polite">
              {propertiesLabel(count)}
            </p>
            <button
              type="button"
              onClick={onClear}
              className="-mr-2 inline-flex h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-charcoal/75 transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Изчисти всички
            </button>
          </div>
          <div aria-busy={pending} className={cn("transition-opacity duration-200", pending && "opacity-60")}>
            {result && <SavedListingsView items={result.items} />}
          </div>
        </>
      )}
    </div>
  );
}
