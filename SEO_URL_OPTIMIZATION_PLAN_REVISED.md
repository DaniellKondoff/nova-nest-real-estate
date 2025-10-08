# SEO URL Optimization Plan (REVISED for Dynamic Categories)

## ⚠️ Key Change from Original Plan

**Original Assumption:** Property types are static enums
**Reality:** Property types are stored in `property_categories` table with dynamic slugs

This revision updates the implementation to use the existing `property_categories.slug` field instead of hardcoded mappings.

---

## Database Schema Analysis

### Existing Schema (✅ Already Perfect!)

```typescript
// property_categories table
{
  id: number;
  name_bg: string;        // e.g., "Апартаменти", "Къщи"
  name_en: string | null;
  slug: string;           // e.g., "apartamenti", "kashi" 
  description_bg: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

// properties table (current)
{
  id: number;
  category_id: number;    // FK to property_categories
  neighborhood_id: number; // FK to neighborhoods
  title_bg: string;
  rooms: number | null;
  // ... other fields
  // ❌ slug: MISSING (we'll add this)
}

// neighborhoods table
{
  id: number;
  name_bg: string;
  slug: string;           // e.g., "centur", "iztok"
  // ... other fields
}
```

---

## Revised Implementation Plan

### Phase 1: Database Schema Update (REVISED)

#### 1.1 Add `slug` Column to Properties Table
```sql
-- Migration: Add slug column to properties table
ALTER TABLE properties 
ADD COLUMN slug TEXT;

-- Create index for slug lookups
CREATE INDEX idx_properties_slug ON properties(slug);

-- Add constraint: slug must be unique when not null
CREATE UNIQUE INDEX idx_properties_slug_unique 
ON properties(slug) 
WHERE slug IS NOT NULL;
```

#### 1.2 Create Slug Generation Function (REVISED - Uses Dynamic Categories)
```sql
-- Function to generate SEO-friendly slug from property data
-- This version uses the category slug from property_categories table
CREATE OR REPLACE FUNCTION generate_property_slug(
  p_category_id INTEGER,
  p_rooms INTEGER,
  p_neighborhood_id INTEGER
) RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_category_slug TEXT;
  v_neighborhood_slug TEXT;
  v_rooms_part TEXT := '';
BEGIN
  -- Get category slug from property_categories table
  SELECT slug INTO v_category_slug
  FROM property_categories
  WHERE id = p_category_id;
  
  -- Get neighborhood slug from neighborhoods table
  SELECT slug INTO v_neighborhood_slug
  FROM neighborhoods
  WHERE id = p_neighborhood_id;
  
  -- Handle missing data
  IF v_category_slug IS NULL THEN
    v_category_slug := 'imot';
  END IF;
  
  IF v_neighborhood_slug IS NULL THEN
    v_neighborhood_slug := 'stara-zagora';
  END IF;
  
  -- Add rooms if available and relevant (typically for apartments/houses)
  -- You can extend this logic based on category type
  IF p_rooms IS NOT NULL AND p_rooms > 0 THEN
    v_rooms_part := '-' || p_rooms::TEXT || '-stai';
  END IF;
  
  -- Combine parts: category-rooms-neighborhood
  v_slug := v_category_slug || v_rooms_part || '-' || v_neighborhood_slug;
  
  -- Clean up any double dashes
  v_slug := REGEXP_REPLACE(v_slug, '-+', '-', 'g');
  
  -- Remove leading/trailing dashes
  v_slug := TRIM(BOTH '-' FROM v_slug);
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql STABLE;
```

#### 1.3 Create Trigger for Auto Slug Generation (NEW!)
```sql
-- Trigger function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is not manually set
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_property_slug(
      NEW.category_id,
      NEW.rooms,
      NEW.neighborhood_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_property_slug ON properties;
CREATE TRIGGER trigger_set_property_slug
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_property_slug();
```

#### 1.4 Populate Existing Slugs (REVISED)
```sql
-- Update existing properties with generated slugs
UPDATE properties
SET slug = generate_property_slug(
  category_id,
  rooms,
  neighborhood_id
)
WHERE slug IS NULL;

-- Verify slug generation
SELECT 
  p.id,
  p.title_bg,
  pc.name_bg as category,
  pc.slug as category_slug,
  p.rooms,
  n.name_bg as neighborhood,
  n.slug as neighborhood_slug,
  p.slug as generated_slug
FROM properties p
LEFT JOIN property_categories pc ON p.category_id = pc.id
LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
LIMIT 20;
```

---

### Phase 2: TypeScript Utilities (REVISED)

#### 2.1 Simplified Slug Utility (No Hardcoded Mappings!)
```typescript
// src/lib/seo/property-slug.ts

/**
 * Generates SEO-friendly slug for a property
 * Uses category slug from database (no hardcoded mappings!)
 * 
 * @param property - Property data with category and neighborhood slugs
 * @returns Generated slug (without ID)
 */
export function generatePropertySlug(property: {
  categorySlug: string;      // From property_categories.slug
  rooms?: number | null;
  neighborhoodSlug: string;  // From neighborhoods.slug
}): string {
  const parts: string[] = [];
  
  // 1. Property category slug (from database)
  parts.push(property.categorySlug);
  
  // 2. Rooms (if available)
  if (property.rooms && property.rooms > 0) {
    parts.push(`${property.rooms}-stai`);
  }
  
  // 3. Neighborhood slug (from database)
  parts.push(property.neighborhoodSlug);
  
  // 4. Clean and join
  const slug = parts
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  
  return slug;
}

/**
 * Combines property ID with slug for full URL path
 * @param id - Property ID
 * @param slug - Property slug
 * @returns Full URL-safe path segment (e.g., "11-apartamenti-3-stai-centur")
 */
export function getPropertyUrlSlug(id: number, slug: string): string {
  return `${id}-${slug}`;
}

/**
 * Extracts property ID from URL slug
 * @param urlSlug - Full URL slug (e.g., "11-apartamenti-3-stai-centur")
 * @returns Property ID or null if invalid
 */
export function extractPropertyId(urlSlug: string): number | null {
  const match = urlSlug.match(/^(\d+)-/);
  if (!match) return null;
  
  const id = parseInt(match[1], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Validates if URL slug matches expected format
 * @param urlSlug - URL slug to validate
 * @returns true if valid format
 */
export function isValidPropertySlug(urlSlug: string): boolean {
  // Format: {id}-{slug}
  // e.g., "11-apartamenti-3-stai-centur" or "25-kashi-iztok"
  return /^\d+-[a-z0-9\-]+$/.test(urlSlug);
}
```

---

### Phase 3: Database Query Updates (REVISED)

#### 3.1 Update Property Queries to Include Slugs
```typescript
// src/lib/queries/properties.ts

export type PropertyWithSlugData = PropertyWithRelations & {
  category_slug?: string;
  neighborhood_slug?: string;
};

/**
 * Fetch property with all data needed for URL generation
 */
export async function getPropertyWithSlugData(
  id: number
): Promise<PropertyWithSlugData | null> {
  const supabase = getBrowserClient();
  
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_categories!inner(slug),
      neighborhoods!inner(slug),
      images:property_images(*),
      features:property_property_features(
        feature_id,
        property_features(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching property:", error);
    return null;
  }

  // Extract slugs from joined tables
  const property = {
    ...data,
    category_slug: (data.property_categories as any)?.slug,
    neighborhood_slug: (data.neighborhoods as any)?.slug,
  };

  return property as PropertyWithSlugData;
}

/**
 * Fetch properties for listing with slug data
 */
export async function getPropertiesWithSlugs(
  filters?: SearchFilters
): Promise<PropertyWithSlugData[]> {
  const supabase = getBrowserClient();
  
  let query = supabase
    .from("properties")
    .select(`
      *,
      property_categories!inner(slug),
      neighborhoods!inner(slug),
      property_images(url, alt_text_bg, is_primary)
    `)
    .eq("status", "available")
    .order("created_at", { ascending: false });

  // Apply filters...
  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  
  if (filters?.neighborhoodId) {
    query = query.eq("neighborhood_id", filters.neighborhoodId);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching properties:", error);
    return [];
  }

  // Transform data to include slugs
  return data.map(property => ({
    ...property,
    category_slug: (property.property_categories as any)?.slug,
    neighborhood_slug: (property.neighborhoods as any)?.slug,
  }));
}
```

---

### Phase 4: Admin Panel Updates (REVISED)

#### 4.1 Auto-generate Slug on Property Save (REVISED)
```typescript
// src/app/admin/properties/create/page.tsx
// src/app/admin/properties/[id]/edit/page.tsx

import { generatePropertySlug } from '@/lib/seo/property-slug';

const handleSave = async (formData: PropertyFormData) => {
  // Fetch category and neighborhood slugs
  const { data: category } = await supabase
    .from('property_categories')
    .select('slug')
    .eq('id', formData.category_id)
    .single();
    
  const { data: neighborhood } = await supabase
    .from('neighborhoods')
    .select('slug')
    .eq('id', formData.neighborhood_id)
    .single();

  // Generate slug (optional - can also let DB trigger handle it)
  const slug = category && neighborhood ? generatePropertySlug({
    categorySlug: category.slug,
    rooms: formData.rooms,
    neighborhoodSlug: neighborhood.slug,
  }) : null;
  
  const propertyData = {
    ...formData,
    slug, // Include generated slug (or let DB trigger generate it)
  };
  
  // Save to database
  const { error } = await supabase
    .from('properties')
    .insert(propertyData);
    
  if (error) {
    console.error('Error saving property:', error);
  }
};
```

#### 4.2 Property Form with Dynamic Slug Preview
```typescript
// src/components/admin/PropertyForm.tsx

export default function PropertyForm({ property }: PropertyFormProps) {
  const [slug, setSlug] = useState(property?.slug || '');
  const [categorySlug, setCategorySlug] = useState('');
  const [neighborhoodSlug, setNeighborhoodSlug] = useState('');
  
  // Fetch category slug when category changes
  const handleCategoryChange = async (categoryId: number) => {
    const { data } = await supabase
      .from('property_categories')
      .select('slug')
      .eq('id', categoryId)
      .single();
      
    if (data) {
      setCategorySlug(data.slug);
      updateSlugPreview();
    }
  };
  
  // Fetch neighborhood slug when neighborhood changes
  const handleNeighborhoodChange = async (neighborhoodId: number) => {
    const { data } = await supabase
      .from('neighborhoods')
      .select('slug')
      .eq('id', neighborhoodId)
      .single();
      
    if (data) {
      setNeighborhoodSlug(data.slug);
      updateSlugPreview();
    }
  };
  
  // Auto-generate slug preview
  const updateSlugPreview = () => {
    if (categorySlug && neighborhoodSlug) {
      const generatedSlug = generatePropertySlug({
        categorySlug,
        rooms: formData.rooms,
        neighborhoodSlug,
      });
      setSlug(generatedSlug);
    }
  };
  
  return (
    <form>
      {/* Category Select */}
      <select onChange={(e) => handleCategoryChange(Number(e.target.value))}>
        {/* categories */}
      </select>
      
      {/* Neighborhood Select */}
      <select onChange={(e) => handleNeighborhoodChange(Number(e.target.value))}>
        {/* neighborhoods */}
      </select>
      
      {/* Rooms Input */}
      <input 
        type="number" 
        onChange={(e) => {
          setFormData({ ...formData, rooms: Number(e.target.value) });
          updateSlugPreview();
        }}
      />
      
      {/* Slug Field (auto-generated but editable) */}
      <div>
        <label>URL Slug (Auto-generated)</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="apartamenti-3-stai-centur"
        />
        <p className="text-sm text-gray-500">
          Preview: /properties/{property?.id || 'NEW'}-{slug}
        </p>
        <p className="text-xs text-gray-400">
          Leave empty to auto-generate from category, rooms, and neighborhood
        </p>
      </div>
    </form>
  );
}
```

---

### Phase 5: URL Examples with Real Categories

Based on your `property_categories` table, here are realistic examples:

```bash
# If you have categories like:
# - "Апартаменти" (slug: "apartamenti")
# - "Къщи" (slug: "kashi")
# - "Офиси" (slug: "ofisi")
# - "Гаражи" (slug: "garazhi")

# URLs will be:
/properties/11-apartamenti-3-stai-centur
/properties/25-kashi-iztok
/properties/33-ofisi-centur
/properties/45-garazhi-studentski
/properties/67-apartamenti-2-stai-mladost
```

**Note:** The exact slug format depends on what slugs you've set in `property_categories` table!

---

## Key Advantages of This Revised Approach

### 1. **Fully Dynamic** 🔄
- ✅ No hardcoded property type mappings
- ✅ Add new categories anytime without code changes
- ✅ Change category slugs in database only

### 2. **Database-Driven** 💾
- ✅ Slugs generated automatically via DB trigger
- ✅ Consistent slug generation (DB function)
- ✅ No client/server slug mismatch

### 3. **Easy Maintenance** 🛠️
- ✅ Update category slug in one place (database)
- ✅ All property URLs update automatically
- ✅ No code deployment needed for category changes

### 4. **Backwards Compatible** 🔄
- ✅ Works with existing `property_categories.slug`
- ✅ Works with existing `neighborhoods.slug`
- ✅ No breaking changes to existing data

---

## Migration Script Example

```sql
-- Complete migration script
BEGIN;

-- 1. Add slug column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug_unique 
  ON properties(slug) WHERE slug IS NOT NULL;

-- 3. Create slug generation function
CREATE OR REPLACE FUNCTION generate_property_slug(
  p_category_id INTEGER,
  p_rooms INTEGER,
  p_neighborhood_id INTEGER
) RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_category_slug TEXT;
  v_neighborhood_slug TEXT;
  v_rooms_part TEXT := '';
BEGIN
  SELECT slug INTO v_category_slug FROM property_categories WHERE id = p_category_id;
  SELECT slug INTO v_neighborhood_slug FROM neighborhoods WHERE id = p_neighborhood_id;
  
  IF v_category_slug IS NULL THEN v_category_slug := 'imot'; END IF;
  IF v_neighborhood_slug IS NULL THEN v_neighborhood_slug := 'stara-zagora'; END IF;
  
  IF p_rooms IS NOT NULL AND p_rooms > 0 THEN
    v_rooms_part := '-' || p_rooms::TEXT || '-stai';
  END IF;
  
  v_slug := v_category_slug || v_rooms_part || '-' || v_neighborhood_slug;
  v_slug := REGEXP_REPLACE(v_slug, '-+', '-', 'g');
  v_slug := TRIM(BOTH '-' FROM v_slug);
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Create trigger
CREATE OR REPLACE FUNCTION set_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_property_slug(NEW.category_id, NEW.rooms, NEW.neighborhood_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_property_slug ON properties;
CREATE TRIGGER trigger_set_property_slug
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_property_slug();

-- 5. Populate existing slugs
UPDATE properties
SET slug = generate_property_slug(category_id, rooms, neighborhood_id)
WHERE slug IS NULL;

-- 6. Verify
SELECT 
  p.id,
  pc.name_bg as category,
  pc.slug as cat_slug,
  p.rooms,
  n.name_bg as neighborhood,
  n.slug as nbh_slug,
  p.slug
FROM properties p
LEFT JOIN property_categories pc ON p.category_id = pc.id
LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
LIMIT 10;

COMMIT;
```

---

## Testing Checklist (Updated)

### Database Tests
- [ ] Verify all `property_categories` have valid slugs
- [ ] Verify all `neighborhoods` have valid slugs
- [ ] Test slug generation function with various inputs
- [ ] Test trigger creates slugs for new properties
- [ ] Test trigger updates slugs when category/neighborhood changes
- [ ] Verify slug uniqueness constraint

### Application Tests
- [ ] Property URLs include category slug from database
- [ ] Changing category in admin updates slug automatically
- [ ] Changing neighborhood in admin updates slug automatically
- [ ] Old numeric URLs still work
- [ ] Old URLs redirect to new slugged URLs
- [ ] Sitemap includes all property slugs

---

## What Changed from Original Plan?

### ❌ Removed (Hardcoded Approach)
```typescript
// REMOVED: Hardcoded mapping
const PROPERTY_TYPE_SLUGS: Record<string, string> = {
  'Апартаменти': 'apartament',
  'Къщи': 'kasha',
  // ...
};
```

### ✅ Added (Dynamic Approach)
```typescript
// NEW: Fetch from database
const { data: category } = await supabase
  .from('property_categories')
  .select('slug')
  .eq('id', categoryId)
  .single();

const slug = generatePropertySlug({
  categorySlug: category.slug, // From database!
  rooms,
  neighborhoodSlug
});
```

---

## Next Steps

1. **Review Current Categories**
   ```sql
   SELECT id, name_bg, slug, is_active 
   FROM property_categories 
   ORDER BY sort_order;
   ```
   - Verify all categories have good slugs
   - Update any that need improvement

2. **Review Current Neighborhoods**
   ```sql
   SELECT id, name_bg, slug 
   FROM neighborhoods 
   ORDER BY name_bg;
   ```
   - Verify all neighborhoods have slugs

3. **Run Migration**
   - Execute the migration script
   - Verify slug generation

4. **Update Application Code**
   - Implement revised slug utilities
   - Update queries to join category/neighborhood slugs
   - Update admin forms

Would you like me to:
1. Check your current `property_categories` slugs and suggest improvements?
2. Create the complete migration script ready to run?
3. Implement any specific part of this revised plan?

