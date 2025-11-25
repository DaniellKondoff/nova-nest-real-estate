# Migration Guide: Creating a Dev Database Instance

This guide walks you through creating a complete mirror of your Nova Nest Real Estate database for development purposes.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Method 1: Via Supabase Dashboard (Easiest)](#method-1-via-supabase-dashboard-easiest)
- [Method 2: Via Supabase CLI](#method-2-via-supabase-cli)
- [Method 3: Via psql Command Line](#method-3-via-psql-command-line)
- [Post-Migration Setup](#post-migration-setup)
- [Importing Production Data (Optional)](#importing-production-data-optional)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ **Before you begin, ensure you have:**

1. **Supabase Account** - [Sign up](https://supabase.com) if needed
2. **New Supabase Project** - Create a new project for dev instance
3. **Migration Files** - All files in `scripts/migrations/` directory
4. **Database Access** - Connection details from Supabase Dashboard

---

## Method 1: Via Supabase Dashboard (Easiest)

### Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Enter project details:
   - **Name**: `nova-nest-dev` (or your choice)
   - **Database Password**: Strong password (save it!)
   - **Region**: Same as production for consistency
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### Step 2: Run Migrations via SQL Editor

1. In your new project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**

#### Option A: Run Master Migration (All-in-One)

1. Open `scripts/migrations/009_create_master_migration.sql`
2. **IMPORTANT**: Since Supabase Dashboard doesn't support `\i` includes, you need to:
   - Copy each migration file's contents
   - Paste them in order into the SQL Editor
   - Or combine all files manually

**Recommended approach:** Copy and paste each file in this order:

```
000_enable_extensions.sql
001_create_enums.sql
002_create_base_tables.sql
003_create_foreign_keys.sql
004_create_indexes.sql
005_create_functions.sql
006_create_business_functions.sql
007_create_triggers.sql
008_enable_row_level_security.sql
```

3. Click **"Run"** after pasting each file
4. Verify each succeeds before moving to next

#### Option B: Run Individual Migrations

For each migration file:

1. Open the file (e.g., `000_enable_extensions.sql`)
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**
5. Check for "Success" message
6. Move to next file

### Step 3: Verify Schema

In SQL Editor, run:

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check functions
SELECT proname FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' ORDER BY proname;

-- Check enums
SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN ('inquiry_status', 'property_status', 'inquiry_type', 
                     'property_operation_type', 'property_feature_category', 'seo_page_type')
GROUP BY t.typname;
```

Expected output:
- **10 tables**: admin_profiles, inquiries, neighborhoods, properties, property_categories, property_features, property_images, property_property_features, seo_pages, testimonials
- **Multiple functions**: is_admin, search_properties_v2, increment_property_view, etc.
- **6 enum types**: All enum types listed above

---

## Method 2: Via Supabase CLI

### Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (via scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase

# Or via npm (all platforms)
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

Follow the prompts to authenticate.

### Step 3: Link to Your Project

```bash
# Get project ID from Supabase Dashboard > Settings > General
supabase link --project-ref <your-project-id>
```

### Step 4: Run Migrations

```bash
cd scripts/migrations

# Run each migration in order
supabase db push --db-url "postgresql://postgres:<password>@<host>:5432/postgres" < 000_enable_extensions.sql
supabase db push --db-url "postgresql://postgres:<password>@<host>:5432/postgres" < 001_create_enums.sql
# ... continue for all migrations
```

Or use a script:

```bash
#!/bin/bash
# run-migrations.sh

DB_URL="postgresql://postgres:<password>@<host>:5432/postgres"
FILES=(
  "000_enable_extensions.sql"
  "001_create_enums.sql"
  "002_create_base_tables.sql"
  "003_create_foreign_keys.sql"
  "004_create_indexes.sql"
  "005_create_functions.sql"
  "006_create_business_functions.sql"
  "007_create_triggers.sql"
  "008_enable_row_level_security.sql"
)

for file in "${FILES[@]}"; do
  echo "Running $file..."
  psql "$DB_URL" -f "$file"
  if [ $? -ne 0 ]; then
    echo "Error running $file"
    exit 1
  fi
done

echo "All migrations completed successfully!"
```

Make executable and run:

```bash
chmod +x run-migrations.sh
./run-migrations.sh
```

---

## Method 3: Via psql Command Line

### Step 1: Install PostgreSQL Client

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Step 2: Get Connection Details

From Supabase Dashboard > Settings > Database:

- **Host**: `db.<project-ref>.supabase.co`
- **Database**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: Your database password

### Step 3: Test Connection

```bash
psql -h db.<project-ref>.supabase.co -U postgres -d postgres
# Enter password when prompted
```

If connected successfully, you'll see:

```
postgres=>
```

Type `\q` to exit.

### Step 4: Run Migrations

```bash
cd scripts/migrations

# Run each migration
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 000_enable_extensions.sql
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 001_create_enums.sql
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 002_create_base_tables.sql
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 003_create_foreign_keys.sql
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 004_create_indexes.sql
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 005_create_functions.sql
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 006_create_business_functions.sql
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 007_create_triggers.sql
psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f 008_enable_row_level_security.sql
```

Or run all at once (if on Linux/macOS):

```bash
for f in 00{0..8}*.sql; do 
  echo "Running $f..."
  psql -h db.<project-ref>.supabase.co -U postgres -d postgres -f "$f"
done
```

---

## Post-Migration Setup

### 1. Import Seed Data

Create an admin user and populate reference tables:

```sql
-- 1. First, create admin user via Supabase Dashboard > Authentication
--    Then run this to add admin profile:

INSERT INTO public.admin_profiles (user_id, full_name, role)
VALUES 
  ('<uuid-from-auth-users>', 'Dev Admin', 'admin');

-- 2. Import property categories
INSERT INTO public.property_categories (name_bg, name_en, slug, description_bg, sort_order, is_active)
VALUES 
  ('Апартамент', 'Apartment', 'apartament', 'Жилищни апартаменти', 1, true),
  ('Къща', 'House', 'kashta', 'Еднофамилни къщи', 2, true),
  ('Офис', 'Office', 'ofis', 'Офис пространства', 3, true),
  ('Гараж', 'Garage', 'garazh', 'Гаражи и паркоместа', 4, true),
  ('Парцел', 'Plot', 'parcel', 'Парцели за строителство', 5, true),
  ('Търговски обект', 'Commercial', 'turgovsko', 'Търговски площи', 6, true);

-- 3. Import neighborhoods (examples - add all from your constants file)
INSERT INTO public.neighborhoods (name_bg, name_en, slug, center_lat, center_lng)
VALUES 
  ('Център', 'Center', 'centur', 42.4258, 25.6347),
  ('Железник', 'Zheleznik', 'zheleznik', 42.4189, 25.6178),
  ('Самара', 'Samara', 'samara', 42.4134, 25.6401),
  ('Казански', 'Kazanski', 'kazanski', 42.4345, 25.6289);

-- 4. Import property features
INSERT INTO public.property_features (name_bg, name_en, category, sort_order, is_active)
VALUES 
  -- Building features
  ('Асансьор', 'Elevator', 'building', 1, true),
  ('Гараж', 'Garage', 'building', 2, true),
  ('Мазе', 'Basement', 'building', 3, true),
  
  -- Interior features
  ('Обзаведен', 'Furnished', 'interior', 10, true),
  ('Климатик', 'Air Conditioning', 'interior', 11, true),
  ('Камина', 'Fireplace', 'interior', 12, true),
  
  -- Exterior features
  ('Балкон', 'Balcony', 'exterior', 20, true),
  ('Тераса', 'Terrace', 'exterior', 21, true),
  ('Двор', 'Yard', 'exterior', 22, true),
  ('Паркинг', 'Parking', 'exterior', 23, true);
```

### 2. Update Environment Variables

Create or update `.env.local` for dev:

```env
# Dev Instance Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_NAME="Nova Nest Dev"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Generate TypeScript Types

```bash
# Using Supabase CLI
supabase gen types typescript --project-id <project-id> > src/types/database.generated.ts

# Or using npm script (if configured)
npm run type:gen
```

### 4. Test the Application

```bash
# Install dependencies (if not already)
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

**Verify:**
- ✅ Home page loads without errors
- ✅ Can browse property categories
- ✅ Can view neighborhoods
- ✅ Admin login works (use created admin user)
- ✅ Admin can create test property
- ✅ Search functionality works

---

## Importing Production Data (Optional)

To copy data from production to dev for testing:

### Export from Production

```bash
# Export specific tables (no schema, data only)
pg_dump \
  -h <prod-host> \
  -U postgres \
  -d postgres \
  --data-only \
  --table=properties \
  --table=property_images \
  --table=testimonials \
  --table=inquiries \
  > production_data.sql
```

### Import to Dev

```bash
psql \
  -h <dev-host> \
  -U postgres \
  -d postgres \
  -f production_data.sql
```

### Sanitize Sensitive Data (Recommended)

Before importing production data to dev, sanitize sensitive information:

```sql
-- Anonymize inquiries
UPDATE inquiries SET
  email = 'test-' || id || '@example.com',
  phone = '+359888' || LPAD(id::text, 6, '0'),
  full_name = 'Test User ' || id,
  admin_notes = NULL,
  utm_source = NULL,
  utm_medium = NULL,
  utm_campaign = NULL;

-- Anonymize testimonials
UPDATE testimonials SET
  client_name = 'Client ' || id,
  client_initial = SUBSTRING(client_name FROM 1 FOR 1) || '.',
  client_role = NULL;
```

---

## Troubleshooting

### Issue: "Extension already exists"

**Solution:** Extensions like `uuid-ossp` may already be enabled in Supabase. This is fine - the `IF NOT EXISTS` clause prevents errors.

### Issue: "Permission denied for schema public"

**Solution:** Ensure you're connecting as `postgres` user with the password from Supabase Dashboard.

### Issue: "Relation already exists"

**Solution:** You may be running migrations on a database that already has objects. Options:
1. Create a fresh Supabase project
2. Drop existing objects first (DANGEROUS - ensure this is dev!):
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

### Issue: "Function is_admin() does not exist"

**Solution:** Run migrations in correct order. The `is_admin()` function is created in `005_create_functions.sql` and must exist before `008_enable_row_level_security.sql` runs.

### Issue: "Connection refused" or "Connection timeout"

**Solution:**
1. Check if Supabase project is paused (unpause it)
2. Verify connection details from Dashboard
3. Check firewall/network settings
4. Ensure you're using correct host: `db.<project-ref>.supabase.co`

### Issue: RLS Policies Block Queries

**Solution:** Ensure you have at least one admin user:

```sql
-- Check admin profiles
SELECT * FROM admin_profiles;

-- If empty, create one (replace UUID with real user ID from auth.users)
INSERT INTO admin_profiles (user_id, full_name, role)
VALUES ('<user-uuid>', 'Admin', 'admin');
```

### Issue: Search Not Working

**Solution:** Search vector may not be populated for existing properties:

```sql
-- Update search vectors for all properties
UPDATE properties 
SET search_vector = NULL; -- Trigger will auto-populate

-- Or force update
UPDATE properties 
SET updated_at = NOW();
```

---

## Next Steps

After successfully creating your dev instance:

1. **Set up automated backups** for both prod and dev
2. **Create npm scripts** for common operations:
   ```json
   {
     "scripts": {
       "db:migrate:dev": "psql $DEV_DB_URL -f scripts/migrations/009_create_master_migration.sql",
       "db:seed:dev": "psql $DEV_DB_URL -f scripts/seed_data.sql",
       "db:reset:dev": "npm run db:migrate:dev && npm run db:seed:dev"
     }
   }
   ```
3. **Document any deviations** from production schema
4. **Test new features** on dev before deploying to prod
5. **Keep dev schema in sync** with production

---

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL Backup & Restore](https://www.postgresql.org/docs/current/backup.html)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Row Level Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

---

## Support

If you encounter issues not covered in this guide:

1. Check Supabase logs in Dashboard > Logs
2. Check PostgreSQL logs for detailed error messages
3. Review migration files for syntax errors
4. Consult Nova Nest project documentation
5. Contact development team

---

**Happy migrating! 🚀**








