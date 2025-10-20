-- ============================================================================
-- MASTER MIGRATION SCRIPT
-- Nova Nest Real Estate - Complete Database Schema Recreation
-- ============================================================================
-- 
-- This master script runs all migrations in the correct order to recreate
-- the entire database schema from scratch.
-- 
-- ⚠️  WARNING: This will create a complete new database schema.
-- DO NOT run this on a production database with existing data!
-- 
-- Usage:
-- 1. Create a new Supabase project or database instance
-- 2. Run this script via psql or Supabase Dashboard SQL Editor
-- 3. Verify all objects were created successfully
-- 4. Optionally import seed data for categories, features, neighborhoods
-- 
-- Run with: psql -h <host> -U <user> -d <database> -f scripts/migrations/009_create_master_migration.sql
-- 
-- Or execute each migration file individually in order:
-- - 000_enable_extensions.sql
-- - 001_create_enums.sql
-- - 002_create_base_tables.sql
-- - 003_create_foreign_keys.sql
-- - 004_create_indexes.sql
-- - 005_create_functions.sql
-- - 006_create_business_functions.sql
-- - 007_create_triggers.sql
-- - 008_enable_row_level_security.sql
-- 
-- ============================================================================

\echo '============================================================================'
\echo 'Nova Nest Real Estate - Master Migration Script'
\echo 'Creating complete database schema...'
\echo '============================================================================'
\echo ''

-- Set client encoding and timezone
SET client_encoding = 'UTF8';
SET timezone = 'UTC';

\echo '>>> Step 0: Enabling PostgreSQL Extensions...'
\i 000_enable_extensions.sql

\echo ''
\echo '>>> Step 1: Creating ENUM Types...'
\i 001_create_enums.sql

\echo ''
\echo '>>> Step 2: Creating Base Tables...'
\i 002_create_base_tables.sql

\echo ''
\echo '>>> Step 3: Creating Foreign Key Constraints...'
\i 003_create_foreign_keys.sql

\echo ''
\echo '>>> Step 4: Creating Indexes...'
\i 004_create_indexes.sql

\echo ''
\echo '>>> Step 5: Creating Core Functions...'
\i 005_create_functions.sql

\echo ''
\echo '>>> Step 6: Creating Business Logic Functions...'
\i 006_create_business_functions.sql

\echo ''
\echo '>>> Step 7: Creating Triggers...'
\i 007_create_triggers.sql

\echo ''
\echo '>>> Step 8: Enabling Row Level Security...'
\i 008_enable_row_level_security.sql

\echo ''
\echo '============================================================================'
\echo 'Migration Complete!'
\echo '============================================================================'
\echo ''
\echo 'Next Steps:'
\echo '1. Verify all objects were created: \dt, \df, \dT'
\echo '2. Import seed data for categories, features, and neighborhoods'
\echo '3. Create admin user in auth.users and admin_profiles'
\echo '4. Update environment variables in your application'
\echo '5. Generate new TypeScript types: supabase gen types typescript'
\echo ''
\echo '============================================================================'


