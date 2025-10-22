# Nova Nest Real Estate - Database Schema Diagram

Visual representation of the complete database schema, relationships, and architecture.

---

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION LAYER                                │
│                          (Supabase Auth)                                    │
│                                                                             │
│   ┌─────────────────┐                                                      │
│   │   auth.users    │ (Managed by Supabase)                               │
│   │  - id (UUID)    │                                                      │
│   │  - email        │                                                      │
│   │  - password     │                                                      │
│   │  - ...          │                                                      │
│   └────────┬────────┘                                                      │
│            │                                                                │
└────────────┼────────────────────────────────────────────────────────────────┘
             │
             │ (1:1)
             ▼
┌──────────────────────┐
│  admin_profiles      │──┐
│  ==================  │  │
│  - user_id (PK, FK)  │  │ Linked to auth.users
│  - full_name         │  │
│  - role (CHECK)      │  │ Values: 'admin', 'agent', 'manager'
│  - phone             │  │
│  - avatar_url        │  │
│  - created_at        │  │
│  - updated_at        │  │
└──────────────────────┘  │
                          │
        ┌─────────────────┘
        │
        │ (1:N) Creates Properties
        │ (1:N) Assigned Inquiries
        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           PROPERTY MANAGEMENT                             │
└──────────────────────────────────────────────────────────────────────────┘

┌────────────────────────┐         ┌─────────────────────────┐
│ property_categories    │◄────────│    neighborhoods        │
│ =====================  │  (N)    │ =====================   │
│ - id (PK)              │         │ - id (PK)               │
│ - name_bg              │         │ - name_bg               │
│ - name_en              │         │ - name_en               │
│ - slug (UNIQUE)        │         │ - slug (UNIQUE)         │
│ - description_bg       │         │ - description           │
│ - icon                 │         │ - center_lat            │
│ - sort_order           │         │ - center_lng            │
│ - is_active            │         │ - amenities (JSONB)     │
│ - created_at           │         │ - transport_info (JSONB)│
└────┬───────────────────┘         │ - seo_title             │
     │                              │ - seo_description       │
     │ (1:N)                        │ - seo_keywords          │
     │                              └────┬────────────────────┘
     │                                   │
     │                                   │ (1:N)
     │                                   │
     └────────────┐      ┌──────────────┘
                  │      │
                  ▼      ▼
         ┌────────────────────────────┐
         │      properties            │◄──────┐ (Created by)
         │   =======================  │       │
         │   - id (PK)                │       │
         │   - title_bg               │       │
         │   - title_en               │       │
         │   - description_bg         │       │ auth.users (via created_by FK)
         │   - description_en         │       │
         │   - address_bg             │       │
         │   - price_bgn              │       │
         │   - price_eur              │       │
         │   - operation_type (ENUM)  │       │
         │   - area_sqm               │       │
         │   - rooms, bedrooms, baths │       │
         │   - floor, total_floors    │       │
         │   - year_built             │       │
         │   - latitude, longitude    │       │
         │   - neighborhood_id (FK)   │       │
         │   - category_id (FK)       │       │
         │   - features (JSONB)       │       │
         │   - amenities (JSONB)      │       │
         │   - status (ENUM)          │       │
         │   - is_featured            │       │
         │   - is_new                 │       │
         │   - seo_title              │       │
         │   - seo_description        │       │
         │   - seo_keywords           │       │
         │   - og_image               │       │
         │   - slug (UNIQUE)          │       │
         │   - search_vector (tsvec)  │       │
         │   - view_count             │       │
         │   - last_viewed_at         │       │
         │   - created_by (FK)        │───────┘
         │   - created_at             │
         │   - updated_at             │
         └──┬──────────┬──────────────┘
            │          │
    ┌───────┘          └───────┐
    │ (1:N)                    │ (N:M via junction)
    ▼                          ▼
┌────────────────────────┐  ┌──────────────────────────────┐
│  property_images       │  │ property_property_features   │
│  ====================  │  │ ===========================  │
│  - id (PK)             │  │ - property_id (PK, FK)       │
│  - property_id (FK)    │  │ - feature_id (PK, FK)        │
│  - filename            │  └──────────────┬───────────────┘
│  - url                 │                 │
│  - alt_text_bg         │                 │ (N:M)
│  - alt_text_en         │                 │
│  - width, height       │                 ▼
│  - file_size           │  ┌──────────────────────────┐
│  - sort_order          │  │  property_features       │
│  - is_primary          │  │  ======================  │
│  - created_at          │  │  - id (PK)               │
└────────────────────────┘  │  - name_bg (UNIQUE)      │
                            │  - name_en               │
         ┌──────────────────│  - category (ENUM)       │
         │ (N:1)            │  - icon                  │
         │ Reference        │  - sort_order            │
         │ (Optional)       │  - is_active             │
         │                  │  - created_at            │
         │                  └──────────────────────────┘
         │
┌────────┴─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER ENGAGEMENT                                    │
└──────────────────────────────────────────────────────────────────────────┘

┌────────────────────────┐         ┌─────────────────────────┐
│    inquiries           │         │    testimonials         │
│ =====================  │         │ =====================   │
│ - id (PK)              │         │ - id (PK)               │
│ - full_name            │         │ - client_name           │
│ - email                │         │ - client_initial        │
│ - phone                │         │ - client_role           │
│ - inquiry_type (ENUM)  │         │ - content_bg            │
│ - property_id (FK)     │───┐     │ - content_en            │
│ - subject              │   │     │ - rating (1-5)          │
│ - message              │   │     │ - property_id (FK) ─────┼──┐
│ - budget_min/max       │   │     │ - service_type          │  │
│ - preferred_neighb     │   │     │ - is_published          │  │
│ - preferred_types      │   │     │ - is_featured           │  │
│ - status (ENUM)        │   │     │ - review_date           │  │
│ - assigned_to (FK)     │───┼──┐  │ - created_at            │  │
│ - admin_notes          │   │  │  │ - updated_at            │  │
│ - responded_at         │   │  │  └─────────────────────────┘  │
│ - source, utm_*        │   │  │                               │
│ - created_at           │   │  │  Both link to properties ◄────┘
│ - updated_at           │   │  │  (Optional FK, ON DELETE SET NULL)
└────────────────────────┘   │  │
                             │  │
                             │  └───► auth.users (assigned_to)
                             │
                             └──────► properties (property_id)

┌──────────────────────────────────────────────────────────────────────────┐
│                              SEO LAYER                                    │
└──────────────────────────────────────────────────────────────────────────┘

         ┌─────────────────────────┐
         │      seo_pages          │
         │  =====================  │
         │  - id (PK)              │
         │  - slug (UNIQUE)        │
         │  - title_bg             │
         │  - title_en             │
         │  - meta_title           │
         │  - meta_description     │
         │  - meta_keywords []     │
         │  - h1_bg, h1_en         │
         │  - content_bg           │
         │  - content_en           │
         │  - page_type (ENUM)     │
         │  - neighborhood_id (FK) │──┐
         │  - category_id (FK)     │──┼──┐
         │  - is_published         │  │  │
         │  - canonical_url        │  │  │
         │  - view_count           │  │  │
         │  - last_viewed_at       │  │  │
         │  - created_at           │  │  │
         │  - updated_at           │  │  │
         └─────────────────────────┘  │  │
                                      │  │
         Optional references to:      │  │
         neighborhoods ◄──────────────┘  │
         property_categories ◄───────────┘
```

---

## 🔑 Key Relationships

### Primary Relationships

| Parent Table | Child Table | Type | Relationship | Constraint |
|--------------|-------------|------|--------------|------------|
| `auth.users` | `admin_profiles` | 1:1 | Admin user profile | ON DELETE CASCADE |
| `auth.users` | `properties` | 1:N | Created by admin | ON DELETE RESTRICT |
| `auth.users` | `inquiries` | 1:N | Assigned to admin | ON DELETE SET NULL |
| `property_categories` | `properties` | 1:N | Property category | ON DELETE RESTRICT |
| `neighborhoods` | `properties` | 1:N | Property location | ON DELETE RESTRICT |
| `properties` | `property_images` | 1:N | Property photos | ON DELETE CASCADE |
| `properties` | `inquiries` | 1:N | Property inquiries | ON DELETE SET NULL |
| `properties` | `testimonials` | 1:N | Property reviews | ON DELETE SET NULL |
| `neighborhoods` | `seo_pages` | 1:N | Neighborhood pages | ON DELETE SET NULL |
| `property_categories` | `seo_pages` | 1:N | Category pages | ON DELETE SET NULL |

### Many-to-Many Relationship

```
properties ◄──────► property_property_features ◄──────► property_features
   (N)                    (Junction Table)                    (M)
```

Properties can have multiple features, and features can belong to multiple properties.

---

## 📐 Data Flow Architecture

### Property Creation Flow

```
1. Admin User (auth.users)
   └─> Creates Property (properties)
       ├─> Links Category (property_categories)
       ├─> Links Neighborhood (neighborhoods)
       ├─> Uploads Images (property_images)
       │   └─> One marked as primary (is_primary=true)
       ├─> Assigns Features (property_property_features)
       │   └─> Links to (property_features)
       └─> Auto-generates:
           ├─> Slug (via trigger: set_property_slug)
           └─> Search Vector (via trigger: update_property_search_vector)
```

### Inquiry Flow

```
1. Public User Submits Inquiry (inquiries)
   ├─> Optional: Links to Property (property_id)
   ├─> Status: new
   └─> Stored with UTM tracking

2. Admin Reviews Inquiry
   ├─> Assigns to Agent (assigned_to)
   ├─> Status: in_progress
   └─> Adds admin_notes

3. Agent Responds
   ├─> Status: responded
   ├─> Sets responded_at timestamp
   └─> Eventually: closed
```

### Testimonial Flow

```
1. Admin Creates Testimonial (testimonials)
   ├─> Optional: Links to Property (property_id)
   ├─> Sets rating (1-5)
   └─> is_published: false (default)

2. Auto-Approval Trigger
   └─> If rating >= 4
       └─> Sets is_published: true (automatically)

3. Admin Can Override
   ├─> Manually publish/unpublish
   └─> Mark as featured
```

### Search Flow

```
1. User Enters Search Query
   ├─> Calls: search_properties_v2()
   ├─> Parameters:
   │   ├─> p_search_term (text)
   │   ├─> p_category_id (filter)
   │   ├─> p_neighborhood_id (filter)
   │   ├─> p_operation_type (sale/rent)
   │   ├─> p_min_price / p_max_price
   │   └─> p_min_area / p_max_area
   └─> Returns:
       ├─> Matching properties
       ├─> Relevance rank (ts_rank)
       └─> Ordered by rank DESC

2. Full-Text Search
   └─> Uses: properties.search_vector (tsvector)
       ├─> Title (weight A - highest)
       ├─> Description (weight B)
       └─> Address (weight C)
```

---

## 🔐 Security Architecture

### Row Level Security (RLS) Model

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC ACCESS (Unauthenticated)          │
├─────────────────────────────────────────────────────────────┤
│ ✅ SELECT: properties (WHERE status='available')            │
│ ✅ SELECT: property_images (for available properties)       │
│ ✅ SELECT: property_categories (WHERE is_active=true)       │
│ ✅ SELECT: property_features (WHERE is_active=true)         │
│ ✅ SELECT: neighborhoods (all)                              │
│ ✅ SELECT: testimonials (WHERE is_published=true)           │
│ ✅ SELECT: seo_pages (WHERE is_published=true)              │
│ ✅ INSERT: inquiries (submit inquiry)                       │
│ ❌ All other operations: DENIED                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATED USER                        │
├─────────────────────────────────────────────────────────────┤
│ ✅ UPDATE: admin_profiles (own profile only)                │
│ ✅ All PUBLIC permissions above                             │
│ ❌ Admin operations: DENIED (unless is_admin()=true)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ADMIN USER (is_admin()=true)             │
├─────────────────────────────────────────────────────────────┤
│ ✅ FULL ACCESS to all tables (SELECT, INSERT, UPDATE, DELETE)│
│ ✅ View all admin_profiles                                  │
│ ✅ Manage properties, images, categories, features          │
│ ✅ Manage inquiries, testimonials, seo_pages                │
│ ✅ Assign inquiries to agents                               │
│ ✅ Publish/unpublish content                                │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Functions

- **`is_admin()`**: Returns TRUE if current user exists in admin_profiles
- **`get_current_admin_role()`**: Returns role (admin/agent/manager) or NULL

---

## 🚀 Automatic Features (Triggers)

### Properties Table

| Trigger | Event | Action |
|---------|-------|--------|
| `trigger_set_property_slug` | INSERT/UPDATE | Auto-generate SEO slug from category, rooms, neighborhood |
| `update_properties_search_vector` | INSERT/UPDATE | Auto-update full-text search index from title, description, address |
| `update_properties_updated_at` | UPDATE | Auto-update `updated_at` timestamp |

**Example**: Creating property with `rooms=3`, `category_id=1` (Apartment), `neighborhood_id=5` (Center) automatically generates slug: `apartament-3-stai-centur`

### Property Images Table

| Trigger | Event | Action |
|---------|-------|--------|
| `ensure_single_primary_image_trigger` | INSERT/UPDATE | Ensure only one image per property is marked `is_primary=true` |

**Example**: When setting a new image as primary, all other images for that property automatically become non-primary.

### Testimonials Table

| Trigger | Event | Action |
|---------|-------|--------|
| `auto_approve_high_rated_testimonials` | INSERT | Auto-publish testimonials with rating ≥ 4 stars |

**Example**: Admin creates testimonial with 5 stars → automatically published. 3 stars → remains unpublished for manual review.

### Timestamp Triggers

All tables with `updated_at` column:
- `admin_profiles`
- `properties`
- `inquiries`
- `testimonials`
- `seo_pages`

Auto-update `updated_at` to `NOW()` on every UPDATE.

---

## 📊 Index Strategy

### B-Tree Indexes (Standard Lookups)

- **Primary Keys**: Automatic on all tables
- **Foreign Keys**: All FK columns (neighborhood_id, category_id, etc.)
- **Status Fields**: Filtered indexes for common WHERE clauses
- **Timestamps**: For sorting (created_at DESC, updated_at DESC)
- **Slugs**: Unique indexes for URL lookups

### GIN Indexes (Advanced Search)

- **Full-Text Search**: `properties.search_vector` (tsvector)
- **JSONB**: `properties.features`, `properties.amenities`, `neighborhoods.amenities`
- **Trigram Search**: Via pg_trgm extension for fuzzy matching

### Filtered Indexes (Conditional)

- `WHERE is_featured = TRUE` (properties)
- `WHERE is_primary = TRUE` (property_images)
- `WHERE is_active = TRUE` (property_categories, property_features)
- `WHERE slug IS NOT NULL` (properties - unique slugs)

### Composite Indexes (Multi-Column)

- `(latitude, longitude)` - Geographic queries
- `(center_lat, center_lng)` - Neighborhood coordinates
- `(property_id, feature_id)` - Junction table PK

---

## 🎯 Performance Optimization

### Query Optimization Features

1. **Full-Text Search**: Bulgarian language support with weighted vectors
2. **Indexed Foreign Keys**: Fast JOINs on all relationships
3. **Filtered Indexes**: Reduce index size for common queries
4. **JSONB Indexing**: Fast queries on dynamic feature data
5. **Composite Indexes**: Optimize multi-column searches

### Caching Strategy

- **Search Results**: Cache frequently searched categories/neighborhoods
- **Featured Properties**: Cache for homepage display
- **SEO Pages**: Cache static landing pages
- **Categories/Features**: Rarely change - aggressive caching

### View Tracking

- `properties.view_count` - Simple counter
- `properties.last_viewed_at` - Timestamp for analytics
- `seo_pages.view_count` - Track landing page performance
- Function: `increment_property_view(property_id)` - Atomic increment

---

## 📱 Application Integration

### Next.js API Routes

```
/api/properties → properties table
/api/properties/[id] → Single property with images + features
/api/properties/search → search_properties_v2()
/api/categories → property_categories
/api/neighborhoods → neighborhoods
/api/inquiries → inquiries (POST)
/api/admin/* → Full CRUD (requires is_admin())
```

### TypeScript Type Generation

```bash
supabase gen types typescript --project-id <project-id> \
  > src/types/database.generated.ts
```

Generates TypeScript types for:
- All table schemas
- ENUM types
- Function parameters
- RLS policy types

---

## 🔄 Data Lifecycle

### Property Lifecycle

```
Created (status='available')
  ├─> is_new = true (for first 7 days)
  ├─> is_featured = false (admin can promote)
  └─> view_count = 0

Status Transitions:
available → under_offer → sold/rented → archived
```

### Inquiry Lifecycle

```
new (submitted by user)
  └─> assigned_to = NULL

in_progress (assigned to agent)
  └─> assigned_to = <agent_uuid>

responded (agent responded)
  └─> responded_at = NOW()

closed (resolved)
  └─> Final state
```

---

**Database Schema Version**: 1.0  
**Last Updated**: October 20, 2025  
**Total Complexity**: Medium-High  
**Maintenance Level**: Low (highly automated)







