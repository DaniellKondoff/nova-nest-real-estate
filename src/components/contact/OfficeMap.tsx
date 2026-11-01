"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OfficeMapProps {
  /** Address (or "lat,lng") Google Maps should pin */
  query: string;
  className?: string;
}

/**
 * Click-to-load Google map: nothing is requested from Google (no cookies) until the visitor taps.
 * Without JS the placeholder still links to Google Maps.
 */
export default function OfficeMap({ query, className }: OfficeMapProps) {
  const [loaded, setLoaded] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  React.useEffect(() => {
    if (loaded) frameRef.current?.focus();
  }, [loaded]);

  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden rounded-card bg-muted shadow-card sm:aspect-video", className)}>
      {loaded ? (
        <div ref={frameRef} tabIndex={-1} className="h-full w-full focus:outline-none">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
            title="Карта: офис на Nova Nest в Стара Загора"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/30">
            <MapPin className="h-7 w-7 text-accent-dark" aria-hidden="true" />
          </span>
          <p className="max-w-xs text-sm text-charcoal/75">{query}</p>
          <Button type="button" variant="secondary" onClick={() => setLoaded(true)}>
            Покажи картата
          </Button>
          <noscript>
            <a href={mapsUrl} className="font-medium text-primary underline decoration-accent underline-offset-4">
              Отворете в Google Maps
            </a>
          </noscript>
          <p className="text-xs text-charcoal/60">Картата се зарежда от Google Maps след натискане.</p>
        </div>
      )}
    </div>
  );
}
