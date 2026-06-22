"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export interface PropertyCategory {
  id: number;
  name_bg: string;
  name_en: string | null;
  slug: string;
  description_bg: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

// Module-level singleton: shared across all hook instances in the browser session.
let categoriesCache: Promise<PropertyCategory[]> | null = null;

function fetchCategoriesOnce(): Promise<PropertyCategory[]> {
  if (!categoriesCache) {
    const supabase = getBrowserClient();
    categoriesCache = (async () => {
      const { data, error } = await supabase
        .from('property_categories')
        .select('id, name_bg, name_en, slug, description_bg, icon, sort_order, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name_bg', { ascending: true });
      if (error) {
        categoriesCache = null;
        throw error;
      }
      return data || [];
    })();
  }
  return categoriesCache;
}

export function usePropertyCategories() {
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCategoriesOnce()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error fetching property categories:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
}
