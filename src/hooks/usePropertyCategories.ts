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

export function usePropertyCategories() {
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const supabase = getBrowserClient();
        
        const { data, error } = await supabase
          .from('property_categories')
          .select('id, name_bg, name_en, slug, description_bg, icon, sort_order, is_active')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('name_bg', { ascending: true });

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching property categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
