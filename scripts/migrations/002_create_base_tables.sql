-- ============================================================================
-- Migration: Create Base Tables
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration creates all base tables with their columns, data types,
-- defaults, and constraints. Foreign keys and indexes are added separately.
-- 
-- Tables created:
-- - admin_profiles: Admin user profile data
-- - property_categories: Property type categories (Apartment, House, etc.)
-- - property_features: Available property features
-- - neighborhoods: Neighborhood data for Stara Zagora
-- - properties: Main property listings table
-- - property_images: Property images with metadata
-- - property_property_features: Many-to-many relationship for property features
-- - inquiries: Customer inquiry submissions
-- - testimonials: Client testimonials and reviews
-- - seo_pages: SEO landing pages
-- 
-- Run AFTER: 001_create_enums.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/002_create_base_tables.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Admin Profiles Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'agent'::text, 'manager'::text])),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.admin_profiles IS 'Admin user profiles with role-based access control';
COMMENT ON COLUMN public.admin_profiles.user_id IS 'References auth.users.id from Supabase Auth';
COMMENT ON COLUMN public.admin_profiles.role IS 'User role: admin, agent, or manager';

-- ============================================================================
-- 2. Property Categories Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_categories (
  id BIGSERIAL PRIMARY KEY,
  name_bg TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_bg TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.property_categories IS 'Property type categories (Apartment, House, Office, etc.)';
COMMENT ON COLUMN public.property_categories.name_bg IS 'Category name in Bulgarian (primary language)';
COMMENT ON COLUMN public.property_categories.name_en IS 'Category name in English (optional)';
COMMENT ON COLUMN public.property_categories.slug IS 'URL-friendly slug for category';

-- Create unique index on name_bg (enforces uniqueness for Bulgarian names)
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_categories_name_bg_unique 
ON public.property_categories(name_bg);

-- ============================================================================
-- 3. Property Features Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_features (
  id BIGSERIAL PRIMARY KEY,
  name_bg TEXT NOT NULL UNIQUE,
  name_en TEXT,
  category public.property_feature_category NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.property_features IS 'Available property features (Elevator, Parking, Balcony, etc.)';
COMMENT ON COLUMN public.property_features.name_bg IS 'Feature name in Bulgarian';
COMMENT ON COLUMN public.property_features.category IS 'Feature category: interior, exterior, building, location, buildingType';

-- ============================================================================
-- 4. Neighborhoods Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.neighborhoods (
  id BIGSERIAL PRIMARY KEY,
  name_bg TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  amenities JSONB,
  transport_info JSONB,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT
);

COMMENT ON TABLE public.neighborhoods IS 'Neighborhoods in Stara Zagora city';
COMMENT ON COLUMN public.neighborhoods.name_bg IS 'Neighborhood name in Bulgarian';
COMMENT ON COLUMN public.neighborhoods.center_lat IS 'Latitude of neighborhood center';
COMMENT ON COLUMN public.neighborhoods.center_lng IS 'Longitude of neighborhood center';
COMMENT ON COLUMN public.neighborhoods.amenities IS 'JSONB array of nearby amenities';
COMMENT ON COLUMN public.neighborhoods.transport_info IS 'JSONB object with transport information';

-- ============================================================================
-- 5. Properties Table (Main)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.properties (
  id BIGSERIAL PRIMARY KEY,
  title_bg TEXT NOT NULL,
  title_en TEXT,
  description_bg TEXT,
  description_en TEXT,
  address_bg TEXT,
  price_bgn NUMERIC(12, 2),
  price_eur NUMERIC(12, 2),
  operation_type public.property_operation_type NOT NULL,
  area_sqm NUMERIC(10, 2),
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  total_floors INTEGER CHECK (total_floors IS NULL OR (total_floors >= 1 AND total_floors <= 100)),
  year_built INTEGER,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  neighborhood_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  features JSONB,
  amenities JSONB,
  status public.property_status NOT NULL DEFAULT 'available'::property_status,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  og_image TEXT,
  slug TEXT,
  search_vector TSVECTOR,
  view_count BIGINT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.properties IS 'Main property listings table';
COMMENT ON COLUMN public.properties.title_bg IS 'Property title in Bulgarian (primary)';
COMMENT ON COLUMN public.properties.title_en IS 'Property title in English';
COMMENT ON COLUMN public.properties.operation_type IS 'Sale or rent';
COMMENT ON COLUMN public.properties.status IS 'Current listing status';
COMMENT ON COLUMN public.properties.slug IS 'SEO-friendly URL slug (e.g., apartamenti-3-stai-centur). Auto-generated from category, rooms, and neighborhood.';
COMMENT ON COLUMN public.properties.search_vector IS 'Full-text search vector for Bulgarian text search';
COMMENT ON COLUMN public.properties.view_count IS 'Number of times property detail page was viewed';
COMMENT ON COLUMN public.properties.last_viewed_at IS 'Timestamp of last property view';

-- ============================================================================
-- 6. Property Images Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_images (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL,
  filename TEXT,
  url TEXT NOT NULL,
  alt_text_bg TEXT,
  alt_text_en TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.property_images IS 'Property images with metadata';
COMMENT ON COLUMN public.property_images.property_id IS 'References properties.id';
COMMENT ON COLUMN public.property_images.url IS 'Full URL to image (Supabase Storage or CDN)';
COMMENT ON COLUMN public.property_images.is_primary IS 'Designates primary/featured image for property';
COMMENT ON COLUMN public.property_images.sort_order IS 'Display order of images in gallery';

-- ============================================================================
-- 7. Property-Feature Junction Table (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_property_features (
  property_id BIGINT NOT NULL,
  feature_id BIGINT NOT NULL,
  PRIMARY KEY (property_id, feature_id)
);

COMMENT ON TABLE public.property_property_features IS 'Many-to-many relationship between properties and features';

-- ============================================================================
-- 8. Inquiries Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inquiries (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type public.inquiry_type NOT NULL,
  property_id BIGINT,
  subject TEXT,
  message TEXT NOT NULL,
  budget_min NUMERIC(12, 2),
  budget_max NUMERIC(12, 2),
  preferred_neighborhoods UUID[],
  preferred_property_types UUID[],
  status public.inquiry_status NOT NULL DEFAULT 'new'::inquiry_status,
  assigned_to UUID,
  admin_notes TEXT,
  responded_at TIMESTAMPTZ,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.inquiries IS 'Customer inquiry submissions';
COMMENT ON COLUMN public.inquiries.inquiry_type IS 'Type of inquiry (general, property_interest, viewing_request, etc.)';
COMMENT ON COLUMN public.inquiries.property_id IS 'Optional reference to specific property';
COMMENT ON COLUMN public.inquiries.assigned_to IS 'Admin/agent assigned to handle inquiry';
COMMENT ON COLUMN public.inquiries.source IS 'Source of inquiry (website, phone, email, etc.)';

-- ============================================================================
-- 9. Testimonials Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_initial TEXT,
  client_role TEXT,
  content_bg TEXT NOT NULL,
  content_en TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  property_id BIGINT,
  service_type TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.testimonials IS 'Client testimonials and reviews';
COMMENT ON COLUMN public.testimonials.client_initial IS 'Client initial for display (e.g., "И.П.")';
COMMENT ON COLUMN public.testimonials.rating IS '1-5 star rating';
COMMENT ON COLUMN public.testimonials.property_id IS 'Optional reference to property reviewed';
COMMENT ON COLUMN public.testimonials.is_published IS 'Whether testimonial is visible to public';

-- ============================================================================
-- 10. SEO Pages Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.seo_pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_bg TEXT NOT NULL,
  title_en TEXT,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[],
  h1_bg TEXT NOT NULL,
  h1_en TEXT,
  content_bg TEXT,
  content_en TEXT,
  page_type public.seo_page_type NOT NULL,
  neighborhood_id BIGINT,
  category_id BIGINT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  canonical_url TEXT,
  view_count BIGINT NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.seo_pages IS 'SEO landing pages for neighborhoods, categories, and services';
COMMENT ON COLUMN public.seo_pages.page_type IS 'Type of SEO page: neighborhood, category, service, custom';
COMMENT ON COLUMN public.seo_pages.neighborhood_id IS 'Optional reference to neighborhood';
COMMENT ON COLUMN public.seo_pages.category_id IS 'Optional reference to property category';

COMMIT;

-- Verification: List created tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;


