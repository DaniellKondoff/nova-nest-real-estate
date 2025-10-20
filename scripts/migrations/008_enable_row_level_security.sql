-- ============================================================================
-- Migration: Enable Row Level Security (RLS) and Create Policies
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration enables RLS on all tables and creates security policies
-- to control data access based on authentication and admin status.
-- 
-- Security Model:
-- - Public users: READ access to published/available content only
-- - Authenticated admins: FULL access to all data
-- - Inquiry submissions: Anyone can INSERT
-- - Admin profiles: Admins can view, users can update own profile
-- 
-- Run AFTER: 007_create_triggers.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/008_enable_row_level_security.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Enable RLS on All Tables
-- ============================================================================

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Admin Profiles Policies
-- ============================================================================

-- Admins can view all admin profiles
CREATE POLICY admin_view_admin_profiles_on_admin_profiles
  ON public.admin_profiles
  FOR SELECT
  USING ((auth.role() = 'authenticated'::text) AND is_admin());

-- Users can update their own profile
CREATE POLICY admin_update_own_admin_profiles_on_admin_profiles
  ON public.admin_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. Property Categories Policies
-- ============================================================================

-- Public can read active categories
CREATE POLICY public_read_property_categories_on_property_categories
  ON public.property_categories
  FOR SELECT
  USING (is_active = TRUE);

-- Admins have full access
CREATE POLICY admin_manage_property_categories_on_property_categories
  ON public.property_categories
  FOR ALL
  USING (is_admin());

-- ============================================================================
-- 4. Property Features Policies
-- ============================================================================

-- Public can read active features
CREATE POLICY public_read_property_features_on_property_features
  ON public.property_features
  FOR SELECT
  USING (is_active = TRUE);

-- Admins have full access
CREATE POLICY admin_manage_property_features_on_property_features
  ON public.property_features
  FOR ALL
  USING (is_admin());

-- ============================================================================
-- 5. Neighborhoods Policies
-- ============================================================================

-- Public can read all neighborhoods
CREATE POLICY public_read_neighborhoods_on_neighborhoods
  ON public.neighborhoods
  FOR SELECT
  USING (TRUE);

-- Admins have full access
CREATE POLICY admin_manage_neighborhoods_on_neighborhoods
  ON public.neighborhoods
  FOR ALL
  USING (is_admin());

-- ============================================================================
-- 6. Properties Policies
-- ============================================================================

-- Public can read available/published properties
CREATE POLICY public_read_published_properties_on_properties
  ON public.properties
  FOR SELECT
  USING (status::text = 'available' AND TRUE);

-- Admins can view all properties
CREATE POLICY admin_select_properties_on_properties
  ON public.properties
  FOR SELECT
  USING (is_admin());

-- Admins can insert properties
CREATE POLICY admin_insert_properties_on_properties
  ON public.properties
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update properties
CREATE POLICY admin_update_properties_on_properties
  ON public.properties
  FOR UPDATE
  USING (is_admin());

-- Admins can delete properties
CREATE POLICY admin_delete_properties_on_properties
  ON public.properties
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- 7. Property Images Policies
-- ============================================================================

-- Public can read images for available properties
CREATE POLICY public_read_property_images_for_active_properties_on_property_i
  ON public.property_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM properties p
      WHERE p.id = property_images.property_id
        AND p.status::text = 'available'
        AND TRUE
    )
  );

-- Admins can view all images
CREATE POLICY admin_select_property_images_on_property_images
  ON public.property_images
  FOR SELECT
  USING (is_admin());

-- Admins have full access to images
CREATE POLICY admin_manage_property_images_on_property_images
  ON public.property_images
  FOR ALL
  USING (is_admin());

-- ============================================================================
-- 8. Property-Features Junction Table Policies
-- ============================================================================

-- Public can read features for available properties
CREATE POLICY public_read_property_property_features_on_property_property_fea
  ON public.property_property_features
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM properties p
      WHERE p.id = property_property_features.property_id
        AND p.status::text = 'available'
        AND TRUE
    )
  );

-- Admins have full access
CREATE POLICY admin_manage_property_property_features_on_property_property_fe
  ON public.property_property_features
  FOR ALL
  USING (is_admin());

-- ============================================================================
-- 9. Inquiries Policies
-- ============================================================================

-- Anyone can submit inquiries (INSERT)
CREATE POLICY public_insert_inquiries_on_inquiries
  ON public.inquiries
  FOR INSERT
  WITH CHECK (TRUE);

-- Admins can view all inquiries
CREATE POLICY admin_select_inquiries_on_inquiries
  ON public.inquiries
  FOR SELECT
  USING (is_admin());

-- Admins can update inquiries
CREATE POLICY admin_update_inquiries_on_inquiries
  ON public.inquiries
  FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- 10. Testimonials Policies
-- ============================================================================

-- Public can read published testimonials
CREATE POLICY public_read_published_testimonials_on_testimonials
  ON public.testimonials
  FOR SELECT
  USING (is_published = TRUE);

-- Admins have full access
CREATE POLICY admin_manage_testimonials_on_testimonials
  ON public.testimonials
  FOR ALL
  USING (is_admin());

-- ============================================================================
-- 11. SEO Pages Policies
-- ============================================================================

-- Public can read published SEO pages
CREATE POLICY public_read_published_seo_pages_on_seo_pages
  ON public.seo_pages
  FOR SELECT
  USING (is_published = TRUE);

-- Admins have full access
CREATE POLICY admin_manage_seo_pages_on_seo_pages
  ON public.seo_pages
  FOR ALL
  USING (is_admin());

COMMIT;

-- ============================================================================
-- Verification: List All RLS Policies
-- ============================================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


