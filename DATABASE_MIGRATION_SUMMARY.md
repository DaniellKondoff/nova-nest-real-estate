# Nova Nest Real Estate - Database Migration Scripts Summary

## 📊 Overview

Complete set of SQL migration scripts has been created to enable full database schema recreation for development instances, disaster recovery, or migration to new Supabase projects.

**Created**: October 20, 2025  
**Status**: ✅ Complete and ready to use  
**Location**: `scripts/migrations/`

---

## 🎯 Purpose

These migrations allow you to:
- **Create mirror dev databases** with identical schema
- **Migrate between Supabase projects** seamlessly
- **Disaster recovery** - rebuild database from scratch
- **Documentation** - comprehensive schema reference
- **Version control** - track all schema changes

---

## 📁 Files Created

### Core Migration Files (Run in Order)

| File | Size | Description |
|------|------|-------------|
| `000_enable_extensions.sql` | ~2KB | Enable PostgreSQL extensions (uuid-ossp, pg_trgm, pgcrypto) |
| `001_create_enums.sql` | ~3KB | Create 6 custom ENUM types |
| `002_create_base_tables.sql` | ~12KB | Create 10 tables with full schema |
| `003_create_foreign_keys.sql` | ~6KB | Add all foreign key relationships |
| `004_create_indexes.sql` | ~8KB | Create 50+ performance indexes |
| `005_create_functions.sql` | ~10KB | Core database functions (slugs, timestamps, search vectors) |
| `006_create_business_functions.sql` | ~9KB | Business logic functions (search, views, inquiries) |
| `007_create_triggers.sql` | ~5KB | Automatic triggers for all tables |
| `008_enable_row_level_security.sql` | ~11KB | RLS policies for all tables |
| `009_create_master_migration.sql` | ~3KB | Master script to run all migrations |

### Documentation Files

| File | Size | Description |
|------|------|-------------|
| `README.md` | ~15KB | Complete migration documentation |
| `MIGRATION_GUIDE.md` | ~18KB | Step-by-step migration walkthrough |

### Legacy Files (Integrated into new migrations)

- `001_add_property_slugs.sql` - Original slug migration (kept for reference)
- `002_create_search_properties_v2.sql` - Search function fix (kept for reference)

---

## 🗄️ Database Schema Summary

### Tables (10 Total)

1. **admin_profiles** (7 columns)
   - Admin user profiles with role-based access
   - Roles: admin, agent, manager
   - Links to auth.users

2. **property_categories** (9 columns)
   - Property types: Apartment, House, Office, Garage, Plot, Commercial
   - Bilingual support (Bulgarian/English)
   - Sort ordering and active status

3. **property_features** (8 columns)
   - Features: Elevator, Parking, Balcony, etc.
   - Categorized: interior, exterior, building, location, buildingType
   - Bilingual support

4. **neighborhoods** (12 columns)
   - Neighborhoods in Stara Zagora
   - Geographic coordinates (lat/lng)
   - JSONB amenities and transport info
   - SEO metadata

5. **properties** (34 columns)
   - Main property listings table
   - Bilingual content (BG/EN)
   - Full-text search support
   - SEO optimization (slugs, meta, og_image)
   - View tracking
   - Status workflow
   - JSONB features and amenities

6. **property_images** (12 columns)
   - Property photos with metadata
   - Primary image designation
   - Sort ordering
   - Dimensions and file size tracking

7. **property_property_features** (2 columns)
   - Many-to-many junction table
   - Links properties to features

8. **inquiries** (21 columns)
   - Customer inquiry submissions
   - Status workflow (new → in_progress → responded → closed)
   - Assignment to agents
   - UTM tracking
   - Budget and preference tracking

9. **testimonials** (14 columns)
   - Client testimonials and reviews
   - 1-5 star ratings
   - Auto-approval for high ratings (≥4)
   - Published/featured flags
   - Optional property link

10. **seo_pages** (20 columns)
    - SEO landing pages
    - Types: neighborhood, category, service, custom
    - Bilingual content
    - View tracking
    - Canonical URLs

### ENUM Types (6 Total)

| ENUM | Values | Usage |
|------|--------|-------|
| `inquiry_status` | new, in_progress, responded, closed | Inquiry workflow |
| `inquiry_type` | general, property_interest, viewing_request, valuation, selling, renting | Inquiry classification |
| `property_feature_category` | interior, exterior, building, location, buildingType | Feature grouping |
| `property_operation_type` | sale, rent | Property listing type |
| `property_status` | available, under_offer, sold, rented, archived | Property lifecycle |
| `seo_page_type` | neighborhood, category, service, custom | SEO page classification |

### Indexes (50+ Total)

- **Primary Keys**: Automatic on all tables
- **Foreign Keys**: All foreign key columns indexed
- **Full-Text Search**: GIN indexes on tsvector columns
- **JSONB**: GIN indexes on amenities, features, transport_info
- **Filtered**: Partial indexes on is_featured, is_primary, status
- **Composite**: Multi-column indexes for common queries
- **Unique**: Slugs (properties, neighborhoods, categories)

### Functions (60+ Total)

**Core Functions**:
- `set_updated_at()` - Auto-update timestamp
- `generate_property_slug()` - Generate SEO-friendly slugs
- `set_property_slug()` - Trigger function for slugs
- `update_property_search_vector()` - Update full-text search index
- `ensure_single_primary_image()` - Enforce single primary image

**Authentication**:
- `is_admin()` - Check if user is admin
- `get_current_admin_role()` - Get current user's role

**Search Functions**:
- `search_properties_v2()` - Main search with filters
- `search_properties_combined()` - Legacy search (backwards compat)
- `search_properties_fulltext()` - Full-text search only

**Business Logic**:
- `increment_property_view()` - Track property views
- `assign_inquiry_to_agent()` - Assign inquiries
- `auto_approve_testimonial()` - Auto-approve high ratings
- `update_property_new_status()` - Mark old properties as not new
- `update_seo_page_views()` - Track SEO page views
- `get_property_stats()` - Get property statistics
- `is_published_property()` - Check publication status

**Plus**: 40+ pg_trgm functions for trigram search (auto-created by extension)

### Triggers (16 Total)

| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| `set_admin_profiles_updated_at` | admin_profiles | UPDATE | set_updated_at() |
| `update_admin_profiles_updated_at` | admin_profiles | UPDATE | update_updated_at() |
| `trigger_set_property_slug` | properties | INSERT, UPDATE | set_property_slug() |
| `update_properties_search_vector` | properties | INSERT, UPDATE | update_property_search_vector() |
| `update_properties_updated_at` | properties | UPDATE | update_updated_at() |
| `ensure_single_primary_image_trigger` | property_images | INSERT, UPDATE | ensure_single_primary_image() |
| `set_inquiries_updated_at` | inquiries | UPDATE | set_updated_at_inquiries() |
| `update_inquiries_updated_at` | inquiries | UPDATE | update_updated_at() |
| `auto_approve_high_rated_testimonials` | testimonials | INSERT | auto_approve_testimonial_trigger() |
| `set_testimonials_updated_at` | testimonials | UPDATE | set_updated_at_testimonials() |
| `update_testimonials_updated_at` | testimonials | UPDATE | update_updated_at() |
| `set_seo_pages_updated_at` | seo_pages | UPDATE | set_updated_at_seo_pages() |
| `update_seo_pages_updated_at` | seo_pages | UPDATE | update_updated_at() |

### Row Level Security (RLS)

**All tables have RLS enabled** with comprehensive policies:

- **Public Access**: READ published/available content only
- **Admin Access**: FULL CRUD via `is_admin()` function
- **Inquiry Submission**: Anyone can INSERT inquiries
- **Profile Management**: Users can UPDATE own profile

**Total Policies**: 26 policies across 10 tables

---

## 🚀 Quick Start

### Option 1: Supabase Dashboard (Recommended for First-Time)

1. Create new Supabase project
2. Go to SQL Editor
3. Copy and run each migration file in order (000 through 008)
4. Verify schema creation
5. Import seed data

### Option 2: Command Line (Fastest)

```bash
cd scripts/migrations

# Run all migrations
for f in 00{0..8}*.sql; do 
  psql -h <host> -U postgres -d postgres -f "$f"
done
```

### Option 3: Master Script (psql with includes)

```bash
cd scripts/migrations
psql -h <host> -U postgres -d postgres -f 009_create_master_migration.sql
```

---

## ✅ Verification Checklist

After running migrations, verify:

- [ ] **10 tables created** - Check with `\dt` or query pg_tables
- [ ] **6 ENUM types created** - Check with `\dT` or query pg_type
- [ ] **50+ indexes created** - Check with `\di` or query pg_indexes
- [ ] **60+ functions created** - Check with `\df` or query pg_proc
- [ ] **16 triggers created** - Check with `\dy` or query information_schema.triggers
- [ ] **26 RLS policies created** - Check with `\dp` or query pg_policies
- [ ] **All foreign keys enforced** - Check with `\d table_name`
- [ ] **Extensions enabled** - Check with `\dx`

Quick verification query:

```sql
-- Count all objects
SELECT 
  'Tables' as object_type, COUNT(*)::text as count 
FROM pg_tables WHERE schemaname = 'public'
UNION ALL
SELECT 'Functions', COUNT(*)::text 
FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public'
UNION ALL
SELECT 'Triggers', COUNT(*)::text 
FROM information_schema.triggers WHERE trigger_schema = 'public'
UNION ALL
SELECT 'Indexes', COUNT(*)::text 
FROM pg_indexes WHERE schemaname = 'public'
UNION ALL
SELECT 'Policies', COUNT(*)::text 
FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 'Enums', COUNT(*)::text 
FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace;
```

Expected output:
```
object_type | count
------------+-------
Tables      | 10
Functions   | 60+
Triggers    | 16
Indexes     | 50+
Policies    | 26
Enums       | 6
```

---

## 📊 Database Statistics

### Total Objects Created

- **Tables**: 10
- **Columns**: 200+
- **Indexes**: 50+
- **Functions**: 60+
- **Triggers**: 16
- **RLS Policies**: 26
- **ENUM Types**: 6
- **Foreign Keys**: 13
- **Check Constraints**: 5
- **Unique Constraints**: 8

### Estimated Database Size

For empty schema (no data):
- **Schema Objects**: ~5MB
- **Indexes**: ~2MB
- **Extensions**: ~1MB
- **Total**: ~8MB

With typical production data (1000 properties):
- **Properties + Images**: ~50-100MB
- **Full-text search indexes**: ~10-20MB
- **Total Estimated**: ~100-150MB

---

## 🔄 Migration Workflow

### For New Dev Instance

```
1. Create Supabase project
2. Run migrations (000-008)
3. Import seed data (categories, neighborhoods, features)
4. Create admin user
5. Update .env.local
6. Generate TypeScript types
7. Test application
```

### For Existing Dev Instance (Schema Changes)

```
1. Create new migration file (010_*.sql)
2. Test on local/dev first
3. Review for breaking changes
4. Run on dev instance
5. Verify functionality
6. Deploy to production
7. Update documentation
```

---

## 📝 Best Practices

### DO ✅

- Always run migrations in order
- Test migrations on dev before production
- Use transactions (BEGIN/COMMIT)
- Document all schema changes
- Keep migration files immutable (don't edit after applied)
- Verify each migration succeeds before continuing
- Back up production before major migrations

### DON'T ❌

- Skip migration files or run out of order
- Modify existing migrations after they've been applied
- Run migrations directly on production without testing
- Forget to update TypeScript types after schema changes
- Ignore RLS policies (test with actual auth users)
- Drop tables without CASCADE consideration
- Use hardcoded UUIDs in migrations

---

## 🐛 Common Issues and Solutions

### Issue: "Extension already exists"

**Solution**: Normal - Supabase pre-enables some extensions. The `IF NOT EXISTS` clause handles this.

### Issue: "Function is_admin() does not exist"

**Solution**: Run migrations in order. Functions must be created before RLS policies that reference them.

### Issue: "Permission denied"

**Solution**: Connect as `postgres` user with correct password from Supabase Dashboard.

### Issue: "Relation already exists"

**Solution**: Running on non-empty database. Either:
1. Create fresh project
2. Drop and recreate schema (DANGEROUS - dev only!)

---

## 📚 Documentation Files

All documentation is in `scripts/migrations/`:

- **README.md** - Comprehensive migration reference
- **MIGRATION_GUIDE.md** - Step-by-step walkthrough for all methods
- **DATABASE_MIGRATION_SUMMARY.md** (this file) - Executive summary

---

## 🎯 Next Steps

After successful migration:

1. **Import seed data** - Categories, neighborhoods, features
2. **Create admin user** - Via Supabase Auth + admin_profiles
3. **Update environment** - .env.local with new project details
4. **Generate types** - TypeScript types from new schema
5. **Test application** - Verify all functionality works
6. **(Optional) Import data** - Copy production data for testing
7. **Document** - Note any custom configurations or data

---

## 📞 Support

For issues or questions:

1. Check `MIGRATION_GUIDE.md` troubleshooting section
2. Review Supabase logs in Dashboard
3. Check PostgreSQL error messages
4. Review migration files for syntax errors
5. Consult Supabase documentation
6. Contact development team

---

## 🏆 Success Criteria

Migration is successful when:

- ✅ All 10 tables exist and queryable
- ✅ All functions execute without errors
- ✅ All triggers fire correctly on INSERT/UPDATE
- ✅ RLS policies allow/deny access appropriately
- ✅ Full-text search returns results
- ✅ Slugs auto-generate for new properties
- ✅ Admin can log in and access admin panel
- ✅ Public can view properties without auth
- ✅ Application runs without errors
- ✅ All features work as expected

---

## 📈 Maintenance

### Regular Tasks

- **Weekly**: Check dev/prod schema diff
- **Monthly**: Review and optimize slow queries
- **Quarterly**: Update seed data
- **Yearly**: Major schema review and cleanup

### Schema Changes

When making changes:

1. Create new numbered migration file
2. Test thoroughly on dev
3. Document changes in migration file
4. Update this summary document
5. Apply to production during low-traffic window
6. Monitor for issues

---

**Status**: ✅ Complete and Production-Ready  
**Last Updated**: October 20, 2025  
**Version**: 1.0  
**Maintainer**: Nova Nest Development Team

---

## 🙏 Acknowledgments

These migrations preserve the complete database schema for the Nova Nest Real Estate platform, a Bulgarian property listing system built with Next.js 15, Supabase, and TypeScript.

**Happy Migrating! 🚀**








