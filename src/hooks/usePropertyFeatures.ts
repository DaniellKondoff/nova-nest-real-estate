"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export interface PropertyFeature {
  id: number;
  name_bg: string;
  name_en: string | null;
  category: 'interior' | 'exterior' | 'building' | 'location' | 'buildingType';
}

// Module-level singleton: the Promise is shared across all hook instances in the browser session.
// Cleared on error so the next mount can retry.
let featuresCache: Promise<PropertyFeature[]> | null = null;

function fetchFeaturesOnce(): Promise<PropertyFeature[]> {
  if (!featuresCache) {
    const supabase = getBrowserClient();
    featuresCache = (async () => {
      const { data, error } = await supabase
        .from('property_features')
        .select('id, name_bg, name_en, category')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('name_bg', { ascending: true });
      if (error) {
        featuresCache = null;
        throw error;
      }
      return data || [];
    })();
  }
  return featuresCache;
}

export function usePropertyFeatures() {
  const [features, setFeatures] = useState<PropertyFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFeaturesOnce()
      .then((data) => {
        if (!cancelled) {
          setFeatures(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error fetching property features:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch features');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { features, loading, error };
}
