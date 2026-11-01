-- ============================================================================
-- Migration: Create api_rate_limits + rate_limit_hit()
-- Nova Nest Real Estate - durable rate limiting for public endpoints (AUDIT F-6, later F-1)
-- ============================================================================
--
-- Additive only – safe on the shared prod DB:
--   * NEW table  public.api_rate_limits   (fixed-window hit counters, keys are hashed – no raw IPs)
--   * NEW function public.rate_limit_hit() (atomic increment, callable by service_role only)
--
-- Does NOT alter existing tables or functions. Deployed code does not use it.
-- The app falls back to its in-memory limiter while this migration is not applied.
--
-- Run AFTER: 015_create_search_properties_v3.sql
-- Run with: Supabase Dashboard SQL Editor
-- Rollback: DROP FUNCTION public.rate_limit_hit(TEXT, INT, INT);
--           DROP TABLE public.api_rate_limits;
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  hits INT NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window_start ON public.api_rate_limits (window_start);

-- RLS on with no policies: anon/authenticated cannot read or write; service_role bypasses RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_rate_limits FROM anon, authenticated;

COMMENT ON TABLE public.api_rate_limits IS
  'Fixed-window rate limit counters for public API routes (e.g. /api/chat). Keys contain hashed IPs only.';

CREATE OR REPLACE FUNCTION public.rate_limit_hit(
  p_key TEXT,
  p_limit INT,
  p_window_seconds INT
)
RETURNS TABLE (allowed BOOLEAN, retry_after INT)
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  v_epoch DOUBLE PRECISION := extract(epoch FROM now());
  v_window_start TIMESTAMPTZ := to_timestamp(floor(v_epoch / p_window_seconds) * p_window_seconds);
  v_hits INT;
BEGIN
  -- Atomic across concurrent serverless instances
  INSERT INTO public.api_rate_limits AS r (key, window_start, hits)
  VALUES (p_key, v_window_start, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING r.hits INTO v_hits;

  -- Opportunistic cleanup (~1% of calls) so the table stays small without a cron job
  IF random() < 0.01 THEN
    DELETE FROM public.api_rate_limits WHERE window_start < now() - interval '2 days';
  END IF;

  allowed := v_hits <= p_limit;
  retry_after := CASE
    WHEN v_hits <= p_limit THEN 0
    ELSE GREATEST(1, ceil(extract(epoch FROM (v_window_start + make_interval(secs => p_window_seconds) - now())))::INT)
  END;
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION public.rate_limit_hit(TEXT, INT, INT) IS
  'Counts one hit for p_key in the current fixed window; allowed = hits <= p_limit. Server-side (service_role) only.';

-- Only the server (service_role) may call it – otherwise anyone with the anon key could burn other keys' limits
REVOKE ALL ON FUNCTION public.rate_limit_hit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(TEXT, INT, INT) TO service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Verification (run manually)
-- ============================================================================
-- SELECT * FROM public.rate_limit_hit('test:verify', 2, 60);  -- allowed = true
-- SELECT * FROM public.rate_limit_hit('test:verify', 2, 60);  -- allowed = true
-- SELECT * FROM public.rate_limit_hit('test:verify', 2, 60);  -- allowed = false, retry_after > 0
-- DELETE FROM public.api_rate_limits WHERE key = 'test:verify';
