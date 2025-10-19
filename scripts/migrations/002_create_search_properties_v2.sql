-- Migration: Create search_properties_v2 function
-- Nova Nest Real Estate - Fix RPC Function Overloading Error
-- 
-- This migration:
-- 1. Creates a new search function with unambiguous parameter names
-- 2. Resolves PGRST203 error caused by multiple conflicting versions
-- 3. Maintains backwards compatibility (old functions remain intact)
-- 4. Uses p_ prefix for parameters to prevent column name conflicts
--
-- Run with: Execute via Supabase Dashboard SQL Editor

BEGIN;

-- ============================================================================
-- Create new search function with clear, unambiguous signature
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_properties_v2(
  p_search_term TEXT DEFAULT NULL,
  p_language_code TEXT DEFAULT 'bg',
  p_category_id BIGINT DEFAULT NULL,
  p_neighborhood_id BIGINT DEFAULT NULL,
  p_operation_type TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_min_area INTEGER DEFAULT NULL,
  p_max_area INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  title_bg TEXT,
  price_eur NUMERIC,
  rank REAL
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title_bg,
    p.price_eur,
    CASE 
      WHEN p_search_term IS NULL THEN 0.0
      ELSE ts_rank(
        to_tsvector(
          (CASE p_language_code 
            WHEN 'en' THEN 'english' 
            ELSE 'simple' 
          END)::regconfig,
          COALESCE(
            CASE p_language_code 
              WHEN 'en' THEN p.title_en 
              ELSE p.title_bg 
            END, 
            ''
          ) || ' ' || 
          COALESCE(
            CASE p_language_code 
              WHEN 'en' THEN p.description_en 
              ELSE p.description_bg 
            END, 
            ''
          )
        ),
        plainto_tsquery(
          (CASE p_language_code 
            WHEN 'en' THEN 'english' 
            ELSE 'simple' 
          END)::regconfig,
          p_search_term
        )
      )
    END::REAL as rank
  FROM properties p
  WHERE p.status = 'available'
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_neighborhood_id IS NULL OR p.neighborhood_id = p_neighborhood_id)
    AND (p_operation_type IS NULL OR p.operation_type::TEXT = p_operation_type)
    AND (p_min_price IS NULL OR p.price_eur >= p_min_price)
    AND (p_max_price IS NULL OR p.price_eur <= p_max_price)
    AND (p_min_area IS NULL OR p.area_sqm >= p_min_area)
    AND (p_max_area IS NULL OR p.area_sqm <= p_max_area)
    AND (
      p_search_term IS NULL 
      OR to_tsvector(
        (CASE p_language_code 
          WHEN 'en' THEN 'english' 
          ELSE 'simple' 
        END)::regconfig,
        COALESCE(
          CASE p_language_code 
            WHEN 'en' THEN p.title_en 
            ELSE p.title_bg 
          END, 
          ''
        ) || ' ' || 
        COALESCE(
          CASE p_language_code 
            WHEN 'en' THEN p.description_en 
            ELSE p.description_bg 
          END, 
          ''
        )
      ) @@ plainto_tsquery(
        (CASE p_language_code 
          WHEN 'en' THEN 'english' 
          ELSE 'simple' 
        END)::regconfig,
        p_search_term
      )
    )
  ORDER BY rank DESC, p.created_at DESC;
END;
$$;

-- Add descriptive comment
COMMENT ON FUNCTION public.search_properties_v2 IS 
'V2 search function with unambiguous parameter names (p_ prefix). Supports full-text search in Bulgarian (using simple config) and English with filters for category, neighborhood, operation type, price range, and area range. Replaces search_properties_combined to fix PGRST203 overloading error. Returns properties with relevance rank.';

-- ============================================================================
-- Optional: Mark old function as deprecated (but don't drop it)
-- ============================================================================

COMMENT ON FUNCTION public.search_properties_combined IS 
'DEPRECATED: Use search_properties_v2 instead. This function has parameter overloading conflicts causing PGRST203 errors.';

COMMIT;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Test the new function (run separately after migration):
--
-- SELECT * FROM search_properties_v2(
--   p_search_term := 'апартамент',
--   p_language_code := 'bg',
--   p_category_id := NULL,
--   p_neighborhood_id := NULL,
--   p_operation_type := NULL,
--   p_min_price := NULL,
--   p_max_price := NULL,
--   p_min_area := NULL,
--   p_max_area := NULL
-- ) LIMIT 5;

