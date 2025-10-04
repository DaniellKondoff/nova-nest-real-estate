"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export interface Neighborhood {
  id: number;
  name_bg: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  center_lat: number | null;
  center_lng: number | null;
  amenities: any | null;
  transport_info: any | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

export function useNeighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        setLoading(true);
        const supabase = getBrowserClient();
        
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('id, name_bg, name_en, slug, description, center_lat, center_lng, amenities, transport_info, seo_title, seo_description, seo_keywords')
          .order('name_bg', { ascending: true });

        if (error) {
          throw error;
        }

        setNeighborhoods(data || []);
      } catch (err) {
        console.error('Error fetching neighborhoods:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch neighborhoods');
      } finally {
        setLoading(false);
      }
    }

    fetchNeighborhoods();
  }, []);

  return { neighborhoods, loading, error };
}
