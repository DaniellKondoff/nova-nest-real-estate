-- ============================================================================
-- Migration: Create crm_tasks table
-- Nova Nest Real Estate — CRM follow-up reminders
-- ============================================================================
--
-- Adds task/reminder tracking per CRM contact.
-- Deleting a contact cascades to its tasks.
-- All access is admin-only via the existing is_admin() function.
-- Index on (due_date, is_done) optimises the "today's tasks" dashboard query.
--
-- Run AFTER: 013_create_crm_schema.sql
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contact_id   UUID        NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  -- values: call, meeting, follow_up, other
  type         TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  due_date     DATE        NOT NULL,
  is_done      BOOLEAN     NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date_is_done
  ON public.crm_tasks (due_date, is_done);

ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_select_crm_tasks ON public.crm_tasks FOR SELECT USING (is_admin());
CREATE POLICY admin_insert_crm_tasks ON public.crm_tasks FOR INSERT WITH CHECK (is_admin());
CREATE POLICY admin_update_crm_tasks ON public.crm_tasks FOR UPDATE USING (is_admin());
CREATE POLICY admin_delete_crm_tasks ON public.crm_tasks FOR DELETE USING (is_admin());

COMMIT;
