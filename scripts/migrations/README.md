# Nova Nest Real Estate - Database Migrations

This directory contains SQL migration scripts to recreate the complete Supabase database schema for Nova Nest Real Estate.

## 📋 Overview

These migrations allow you to:
- **Create a dev instance** of the database from scratch
- **Migrate to a new Supabase project** with identical schema
- **Disaster recovery** - rebuild database if needed
- **Documentation** - understand the complete database structure

## 🗂️ Migration Files

Migrations are numbered and should be run in order:

### Core Schema Migrations

| File | Description | Dependencies |
|------|-------------|--------------|
| `000_enable_extensions.sql` | Enable PostgreSQL extensions (uuid-ossp, pg_trgm, pgcrypto) | None |
| `001_create_enums.sql` | Create custom ENUM types | 000 |
| `002_create_base_tables.sql` | Create all tables with columns and constraints | 001 |
| `003_create_foreign_keys.sql` | Add foreign key relationships | 002 |
| `004_create_indexes.sql` | Create performance indexes (B-tree, GIN) | 003 |
| `005_create_functions.sql` | Create core database functions | 004 |
| `006_create_business_functions.sql` | Create business logic functions | 005 |
| `007_create_triggers.sql` | Create automatic triggers | 006 |
| `008_enable_row_level_security.sql` | Enable RLS and create security policies | 007 |
| `009_create_master_migration.sql` | Master script that runs all migrations | All |

### Legacy Migrations

| File | Description | Status |
|------|-------------|--------|
| `001_add_property_slugs.sql` | Original slug migration | ✅ Integrated into new migrations |
| `002_create_search_properties_v2.sql` | Search function fix | ✅ Integrated into new migrations |

## 🚀 Quick Start

### Option 1: Run Master Migration (Recommended)

From the project root directory:

```bash
# Navigate to migrations directory
cd scripts/migrations

# Run master migration script
psql -h <host> -U <user> -d <database> -f 009_create_master_migration.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `009_create_master_migration.sql`
3. Click "Run"

### Option 2: Run Individual Migrations

Run each migration in order:

```bash
cd scripts/migrations

# 1. Enable extensions
psql -h <host> -U <user> -d <database> -f 000_enable_extensions.sql

# 2. Create enums
psql -h <host> -U <user> -d <database> -f 001_create_enums.sql

# 3. Create tables
psql -h <host> -U <user> -d <database> -f 002_create_base_tables.sql

# ... continue with remaining migrations in order
```

## 📊 Database Schema Overview

### Tables Created

1. **admin_profiles** - Admin user profiles with role-based access
2. **property_categories** - Property types (Apartment, House, Office, etc.)
3. **property_features** - Available features (Elevator, Parking, etc.)
4. **neighborhoods** - Neighborhoods in Stara Zagora
5. **properties** - Main property listings
6. **property_images** - Property photos with metadata
7. **property_property_features** - Many-to-many property-feature relationships
8. **inquiries** - Customer inquiry submissions
9. **testimonials** - Client testimonials and reviews
10. **seo_pages** - SEO landing pages

### ENUM Types

- `inquiry_status`: new, in_progress, responded, closed
- `inquiry_type`: general, property_interest, viewing_request, valuation, selling, renting
- `property_feature_category`: interior, exterior, building, location, buildingType
- `property_operation_type`: sale, rent
- `property_status`: available, under_offer, sold, rented, archived
- `seo_page_type`: neighborhood, category, service, custom

### Key Functions

- **Search**: `search_properties_v2`, `search_properties_combined`
- **View Tracking**: `increment_property_view`, `update_seo_page_views`
- **Admin**: `is_admin`, `get_current_admin_role`
- **Business Logic**: `assign_inquiry_to_agent`, `auto_approve_testimonial`
- **Utilities**: `generate_property_slug`, `update_property_search_vector`

### Triggers

- **Updated At**: Automatic timestamp updates on all tables
- **Slug Generation**: Auto-generate SEO-friendly slugs for properties
- **Search Vector**: Auto-update full-text search index
- **Primary Image**: Enforce single primary image per property
- **Auto-Approval**: Auto-approve high-rated testimonials

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with the following access model:

- **Public Users**: READ access to published/available content only
- **Authenticated Admins**: FULL access via `is_admin()` function
- **Inquiry Submissions**: Anyone can INSERT inquiries
- **Admin Profiles**: Users can update own profile, admins can view all

## ✅ Post-Migration Steps

After running migrations:

### 1. Verify Schema

```sql
-- List all tables
\dt public.*

-- List all functions
\df public.*

-- List all enum types
\dT public.*

-- List all policies
\dp public.*
```

### 2. Import Seed Data

You'll need to populate reference tables:

```sql
-- Import property categories (Apartment, House, Office, etc.)
INSERT INTO property_categories (name_bg, name_en, slug, sort_order, is_active)
VALUES 
  ('Апартамент', 'Apartment', 'apartament', 1, true),
  ('Къща', 'House', 'kashta', 2, true),
  ('Офис', 'Office', 'ofis', 3, true),
  -- ... more categories
;

-- Import neighborhoods for Stara Zagora
INSERT INTO neighborhoods (name_bg, name_en, slug)
VALUES
  ('Център', 'Center', 'centur'),
  ('Железник', 'Zheleznik', 'zheleznik'),
  -- ... more neighborhoods
;

-- Import property features
INSERT INTO property_features (name_bg, name_en, category, sort_order)
VALUES
  ('Асансьор', 'Elevator', 'building', 1),
  ('Паркинг', 'Parking', 'exterior', 2),
  -- ... more features
;
```

### 3. Create Admin User

```sql
-- First create user in Supabase Auth Dashboard or via API
-- Then add admin profile:

INSERT INTO admin_profiles (user_id, full_name, role)
VALUES 
  ('<user-uuid-from-auth>', 'Admin Name', 'admin');
```

### 4. Update Application Environment

Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<new-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<new-anon-key>
```

### 5. Generate TypeScript Types

```bash
# Generate new types from schema
npm run type:gen

# Or manually:
supabase gen types typescript --project-id <project-id> > src/types/database.generated.ts
```

### 6. Test Application

```bash
npm run dev
# Verify:
# - Home page loads
# - Property listings display
# - Admin panel accessible (after creating admin user)
# - Search functionality works
```

## 🔄 Migration Strategy for Development

### Creating a Dev Instance

1. Create new Supabase project for dev
2. Run master migration: `009_create_master_migration.sql`
3. Import seed data (categories, neighborhoods, features)
4. (Optional) Copy production data for testing:
   ```bash
   # Export from production
   pg_dump -h prod-host -U user -d db --data-only --table=properties > properties_data.sql
   
   # Import to dev
   psql -h dev-host -U user -d db -f properties_data.sql
   ```
5. Update dev environment variables
6. Test thoroughly before deploying to production

### Keeping Dev in Sync

1. Run new migrations on both dev and production
2. Use Supabase CLI for schema diffing:
   ```bash
   supabase db diff --schema public
   ```
3. Version control all migration files
4. Document schema changes in commit messages

## 📝 Creating New Migrations

When adding new features:

1. **Create migration file** with sequential number:
   ```
   010_add_new_feature.sql
   ```

2. **Use transaction blocks**:
   ```sql
   BEGIN;
   -- Your changes here
   COMMIT;
   ```

3. **Include comments**:
   ```sql
   -- ============================================================================
   -- Migration: Add New Feature
   -- Description: What this migration does
   -- ============================================================================
   ```

4. **Add rollback instructions**:
   ```sql
   -- Rollback (if needed):
   -- DROP TABLE new_table;
   ```

5. **Test migration**:
   - Test on fresh database
   - Test on database with existing data
   - Verify no breaking changes

6. **Update master migration** if needed

## 🐛 Troubleshooting

### Extension Errors

If you get errors about missing extensions:

```sql
-- Enable manually in Supabase Dashboard > Database > Extensions
-- Or connect as superuser and enable
```

### Permission Errors

Ensure you're running as database owner or have sufficient privileges:

```sql
-- Check current user
SELECT current_user, current_database();

-- Check role permissions
\du
```

### RLS Policy Errors

If queries fail after enabling RLS:

```sql
-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Foreign Key Constraint Errors

If foreign keys fail:

```sql
-- Check if referenced tables/data exist
SELECT * FROM property_categories; -- Must have data before adding properties

-- Temporarily disable constraints (use with caution!)
SET CONSTRAINTS ALL DEFERRED;
```

## 📚 Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Full-Text Search in PostgreSQL](https://www.postgresql.org/docs/current/textsearch.html)

## 🤝 Contributing

When modifying migrations:

1. Never modify existing migration files that have been run in production
2. Create new migration files for schema changes
3. Test migrations on dev instance first
4. Document all changes in this README
5. Update `009_create_master_migration.sql` if needed

## 📜 License

These migration scripts are part of Nova Nest Real Estate project.






