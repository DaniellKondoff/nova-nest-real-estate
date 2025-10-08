# SEO URL Migration Instructions

## ⚠️ Important: Migration Steps

The SEO URL optimization implementation is complete, but requires a **database migration** to add the `slug` column to the `properties` table.

## Migration Status

- ✅ **Code Implementation**: Complete
- ✅ **Utility Functions**: Created (`src/lib/seo/property-slug.ts`)
- ✅ **Route Handlers**: Updated to support both old and new URLs
- ✅ **Components**: Updated (PropertyCard, Sitemap)
- ⏳ **Database Migration**: **NOT YET RUN** (see below)
- ⏳ **TypeScript Types**: Need regeneration after migration

---

## Step-by-Step Migration Process

### Step 1: Review the Migration SQL

The migration script is located at:
```
scripts/migrations/001_add_property_slugs.sql
```

Review the script to understand what it does:
1. Adds `slug` column to `properties` table
2. Creates indexes for performance
3. Creates PostgreSQL function to generate slugs
4. Creates trigger to auto-generate slugs
5. Populates existing properties with slugs

### Step 2: Run the Migration

#### Option A: Using Supabase CLI (Recommended)
```bash
# If you're using Supabase CLI
npx supabase migration new add_property_slugs
# Copy contents from scripts/migrations/001_add_property_slugs.sql

# Apply migration
npx supabase db push
```

#### Option B: Using Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the contents of `scripts/migrations/001_add_property_slugs.sql`
4. Run the query
5. Verify results in the output

#### Option C: Direct PostgreSQL Connection
```bash
# Connect to your database
psql postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]

# Run the migration
\i scripts/migrations/001_add_property_slugs.sql
```

### Step 3: Verify Migration Success

After running the migration, verify:

```sql
-- Check that slug column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'slug';

-- Check sample slugs
SELECT id, title_bg, slug 
FROM properties 
LIMIT 10;

-- Verify all properties have slugs
SELECT 
  COUNT(*) as total,
  COUNT(slug) as with_slug,
  COUNT(*) - COUNT(slug) as without_slug
FROM properties;
```

Expected results:
- `slug` column should exist and be of type `text`
- All properties should have auto-generated slugs
- Slugs should follow format: `{category-slug}-{rooms}-stai-{neighborhood-slug}`

### Step 4: Regenerate TypeScript Types

After the migration succeeds, regenerate the database types:

```bash
# Using Supabase CLI
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] > src/types/database.generated.ts

# Or if you have it configured
npm run types:generate
```

This will update `src/types/database.generated.ts` to include the new `slug` field.

### Step 5: Verify TypeScript Compilation

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Should compile without errors
```

### Step 6: Test the Implementation

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test URL formats:**
   - Old format should redirect: `http://localhost:3000/properties/11`
     → Redirects to: `http://localhost:3000/properties/11-apartamenti-3-stai-centur`
   
   - New format should work directly: `http://localhost:3000/properties/11-apartamenti-3-stai-centur`

3. **Verify sitemap:**
   - Visit: `http://localhost:3000/sitemap.xml`
   - All property URLs should use SEO-friendly slugs

4. **Test property cards:**
   - Visit: `http://localhost:3000/properties`
   - All property card links should use SEO-friendly URLs

---

## Current Linting Errors (Expected)

You will see TypeScript errors in these files **until the migration is run**:

```
src/app/sitemap.ts
  - Property 'slug' does not exist on type 'properties'

src/components/property/PropertyCard.tsx
  - Property 'slug' does not exist on type 'properties'
```

**This is normal!** The `slug` column doesn't exist in your TypeScript types yet because:
1. The database migration hasn't been run
2. The types haven't been regenerated

Once you complete Steps 2-4 above, these errors will disappear.

---

## Rollback Instructions

If you need to rollback the migration:

```sql
BEGIN;
DROP TRIGGER IF EXISTS trigger_set_property_slug ON properties;
DROP FUNCTION IF EXISTS set_property_slug();
DROP FUNCTION IF EXISTS generate_property_slug(INTEGER, INTEGER, INTEGER);
DROP INDEX IF EXISTS idx_properties_slug_unique;
DROP INDEX IF EXISTS idx_properties_slug;
ALTER TABLE properties DROP COLUMN IF EXISTS slug;
COMMIT;
```

After rollback, you would need to revert the code changes as well.

---

## Testing Checklist

After migration, verify:

### Database
- [ ] `slug` column exists in `properties` table
- [ ] All existing properties have slugs
- [ ] Slugs are unique
- [ ] Indexes are created
- [ ] Trigger auto-generates slugs for new properties

### Application
- [ ] TypeScript compiles without errors
- [ ] Old URLs redirect to new URLs
- [ ] New URLs work correctly
- [ ] Property cards use SEO URLs
- [ ] Sitemap includes SEO URLs
- [ ] Breadcrumbs work correctly
- [ ] Admin panel can create properties with slugs

### SEO
- [ ] URLs contain relevant keywords
- [ ] URLs are readable and user-friendly
- [ ] Canonical URLs are correct
- [ ] Sitemap is valid XML

---

## Example URL Transformations

### Before Migration
```
/properties/11
/properties/25
/properties/33
```

### After Migration
```
/properties/11-apartamenti-3-stai-centur
/properties/25-kashi-iztok
/properties/33-ofisi-centur
```

### Backwards Compatibility
Old URLs still work and redirect:
```
/properties/11 → 301 Redirect → /properties/11-apartamenti-3-stai-centur
```

---

## Need Help?

If you encounter issues:

1. **Check the migration output** for errors
2. **Verify your property_categories and neighborhoods** have valid slugs
3. **Check database logs** for any constraint violations
4. **Review the migration script** for any database-specific syntax issues

---

## Next Steps After Successful Migration

1. ✅ Run migration
2. ✅ Regenerate types
3. ✅ Verify compilation
4. ✅ Test in development
5. ✅ Deploy to staging
6. ✅ Submit updated sitemap to Google Search Console
7. ✅ Monitor for any 404 errors
8. ✅ Track SEO improvements over time

---

Good luck with the migration! 🚀

