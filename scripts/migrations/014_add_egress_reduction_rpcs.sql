-- ============================================================================
-- Migration: Add Egress Reduction RPCs
-- Nova Nest Real Estate
-- ============================================================================
--
-- Adds a server-side aggregate function to replace full-table column scans
-- used by the admin dashboard for computing total property view counts.
-- This avoids downloading all property rows to the client just to sum a column.
--
-- Run AFTER: 013_create_crm_schema.sql
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/014_add_egress_reduction_rpcs.sql
-- ============================================================================

BEGIN;

-- Returns the total sum of view_count across all non-archived properties.
-- Called by the admin dashboard instead of fetching all rows and summing in JS.
CREATE OR REPLACE FUNCTION get_total_view_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(view_count), 0)::bigint
  FROM properties
  WHERE status != 'archived';
$$;

COMMIT;
