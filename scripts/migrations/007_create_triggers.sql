-- ============================================================================
-- Migration: Create Database Triggers
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration creates all database triggers for automatic data management:
-- - Updated_at timestamp triggers
-- - Property slug generation triggers
-- - Search vector update triggers
-- - Primary image enforcement triggers
-- - Testimonial auto-approval triggers
-- 
-- Run AFTER: 006_create_business_functions.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/007_create_triggers.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Admin Profiles - Updated_At Triggers
-- ============================================================================

DROP TRIGGER IF EXISTS set_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER set_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 2. Properties - Multiple Triggers
-- ============================================================================

-- Property Slug Generation Trigger
DROP TRIGGER IF EXISTS trigger_set_property_slug ON public.properties;
CREATE TRIGGER trigger_set_property_slug
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION set_property_slug();

COMMENT ON TRIGGER trigger_set_property_slug ON public.properties IS 
'Automatically generates SEO slug for properties based on category, rooms, and neighborhood';

-- Search Vector Update Trigger
DROP TRIGGER IF EXISTS update_properties_search_vector ON public.properties;
CREATE TRIGGER update_properties_search_vector
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_property_search_vector();

COMMENT ON TRIGGER update_properties_search_vector ON public.properties IS 
'Automatically updates full-text search vector for Bulgarian text search';

-- Updated_At Timestamp Trigger
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 3. Property Images - Primary Image Enforcement
-- ============================================================================

DROP TRIGGER IF EXISTS ensure_single_primary_image_trigger ON public.property_images;
CREATE TRIGGER ensure_single_primary_image_trigger
  AFTER INSERT OR UPDATE ON public.property_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_image();

COMMENT ON TRIGGER ensure_single_primary_image_trigger ON public.property_images IS 
'Ensures only one image per property is marked as primary';

-- ============================================================================
-- 4. Inquiries - Updated_At Triggers
-- ============================================================================

DROP TRIGGER IF EXISTS set_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER set_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_inquiries();

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 5. Testimonials - Multiple Triggers
-- ============================================================================

-- Auto-Approve High-Rated Testimonials
DROP TRIGGER IF EXISTS auto_approve_high_rated_testimonials ON public.testimonials;
CREATE TRIGGER auto_approve_high_rated_testimonials
  AFTER INSERT ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_testimonial_trigger();

COMMENT ON TRIGGER auto_approve_high_rated_testimonials ON public.testimonials IS 
'Automatically approves testimonials with rating >= 4 stars';

-- Updated_At Timestamp Triggers
DROP TRIGGER IF EXISTS set_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER set_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_testimonials();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 6. SEO Pages - Updated_At Triggers
-- ============================================================================

DROP TRIGGER IF EXISTS set_seo_pages_updated_at ON public.seo_pages;
CREATE TRIGGER set_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_seo_pages();

DROP TRIGGER IF EXISTS update_seo_pages_updated_at ON public.seo_pages;
CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMIT;

-- ============================================================================
-- Verification: List All Triggers
-- ============================================================================

SELECT
  trigger_schema,
  trigger_name,
  event_object_table AS table_name,
  event_manipulation AS event,
  action_timing AS timing,
  action_statement AS action
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;








