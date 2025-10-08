-- Migration: Add SEO-friendly slugs to properties table
-- Nova Nest Real Estate - SEO URL Optimization
-- 
-- This migration:
-- 1. Adds slug column to properties table
-- 2. Creates indexes for performance
-- 3. Creates function to generate slugs from database data
-- 4. Creates trigger to auto-generate slugs
-- 5. Populates existing properties with slugs
--
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/001_add_property_slugs.sql

BEGIN;

-- ============================================================================
-- 1. Add slug column to properties table
-- ============================================================================

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS slug TEXT;

COMMENT ON COLUMN properties.slug IS 'SEO-friendly URL slug (e.g., apartamenti-3-stai-centur). Auto-generated from category, rooms, and neighborhood.';

-- ============================================================================
-- 2. Create indexes for performance
-- ============================================================================

-- Index for slug lookups (important for URL routing)
CREATE INDEX IF NOT EXISTS idx_properties_slug 
ON properties(slug);

-- Unique constraint: slugs must be unique when not null
-- This prevents duplicate URLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug_unique 
ON properties(slug) 
WHERE slug IS NOT NULL;

-- ============================================================================
-- 3. Create slug generation function
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_property_slug(
  p_category_id INTEGER,
  p_rooms INTEGER,
  p_neighborhood_id INTEGER
) RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_category_slug TEXT;
  v_neighborhood_slug TEXT;
  v_rooms_part TEXT := '';
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
  -- Format: {category}-{rooms}-stai-{neighborhood}
  IF p_rooms IS NOT NULL AND p_rooms > 0 THEN
    v_rooms_part := '-' || p_rooms::TEXT || '-stai';
  END IF;
  
  -- Combine parts: category + rooms + neighborhood
  v_slug := v_category_slug || v_rooms_part || '-' || v_neighborhood_slug;
  
  -- Clean up: remove multiple consecutive hyphens
  v_slug := REGEXP_REPLACE(v_slug, '-+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  v_slug := TRIM(BOTH '-' FROM v_slug);
  
  -- Convert to lowercase (safety measure)
  v_slug := LOWER(v_slug);
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION generate_property_slug(INTEGER, INTEGER, INTEGER) IS 
'Generates SEO-friendly slug from property category, rooms, and neighborhood. Uses actual slugs from database tables.';

-- ============================================================================
-- 4. Create trigger for automatic slug generation
-- ============================================================================

CREATE OR REPLACE FUNCTION set_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is not manually set
  -- This allows manual override if needed
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_property_slug(
      NEW.category_id,
      NEW.rooms,
      NEW.neighborhood_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_property_slug ON properties;

-- Create trigger that fires before insert or update
CREATE TRIGGER trigger_set_property_slug
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_property_slug();

COMMENT ON TRIGGER trigger_set_property_slug ON properties IS 
'Automatically generates SEO slug for properties based on category, rooms, and neighborhood.';

-- ============================================================================
-- 5. Populate existing properties with slugs
-- ============================================================================

-- Update all existing properties that don't have slugs
UPDATE properties
SET slug = generate_property_slug(
  category_id,
  rooms,
  neighborhood_id
)
WHERE slug IS NULL OR slug = '';

-- ============================================================================
-- 6. Verification and reporting
-- ============================================================================

-- Count properties with and without slugs
DO $$
DECLARE
  total_properties INTEGER;
  properties_with_slug INTEGER;
  properties_without_slug INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_properties FROM properties;
  SELECT COUNT(*) INTO properties_with_slug FROM properties WHERE slug IS NOT NULL AND slug != '';
  SELECT COUNT(*) INTO properties_without_slug FROM properties WHERE slug IS NULL OR slug = '';
  
  RAISE NOTICE '=== Property Slug Migration Results ===';
  RAISE NOTICE 'Total properties: %', total_properties;
  RAISE NOTICE 'Properties with slug: %', properties_with_slug;
  RAISE NOTICE 'Properties without slug: %', properties_without_slug;
  RAISE NOTICE '=======================================';
END $$;

-- Display sample of generated slugs
SELECT 
  p.id,
  p.title_bg,
  pc.name_bg as category,
  pc.slug as category_slug,
  p.rooms,
  n.name_bg as neighborhood,
  n.slug as neighborhood_slug,
  p.slug as generated_slug
FROM properties p
LEFT JOIN property_categories pc ON p.category_id = pc.id
LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
ORDER BY p.id
LIMIT 20;

COMMIT;

-- ============================================================================
-- Rollback script (if needed)
-- ============================================================================
-- To rollback this migration, run:
--
-- BEGIN;
-- DROP TRIGGER IF EXISTS trigger_set_property_slug ON properties;
-- DROP FUNCTION IF EXISTS set_property_slug();
-- DROP FUNCTION IF EXISTS generate_property_slug(INTEGER, INTEGER, INTEGER);
-- DROP INDEX IF EXISTS idx_properties_slug_unique;
-- DROP INDEX IF EXISTS idx_properties_slug;
-- ALTER TABLE properties DROP COLUMN IF EXISTS slug;
-- COMMIT;

