import { useEffect, useRef } from 'react';
import { isBotUserAgent } from '@/lib/bot-detection';

interface UsePropertyViewTrackingOptions {
  propertyId: number;
  enabled?: boolean;
  debounceMs?: number;
}

const viewedKey = (propertyId: number) => `nn:viewed:${propertyId}`;

/** sessionStorage can throw (Safari private mode, disabled storage) – treat that as "not viewed" */
function wasViewedThisSession(propertyId: number): boolean {
  try {
    return sessionStorage.getItem(viewedKey(propertyId)) === '1';
  } catch {
    return false;
  }
}

function markViewedThisSession(propertyId: number): void {
  try {
    sessionStorage.setItem(viewedKey(propertyId), '1');
  } catch {
    // ignore – the server still dedupes per IP/day
  }
}

/**
 * Hook to track property views with debouncing and error handling.
 * Skips bots and sends at most one view per property per browser session;
 * the API additionally dedupes per IP per day.
 */
export function usePropertyViewTracking({
  propertyId,
  enabled = true,
  debounceMs = 1000
}: UsePropertyViewTrackingOptions) {
  const hasTracked = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !propertyId || hasTracked.current) {
      return;
    }

    if (navigator.webdriver || isBotUserAgent(navigator.userAgent) || wasViewedThisSession(propertyId)) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Debounce the view tracking
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}/view`, {
          method: 'POST',
          keepalive: true,
        });

        if (response.ok) {
          hasTracked.current = true;
          markViewedThisSession(propertyId);
        } else {
          console.warn('Failed to track property view:', response.status);
        }
      } catch (error) {
        // Silent fail - don't break user experience
        console.warn('Error tracking property view:', error);
      }
    }, debounceMs);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [propertyId, enabled, debounceMs]);

  return {
    hasTracked: hasTracked.current,
  };
}
