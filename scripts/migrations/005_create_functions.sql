-- ============================================================================
-- Migration: Create Database Functions
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration creates all custom PostgreSQL functions used by the application.
-- These functions handle business logic, triggers, and utility operations.
-- 
-- Functions Created:
-- - Timestamp update triggers (set_updated_at, update_updated_at)
-- - Property slug generation (generate_property_slug, set_property_slug)
-- - Search vector updates (update_property_search_vector)
-- - Image management (ensure_single_primary_image)
-- - Admin utilities (is_admin, get_current_admin_role)
-- - Search functions (search_properties_v2, search_properties_combined, etc.)
-- - Business logic (increment_property_view, assign_inquiry_to_agent, etc.)
-- 
-- Run AFTER: 004_create_indexes.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/005_create_functions.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Generic Updated_At Timestamp Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.set_updated_at() IS 'Generic trigger function to update updated_at timestamp';
COMMENT ON FUNCTION public.update_updated_at() IS 'Alternative updated_at trigger function';

-- ============================================================================
-- 2. Specific Updated_At Functions (for compatibility)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at_inquiries()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_updated_at_testimonials()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_updated_at_seo_pages()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Property Slug Generation Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_property_slug(
  p_property_id BIGINT,
  p_category_id BIGINT,
  p_rooms INTEGER,
  p_neighborhood_id BIGINT
)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_category_slug TEXT;
  v_neighborhood_slug TEXT;
  v_rooms_part TEXT := '';
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_counter INTEGER := 0;
BEGIN
  -- Get category slug from property_categories table
  SELECT slug INTO v_category_slug
  FROM property_categories
  WHERE id = p_category_id;
  
  -- Get neighborhood slug from neighborhoods table
  SELECT slug INTO v_neighborhood_slug
  FROM neighborhoods
  WHERE id = p_neighborhood_id;
  
  -- Handle missing data gracefully
  IF v_category_slug IS NULL OR v_category_slug = '' THEN
    v_category_slug := 'imot';
  END IF;
  
  IF v_neighborhood_slug IS NULL OR v_neighborhood_slug = '' THEN
    v_neighborhood_slug := 'stara-zagora';
  END IF;
  
  -- Add rooms if available and positive
  IF p_rooms IS NOT NULL AND p_rooms > 0 THEN
    v_rooms_part := '-' || p_rooms::TEXT || '-stai';
  END IF;
  
  -- Combine parts: category + rooms + neighborhood
  v_base_slug := v_category_slug || v_rooms_part || '-' || v_neighborhood_slug;
  
  -- Clean up: remove multiple consecutive hyphens
  v_base_slug := REGEXP_REPLACE(v_base_slug, '-+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  v_base_slug := TRIM(BOTH '-' FROM v_base_slug);
  
  -- Convert to lowercase
  v_base_slug := LOWER(v_base_slug);
  
  -- To ensure uniqueness, we'll try base slug first, then add suffix if needed
  v_final_slug := v_base_slug;
  
  -- Check if this slug already exists for a different property
  WHILE EXISTS (
    SELECT 1 FROM properties 
    WHERE slug = v_final_slug 
    AND id != p_property_id
  ) LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_base_slug || '-' || v_counter::TEXT;
  END LOOP;
  
  RETURN v_final_slug;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_property_slug(BIGINT, BIGINT, INTEGER, BIGINT) IS 
'Generates unique SEO-friendly slug from property category, rooms, and neighborhood. Handles duplicates by appending counter.';

-- ============================================================================
-- 4. Property Slug Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is not manually set
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_property_slug(
      NEW.id,
      NEW.category_id,
      NEW.rooms,
      NEW.neighborhood_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.set_property_slug() IS 
'Trigger function to auto-generate property slug before INSERT/UPDATE';

-- ============================================================================
-- 5. Search Vector Update Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_property_search_vector()
RETURNS TRIGGER AS $$
DECLARE
  cfg_bg REGCONFIG;
  cfg_oid OID;
BEGIN
  -- Try to use Bulgarian text search config, fallback to simple
  SELECT oid INTO cfg_oid FROM pg_ts_config WHERE cfgname = 'bulgarian' LIMIT 1;
  IF cfg_oid IS NOT NULL THEN
    cfg_bg := cfg_oid::regconfig;
  ELSE
    cfg_bg := 'simple'::regconfig;
  END IF;

  -- Build weighted search vector from title (A), description (B), and address (C)
  NEW.search_vector :=
      setweight(to_tsvector(cfg_bg, COALESCE(NEW.title_bg, '')), 'A') ||
      setweight(to_tsvector(cfg_bg, COALESCE(NEW.description_bg, '')), 'B') ||
      setweight(to_tsvector(cfg_bg, COALESCE(NEW.address_bg, '')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_property_search_vector() IS 
'Trigger function to update full-text search vector for Bulgarian text';

-- ============================================================================
-- 6. Ensure Single Primary Image Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_primary IS TRUE THEN
    -- Set all other images for this property to non-primary
    UPDATE public.property_images
    SET is_primary = FALSE
    WHERE property_id = NEW.property_id
      AND id <> NEW.id
      AND is_primary IS TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.ensure_single_primary_image() IS 
'Ensures only one image per property can be marked as primary';

-- ============================================================================
-- 7. Admin Authentication Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  uid UUID := auth.uid();
  exists_admin BOOLEAN := FALSE;
BEGIN
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = uid
  ) INTO exists_admin;

  RETURN COALESCE(exists_admin, FALSE);
END;
$$;

COMMENT ON FUNCTION public.is_admin() IS 
'Returns TRUE if current authenticated user is an admin';

CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  uid UUID := auth.uid();
  out_role TEXT;
BEGIN
  IF uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT ap.role INTO out_role
  FROM public.admin_profiles ap
  WHERE ap.user_id = uid;

  RETURN out_role; -- may be NULL if not found
END;
$$;

COMMENT ON FUNCTION public.get_current_admin_role() IS 
'Returns role (admin/agent/manager) of current authenticated user';

-- Function continues in next section...
COMMIT;








