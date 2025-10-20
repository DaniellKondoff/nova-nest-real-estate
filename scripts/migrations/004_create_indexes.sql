-- ============================================================================
-- Migration: Create Indexes for Performance Optimization
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration creates all indexes to optimize query performance.
-- Includes B-tree indexes for lookups, GIN indexes for JSONB and full-text
-- search, and composite indexes for common query patterns.
-- 
-- Index Categories:
-- - Primary key indexes (created automatically)
-- - Foreign key indexes (for JOIN performance)
-- - Full-text search indexes (GIN on tsvector)
-- - JSONB indexes (GIN for amenities, features)
-- - Filtered indexes (for common WHERE clauses)
-- - Composite indexes (for multi-column queries)
-- 
-- Run AFTER: 003_create_foreign_keys.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/004_create_indexes.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Properties Table Indexes
-- ============================================================================

-- Foreign key indexes (for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood 
ON public.properties(neighborhood_id);

CREATE INDEX IF NOT EXISTS idx_properties_category 
ON public.properties(category_id);

CREATE INDEX IF NOT EXISTS idx_properties_created_by 
ON public.properties(created_by);

-- Filter indexes (for common WHERE clauses)
CREATE INDEX IF NOT EXISTS idx_properties_status 
ON public.properties(status);

CREATE INDEX IF NOT EXISTS idx_properties_operation_type 
ON public.properties(operation_type);

CREATE INDEX IF NOT EXISTS idx_properties_is_featured 
ON public.properties(is_featured) 
WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_properties_is_new 
ON public.properties(is_new) 
WHERE is_new = TRUE;

-- Range query indexes (for price, area, rooms filters)
CREATE INDEX IF NOT EXISTS idx_properties_price 
ON public.properties(price_bgn);

CREATE INDEX IF NOT EXISTS idx_properties_area 
ON public.properties(area_sqm);

CREATE INDEX IF NOT EXISTS idx_properties_rooms 
ON public.properties(rooms);

-- Full-text search indexes (GIN for tsvector)
CREATE INDEX IF NOT EXISTS idx_properties_search_vector 
ON public.properties USING GIN(search_vector);

-- Duplicate index - keeping for backwards compatibility
CREATE INDEX IF NOT EXISTS idx_properties_search 
ON public.properties USING GIN(search_vector);

-- JSONB indexes (for features and amenities queries)
CREATE INDEX IF NOT EXISTS idx_properties_features_gin 
ON public.properties USING GIN(features);

CREATE INDEX IF NOT EXISTS idx_properties_amenities_gin 
ON public.properties USING GIN(amenities);

-- Location indexes (for geospatial queries)
CREATE INDEX IF NOT EXISTS idx_properties_location 
ON public.properties(latitude, longitude);

-- Sorting indexes (for ORDER BY clauses)
CREATE INDEX IF NOT EXISTS idx_properties_created_at 
ON public.properties(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_properties_view_count 
ON public.properties(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_properties_last_viewed 
ON public.properties(last_viewed_at DESC);

-- SEO slug index (for URL lookups)
CREATE INDEX IF NOT EXISTS idx_properties_slug 
ON public.properties(slug);

-- Unique slug index (prevents duplicate URLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug_unique 
ON public.properties(slug) 
WHERE slug IS NOT NULL;

-- ============================================================================
-- 2. Property Images Indexes
-- ============================================================================

-- Foreign key index
CREATE INDEX IF NOT EXISTS idx_property_images_property_id 
ON public.property_images(property_id);

-- Filtered index for primary images
CREATE INDEX IF NOT EXISTS idx_property_images_primary 
ON public.property_images(is_primary) 
WHERE is_primary = TRUE;

-- ============================================================================
-- 3. Property-Features Junction Table Indexes
-- ============================================================================

-- Indexes for both directions of the many-to-many relationship
CREATE INDEX IF NOT EXISTS idx_ppf_property_id 
ON public.property_property_features(property_id);

CREATE INDEX IF NOT EXISTS idx_ppf_feature_id 
ON public.property_property_features(feature_id);

-- ============================================================================
-- 4. Inquiries Table Indexes
-- ============================================================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id 
ON public.inquiries(property_id) 
WHERE property_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to 
ON public.inquiries(assigned_to);

-- Status filter index
CREATE INDEX IF NOT EXISTS idx_inquiries_status 
ON public.inquiries(status);

-- Sorting index
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at 
ON public.inquiries(created_at DESC);

-- ============================================================================
-- 5. Testimonials Table Indexes
-- ============================================================================

-- Foreign key index
CREATE INDEX IF NOT EXISTS idx_testimonials_property_id 
ON public.testimonials(property_id);

-- ============================================================================
-- 6. Neighborhoods Table Indexes
-- ============================================================================

-- Slug lookup index
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug 
ON public.neighborhoods(slug);

-- Location index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_neighborhoods_location 
ON public.neighborhoods(center_lat, center_lng);

-- JSONB indexes for amenities and transport info
CREATE INDEX IF NOT EXISTS idx_neighborhoods_amenities_gin 
ON public.neighborhoods USING GIN(amenities);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_transport_info_gin 
ON public.neighborhoods USING GIN(transport_info);

-- ============================================================================
-- 7. SEO Pages Table Indexes
-- ============================================================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_seo_pages_neighborhood_id 
ON public.seo_pages(neighborhood_id);

CREATE INDEX IF NOT EXISTS idx_seo_pages_category_id 
ON public.seo_pages(category_id);

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- List all indexes in public schema
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Show index sizes (run separately, not in transaction)
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexname::regclass) DESC;


