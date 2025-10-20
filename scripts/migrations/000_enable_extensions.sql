-- ============================================================================
-- Migration: Enable Required PostgreSQL Extensions
-- Nova Nest Real Estate - Database Schema Recreation
-- ============================================================================
-- 
-- This migration enables all required PostgreSQL extensions for the application.
-- Run this FIRST before any other migrations.
-- 
-- Extensions included:
-- - uuid-ossp: UUID generation functions
-- - pg_trgm: Trigram text search and similarity
-- - pgcrypto: Cryptographic functions
-- 
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/000_enable_extensions.sql
-- Or via Supabase Dashboard SQL Editor
-- ============================================================================

BEGIN;

-- Enable UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- Enable Trigram text search (required for full-text search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA public;

-- Enable cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- Enable pg_stat_statements for query performance tracking
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" SCHEMA extensions;

-- Enable Supabase Vault (if not already enabled)
-- Note: This may already be enabled in Supabase by default
-- CREATE EXTENSION IF NOT EXISTS "supabase_vault" SCHEMA vault;

-- Enable pg_graphql (if not already enabled)
-- Note: This may already be enabled in Supabase by default
-- CREATE EXTENSION IF NOT EXISTS "pg_graphql" SCHEMA graphql;

COMMIT;

-- Verification: List enabled extensions
SELECT extname, extversion, nspname 
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
WHERE nspname IN ('public', 'extensions', 'vault', 'graphql')
ORDER BY extname;


