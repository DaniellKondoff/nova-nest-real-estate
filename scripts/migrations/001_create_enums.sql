-- ============================================================================
-- Migration: Create Custom ENUM Types
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration creates all custom ENUM types used throughout the database.
-- Run this AFTER enabling extensions (000_enable_extensions.sql).
-- 
-- ENUMs defined:
-- - inquiry_status: Status tracking for customer inquiries
-- - inquiry_type: Type classification for inquiries
-- - property_feature_category: Categories for property features
-- - property_operation_type: Sale or rent designation
-- - property_status: Property listing status
-- - seo_page_type: SEO page type classification
-- 
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/001_create_enums.sql
-- Or via Supabase Dashboard SQL Editor
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Inquiry Status ENUM
-- ============================================================================

CREATE TYPE public.inquiry_status AS ENUM (
  'new',
  'in_progress',
  'responded',
  'closed'
);

COMMENT ON TYPE public.inquiry_status IS 'Status workflow for customer inquiries';

-- ============================================================================
-- 2. Inquiry Type ENUM
-- ============================================================================

CREATE TYPE public.inquiry_type AS ENUM (
  'general',
  'property_interest',
  'viewing_request',
  'valuation',
  'selling',
  'renting'
);

COMMENT ON TYPE public.inquiry_type IS 'Type classification for customer inquiries';

-- ============================================================================
-- 3. Property Feature Category ENUM
-- ============================================================================

CREATE TYPE public.property_feature_category AS ENUM (
  'interior',
  'exterior',
  'building',
  'location',
  'buildingType'
);

COMMENT ON TYPE public.property_feature_category IS 'Categories for organizing property features';

-- ============================================================================
-- 4. Property Operation Type ENUM
-- ============================================================================

CREATE TYPE public.property_operation_type AS ENUM (
  'sale',
  'rent'
);

COMMENT ON TYPE public.property_operation_type IS 'Designates whether property is for sale or rent';

-- ============================================================================
-- 5. Property Status ENUM
-- ============================================================================

CREATE TYPE public.property_status AS ENUM (
  'available',
  'under_offer',
  'sold',
  'rented',
  'archived'
);

COMMENT ON TYPE public.property_status IS 'Current listing status of property';

-- ============================================================================
-- 6. SEO Page Type ENUM
-- ============================================================================

CREATE TYPE public.seo_page_type AS ENUM (
  'neighborhood',
  'category',
  'service',
  'custom'
);

COMMENT ON TYPE public.seo_page_type IS 'Type classification for SEO landing pages';

COMMIT;

-- Verification: List all custom enum types
SELECT 
  n.nspname AS schema,
  t.typname AS enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE n.nspname = 'public'
GROUP BY n.nspname, t.typname
ORDER BY t.typname;


