-- ============================================================================
-- Migration: Create Foreign Key Constraints
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration adds all foreign key constraints to establish relationships
-- between tables. Run this AFTER creating all base tables.
-- 
-- Foreign Keys Added:
-- - properties -> neighborhoods, property_categories, auth.users
-- - property_images -> properties
-- - property_property_features -> properties, property_features
-- - inquiries -> properties, auth.users
-- - testimonials -> properties
-- - seo_pages -> neighborhoods, property_categories
-- 
-- Run AFTER: 002_create_base_tables.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/003_create_foreign_keys.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Properties Table Foreign Keys
-- ============================================================================

-- Neighborhood reference (required)
ALTER TABLE public.properties
ADD CONSTRAINT properties_neighborhood_id_fkey
FOREIGN KEY (neighborhood_id)
REFERENCES public.neighborhoods(id)
ON DELETE RESTRICT;

-- Category reference (required)
ALTER TABLE public.properties
ADD CONSTRAINT properties_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.property_categories(id)
ON DELETE RESTRICT;

-- Created by admin user (required)
ALTER TABLE public.properties
ADD CONSTRAINT properties_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE RESTRICT;

COMMENT ON CONSTRAINT properties_neighborhood_id_fkey ON public.properties IS 'Links property to neighborhood';
COMMENT ON CONSTRAINT properties_category_id_fkey ON public.properties IS 'Links property to category (Apartment, House, etc.)';
COMMENT ON CONSTRAINT properties_created_by_fkey ON public.properties IS 'Tracks which admin user created the property';

-- ============================================================================
-- 2. Property Images Foreign Key
-- ============================================================================

ALTER TABLE public.property_images
ADD CONSTRAINT property_images_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE CASCADE;

COMMENT ON CONSTRAINT property_images_property_id_fkey ON public.property_images IS 'Cascades delete: removes images when property is deleted';

-- ============================================================================
-- 3. Property-Features Junction Table Foreign Keys
-- ============================================================================

-- Property reference
ALTER TABLE public.property_property_features
ADD CONSTRAINT property_property_features_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE CASCADE;

-- Feature reference
ALTER TABLE public.property_property_features
ADD CONSTRAINT property_property_features_feature_id_fkey
FOREIGN KEY (feature_id)
REFERENCES public.property_features(id)
ON DELETE CASCADE;

COMMENT ON CONSTRAINT property_property_features_property_id_fkey ON public.property_property_features IS 'Cascades delete: removes feature associations when property is deleted';
COMMENT ON CONSTRAINT property_property_features_feature_id_fkey ON public.property_property_features IS 'Cascades delete: removes associations when feature is deleted';

-- ============================================================================
-- 4. Inquiries Table Foreign Keys
-- ============================================================================

-- Property reference (optional - some inquiries are general)
ALTER TABLE public.inquiries
ADD CONSTRAINT inquiries_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE SET NULL;

-- Assigned to admin user (optional)
ALTER TABLE public.inquiries
ADD CONSTRAINT inquiries_assigned_to_fkey
FOREIGN KEY (assigned_to)
REFERENCES auth.users(id)
ON DELETE SET NULL;

COMMENT ON CONSTRAINT inquiries_property_id_fkey ON public.inquiries IS 'Optional property reference - set to NULL if property is deleted';
COMMENT ON CONSTRAINT inquiries_assigned_to_fkey ON public.inquiries IS 'Optional admin assignment - set to NULL if user is deleted';

-- ============================================================================
-- 5. Testimonials Table Foreign Key
-- ============================================================================

ALTER TABLE public.testimonials
ADD CONSTRAINT testimonials_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.properties(id)
ON DELETE SET NULL;

COMMENT ON CONSTRAINT testimonials_property_id_fkey ON public.testimonials IS 'Optional property reference - testimonial remains if property is deleted';

-- ============================================================================
-- 6. SEO Pages Table Foreign Keys
-- ============================================================================

-- Neighborhood reference (optional - only for neighborhood pages)
ALTER TABLE public.seo_pages
ADD CONSTRAINT seo_pages_neighborhood_id_fkey
FOREIGN KEY (neighborhood_id)
REFERENCES public.neighborhoods(id)
ON DELETE SET NULL;

-- Category reference (optional - only for category pages)
ALTER TABLE public.seo_pages
ADD CONSTRAINT seo_pages_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.property_categories(id)
ON DELETE SET NULL;

COMMENT ON CONSTRAINT seo_pages_neighborhood_id_fkey ON public.seo_pages IS 'Optional neighborhood reference for neighborhood SEO pages';
COMMENT ON CONSTRAINT seo_pages_category_id_fkey ON public.seo_pages IS 'Optional category reference for category SEO pages';

COMMIT;

-- Verification: List all foreign key constraints
SELECT
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;


