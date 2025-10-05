"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export interface PropertyFeature {
  id: number;
  name_bg: string;
  name_en: string | null;
  category: 'interior' | 'exterior' | 'building' | 'location' | 'buildingType';
}

export function usePropertyFeatures() {
  const [features, setFeatures] = useState<PropertyFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeatures() {
      try {
        setLoading(true);
        const supabase = getBrowserClient();
        
        const { data, error } = await supabase
          .from('property_features')
          .select('id, name_bg, name_en, category')
          .eq('is_active', true)
          .order('category', { ascending: true })
          .order('sort_order', { ascending: true })
          .order('name_bg', { ascending: true });

        if (error) {
          throw error;
        }

        setFeatures(data || []);
      } catch (err) {
        console.error('Error fetching property features:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch features');
      } finally {
        setLoading(false);
      }
    }

    fetchFeatures();
  }, []);

  return { features, loading, error };
}
