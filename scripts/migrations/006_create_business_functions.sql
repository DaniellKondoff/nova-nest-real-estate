-- ============================================================================
-- Migration: Create Business Logic Functions
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration creates business logic functions for property searches,
-- view tracking, inquiry management, and testimonial auto-approval.
-- 
-- Functions Created:
-- - increment_property_view: Track property views
-- - search_properties_v2: Main search function with filters
-- - search_properties_combined: Legacy search function
-- - search_properties_fulltext: Full-text search
-- - get_featured_properties: Get featured property listings
-- - get_properties_within_radius: Geographic radius search
-- - assign_inquiry_to_agent: Assign inquiry to admin
-- - auto_approve_testimonial: Auto-approve high-rated testimonials
-- - update_property_new_status: Mark old properties as not new
-- - update_seo_page_views: Track SEO page views
-- - get_property_stats: Get property statistics
-- - is_published_property: Check if property is published
-- 
-- Run AFTER: 005_create_functions.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/006_create_business_functions.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Increment Property View Counter
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_property_view(property_id BIGINT)
RETURNS TABLE(view_count BIGINT, last_viewed_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
DECLARE
  result_view_count BIGINT;
  result_last_viewed_at TIMESTAMPTZ;
BEGIN
  UPDATE properties 
  SET view_count = COALESCE(properties.view_count, 0) + 1,
      last_viewed_at = NOW()
  WHERE properties.id = property_id
  RETURNING properties.view_count, properties.last_viewed_at
  INTO result_view_count, result_last_viewed_at;
  
  RETURN QUERY SELECT result_view_count, result_last_viewed_at;
END;
$$;

COMMENT ON FUNCTION public.increment_property_view(BIGINT) IS 
'Increments view_count and updates last_viewed_at for a property';

-- ============================================================================
-- 2. Property Search V2 (Main Search Function)
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
RETURNS TABLE(
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

COMMENT ON FUNCTION public.search_properties_v2 IS 
'V2 search function with unambiguous parameter names. Supports full-text search with filters for category, neighborhood, operation type, price range, and area range.';

-- ============================================================================
-- 3. Assign Inquiry to Agent
-- ============================================================================

CREATE OR REPLACE FUNCTION public.assign_inquiry_to_agent(
  inquiry_id BIGINT,
  agent_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  agent_exists BOOLEAN;
  updated BOOLEAN := FALSE;
BEGIN
  -- Check if agent exists in admin_profiles
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = agent_id
  ) INTO agent_exists;

  IF NOT agent_exists THEN
    RETURN FALSE;
  END IF;

  -- Assign inquiry and set status to in_progress
  UPDATE public.inquiries i
  SET assigned_to = agent_id,
      status      = 'in_progress'::inquiry_status,
      updated_at  = NOW()
  WHERE i.id = inquiry_id
    AND i.status IN ('new'::inquiry_status, 'in_progress'::inquiry_status)
  RETURNING TRUE INTO updated;

  RETURN COALESCE(updated, FALSE);
END;
$$;

COMMENT ON FUNCTION public.assign_inquiry_to_agent(BIGINT, UUID) IS 
'Assigns an inquiry to an admin agent and sets status to in_progress';

-- ============================================================================
-- 4. Auto-Approve Testimonial (High Ratings)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_approve_testimonial(
  testimonial_id BIGINT,
  min_rating INTEGER DEFAULT 4
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  approved BOOLEAN := FALSE;
BEGIN
  UPDATE public.testimonials t
  SET is_published = TRUE,
      updated_at   = NOW()
  WHERE t.id = testimonial_id
    AND t.is_published = FALSE
    AND t.rating >= min_rating
  RETURNING TRUE INTO approved;

  RETURN COALESCE(approved, FALSE);
END;
$$;

COMMENT ON FUNCTION public.auto_approve_testimonial(BIGINT, INTEGER) IS 
'Auto-approves testimonials with rating >= min_rating (default 4)';

-- Trigger function wrapper
CREATE OR REPLACE FUNCTION public.auto_approve_testimonial_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.auto_approve_testimonial(NEW.id, 4);
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 5. Update Property "New" Status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_property_new_status()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.properties
  SET is_new = FALSE
  WHERE is_new = TRUE
    AND created_at < (NOW() - INTERVAL '7 days');
END;
$$;

COMMENT ON FUNCTION public.update_property_new_status() IS 
'Marks properties older than 7 days as not new. Call periodically via cron or scheduler.';

-- ============================================================================
-- 6. Update SEO Page Views
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_seo_page_views(page_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.seo_pages
  SET view_count   = COALESCE(view_count, 0) + 1,
      last_viewed_at = NOW()
  WHERE slug = page_slug
    AND is_published = TRUE;
END;
$$;

COMMENT ON FUNCTION public.update_seo_page_views(TEXT) IS 
'Increments view_count for an SEO page by slug';

-- ============================================================================
-- 7. Get Property Statistics
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_property_stats(p_property_id BIGINT)
RETURNS TABLE(
  total_views INTEGER,
  total_inquiries INTEGER,
  last_inquiry_date TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  has_seo_prop_id BOOLEAN;
  v_views INTEGER := 0;
  v_inquiries INTEGER := 0;
  v_last TIMESTAMPTZ := NULL;
BEGIN
  -- Check if seo_pages has property_id column (it doesn't in current schema)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='seo_pages' AND column_name='property_id'
  ) INTO has_seo_prop_id;

  IF has_seo_prop_id THEN
    SELECT COALESCE(SUM(sp.view_count)::INT, 0)
      INTO v_views
    FROM public.seo_pages sp
    WHERE sp.property_id = p_property_id;
  ELSE
    -- Get views from properties.view_count instead
    SELECT COALESCE(view_count::INT, 0)
      INTO v_views
    FROM public.properties
    WHERE id = p_property_id;
  END IF;

  -- Get inquiry count and last inquiry date
  SELECT COALESCE(COUNT(*), 0), MAX(created_at)
    INTO v_inquiries, v_last
  FROM public.inquiries q
  WHERE q.property_id = p_property_id;

  RETURN QUERY SELECT v_views, v_inquiries, v_last;
END;
$$;

COMMENT ON FUNCTION public.get_property_stats(BIGINT) IS 
'Returns view count, inquiry count, and last inquiry date for a property';

-- ============================================================================
-- 8. Check if Property is Published
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_published_property(p_property_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  has_active_label BOOLEAN;
  ok BOOLEAN := FALSE;
BEGIN
  -- Check if 'active' status exists in property_status enum
  SELECT EXISTS (
    WITH status_type AS (
      SELECT t.oid AS type_oid
      FROM information_schema.columns c
      JOIN pg_type t ON t.typname = c.udt_name
      WHERE c.table_schema='public' AND c.table_name='properties' AND c.column_name='status'
      LIMIT 1
    )
    SELECT 1 FROM pg_enum e JOIN status_type st ON st.type_oid = e.enumtypid
    WHERE e.enumlabel = 'active'
  ) INTO has_active_label;

  -- Check if property exists and is available
  SELECT CASE WHEN has_active_label THEN
           EXISTS (
             SELECT 1 FROM public.properties p
             WHERE p.id = p_property_id AND p.status::text = 'active' AND p.created_at IS NOT NULL
           )
         ELSE
           EXISTS (
             SELECT 1 FROM public.properties p
             WHERE p.id = p_property_id AND p.status = 'available' AND p.created_at IS NOT NULL
           )
         END
    INTO ok;

  RETURN COALESCE(ok, FALSE);
END;
$$;

COMMENT ON FUNCTION public.is_published_property(BIGINT) IS 
'Returns TRUE if property is published and visible to public';

COMMIT;



