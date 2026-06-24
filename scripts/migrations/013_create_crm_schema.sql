-- ============================================================================
-- Migration: Create CRM Schema
-- Nova Nest Real Estate - Customer Relationship Management
-- ============================================================================
--
-- Creates 4 tables for the CRM module:
--   - crm_contacts              : buyers, sellers, renters, landlords
--   - crm_contact_neighborhoods : junction — contacts <-> neighborhoods of interest
--   - crm_contact_properties    : junction — contacts <-> properties of interest
--   - crm_activities            : call/note/meeting log per contact
--
-- All tables are admin-only via RLS (uses existing is_admin() function).
-- crm_contacts.updated_at auto-updates via existing set_updated_at() function.
--
-- Run AFTER: 012_create_semantic_search_rpcs.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/013_create_crm_schema.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. crm_contacts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name       TEXT        NOT NULL,
  phone           TEXT        NOT NULL,
  email           TEXT,
  budget_min      NUMERIC,
  budget_max      NUMERIC,
  budget_currency TEXT        NOT NULL DEFAULT 'EUR',
  -- values: active, inactive, closed
  status          TEXT        NOT NULL DEFAULT 'active',
  -- values: buyer, seller, renter, landlord
  client_types    TEXT[]      NOT NULL DEFAULT '{}',
  general_notes   TEXT
);

-- ============================================================================
-- 2. crm_contact_neighborhoods (junction)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_contact_neighborhoods (
  id              UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID   NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  neighborhood_id BIGINT NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
  UNIQUE (contact_id, neighborhood_id)
);

-- ============================================================================
-- 3. crm_contact_properties (junction)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_contact_properties (
  id          UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID   NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  UNIQUE (contact_id, property_id)
);

-- ============================================================================
-- 4. crm_activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contact_id  UUID        NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  -- values: note, call, meeting
  type        TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  outcome     TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. updated_at Trigger (crm_contacts only — other tables have no updated_at)
-- ============================================================================

DROP TRIGGER IF EXISTS set_crm_contacts_updated_at ON public.crm_contacts;
CREATE TRIGGER set_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 6. Row Level Security
-- ============================================================================

ALTER TABLE public.crm_contacts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_properties    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities            ENABLE ROW LEVEL SECURITY;

-- crm_contacts
CREATE POLICY admin_select_crm_contacts ON public.crm_contacts FOR SELECT USING (is_admin());
CREATE POLICY admin_insert_crm_contacts ON public.crm_contacts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY admin_update_crm_contacts ON public.crm_contacts FOR UPDATE USING (is_admin());
CREATE POLICY admin_delete_crm_contacts ON public.crm_contacts FOR DELETE USING (is_admin());

-- crm_contact_neighborhoods
CREATE POLICY admin_select_crm_contact_neighborhoods ON public.crm_contact_neighborhoods FOR SELECT USING (is_admin());
CREATE POLICY admin_insert_crm_contact_neighborhoods ON public.crm_contact_neighborhoods FOR INSERT WITH CHECK (is_admin());
CREATE POLICY admin_update_crm_contact_neighborhoods ON public.crm_contact_neighborhoods FOR UPDATE USING (is_admin());
CREATE POLICY admin_delete_crm_contact_neighborhoods ON public.crm_contact_neighborhoods FOR DELETE USING (is_admin());

-- crm_contact_properties
CREATE POLICY admin_select_crm_contact_properties ON public.crm_contact_properties FOR SELECT USING (is_admin());
CREATE POLICY admin_insert_crm_contact_properties ON public.crm_contact_properties FOR INSERT WITH CHECK (is_admin());
CREATE POLICY admin_update_crm_contact_properties ON public.crm_contact_properties FOR UPDATE USING (is_admin());
CREATE POLICY admin_delete_crm_contact_properties ON public.crm_contact_properties FOR DELETE USING (is_admin());

-- crm_activities
CREATE POLICY admin_select_crm_activities ON public.crm_activities FOR SELECT USING (is_admin());
CREATE POLICY admin_insert_crm_activities ON public.crm_activities FOR INSERT WITH CHECK (is_admin());
CREATE POLICY admin_update_crm_activities ON public.crm_activities FOR UPDATE USING (is_admin());
CREATE POLICY admin_delete_crm_activities ON public.crm_activities FOR DELETE USING (is_admin());

COMMIT;
