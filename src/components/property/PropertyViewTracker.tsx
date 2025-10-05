"use client";

import { usePropertyViewTracking } from "@/hooks/usePropertyViewTracking";

interface PropertyViewTrackerProps {
  propertyId: number;
  enabled?: boolean;
}

/**
 * Client component to track property views
 * This component doesn't render anything, it just tracks views
 */
export default function PropertyViewTracker({ 
  propertyId, 
  enabled = true 
}: PropertyViewTrackerProps) {
  usePropertyViewTracking({ 
    propertyId, 
    enabled 
  });

  // This component doesn't render anything
  return null;
}
