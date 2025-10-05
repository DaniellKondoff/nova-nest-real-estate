import { useEffect, useRef } from 'react';

interface UsePropertyViewTrackingOptions {
  propertyId: number;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook to track property views with debouncing and error handling
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
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          hasTracked.current = true;
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
