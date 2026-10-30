-- ============================================================================
-- Migration: Create search_properties_v3
-- Nova Nest Real Estate - search filters that match how Bulgarians search (AUDIT F-4, F-5)
-- ============================================================================
--
-- Adds a NEW function (additive only – safe on the shared prod DB):
--   * rooms multi-select (1, 2, 3, 4 = "4+")       – "едностаен / двустаен / тристаен / многостаен"
--   * min bedrooms, is_new, is_featured filters     – previously parsed by the app but ignored
--   * feature filter with ALL-of semantics          – previously "any of", filtered in JS
--
-- Does NOT alter tables and does NOT touch search_properties_v2 (still used by /api/search
-- and by deployed code). A new name is used on purpose: adding parameters to v2 would
-- create an overload and bring back the PGRST203 ambiguity error.
--
-- Run AFTER: 014_create_crm_tasks.sql
-- Run with: Supabase Dashboard SQL Editor
-- Rollback: DROP FUNCTION public.search_properties_v3(TEXT, TEXT, BIGINT, BIGINT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER, INT[], INT, BOOLEAN, BOOLEAN, BIGINT[]);
--           (the app falls back to direct queries automatically)
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.search_properties_v3(
  p_search_term TEXT DEFAULT NULL,
  p_language_code TEXT DEFAULT 'bg',
  p_category_id BIGINT DEFAULT NULL,
  p_neighborhood_id BIGINT DEFAULT NULL,
  p_operation_type TEXT DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_min_area INTEGER DEFAULT NULL,
  p_max_area INTEGER DEFAULT NULL,
  p_rooms INT[] DEFAULT NULL,
  p_min_bedrooms INT DEFAULT NULL,
  p_is_new BOOLEAN DEFAULT NULL,
  p_is_featured BOOLEAN DEFAULT NULL,
  p_feature_ids BIGINT[] DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  title_bg TEXT,
  price_eur NUMERIC,
  rank REAL
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_config regconfig := (CASE p_language_code WHEN 'en' THEN 'english' ELSE 'simple' END)::regconfig;
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
          v_config,
          COALESCE(CASE p_language_code WHEN 'en' THEN p.title_en ELSE p.title_bg END, '') || ' ' ||
          COALESCE(CASE p_language_code WHEN 'en' THEN p.description_en ELSE p.description_bg END, '')
        ),
        plainto_tsquery(v_config, p_search_term)
      )
    END::REAL AS rank
  FROM properties p
  WHERE p.status = 'available'
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_neighborhood_id IS NULL OR p.neighborhood_id = p_neighborhood_id)
    AND (p_operation_type IS NULL OR p.operation_type::TEXT = p_operation_type)
    AND (p_min_price IS NULL OR p.price_eur >= p_min_price)
    AND (p_max_price IS NULL OR p.price_eur <= p_max_price)
    AND (p_min_area IS NULL OR p.area_sqm >= p_min_area)
    AND (p_max_area IS NULL OR p.area_sqm <= p_max_area)
    -- Rooms: exact match per selected value; 4 means "4 or more"
    AND (
      p_rooms IS NULL OR cardinality(p_rooms) = 0
      OR p.rooms = ANY(p_rooms)
      OR (4 = ANY(p_rooms) AND p.rooms >= 4)
    )
    AND (p_min_bedrooms IS NULL OR p.bedrooms >= p_min_bedrooms)
    AND (p_is_featured IS NULL OR p.is_featured = p_is_featured)
    -- Same rule as the "Ново" badge on the cards: flagged new or listed within the last 7 days
    AND (p_is_new IS NULL OR (COALESCE(p.is_new, false) OR p.created_at >= now() - interval '7 days') = p_is_new)
    -- Features: the property must have ALL selected features
    AND (
      p_feature_ids IS NULL OR cardinality(p_feature_ids) = 0
      OR p.id IN (
        SELECT ppf.property_id
        FROM property_property_features ppf
        WHERE ppf.feature_id = ANY(p_feature_ids)
        GROUP BY ppf.property_id
        HAVING count(DISTINCT ppf.feature_id) = (SELECT count(DISTINCT f) FROM unnest(p_feature_ids) AS f)
      )
    )
    AND (
      p_search_term IS NULL
      OR to_tsvector(
        v_config,
        COALESCE(CASE p_language_code WHEN 'en' THEN p.title_en ELSE p.title_bg END, '') || ' ' ||
        COALESCE(CASE p_language_code WHEN 'en' THEN p.description_en ELSE p.description_bg END, '')
      ) @@ plainto_tsquery(v_config, p_search_term)
    )
  ORDER BY rank DESC, p.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.search_properties_v3 IS
'V3 property search: v2 filters plus rooms multi-select (4 = 4+), min bedrooms, is_new (flag or < 7 days), is_featured and ALL-of feature matching. Additive – v2 is unchanged.';

GRANT EXECUTE ON FUNCTION public.search_properties_v3(TEXT, TEXT, BIGINT, BIGINT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER, INT[], INT, BOOLEAN, BOOLEAN, BIGINT[])
  TO anon, authenticated;

COMMIT;

-- Make the new function callable through PostgREST right away
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Verification (run separately)
-- ============================================================================
-- Two-room apartments:
--   SELECT id, title_bg FROM search_properties_v3(p_rooms := ARRAY[2]);
-- 4+ rooms:
--   SELECT id, title_bg FROM search_properties_v3(p_rooms := ARRAY[4]);
-- Properties having BOTH features 1 and 2 (compare with each feature alone):
--   SELECT count(*) FROM search_properties_v3(p_feature_ids := ARRAY[1, 2]::BIGINT[]);
--   SELECT count(*) FROM search_properties_v3(p_feature_ids := ARRAY[1]::BIGINT[]);
