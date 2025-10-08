# Breadcrumb Navigation Fix

## Problem
Breadcrumb navigation on property detail pages was broken - clicking on any breadcrumb item resulted in 404 errors.

## Root Causes

### 1. Non-Existent Category Pages
The breadcrumb helper (`src/lib/seo/breadcrumb-helpers.ts`) was generating links to category pages that don't exist in the application:
- `/apartamenti-stara-zagora` (Apartments)
- `/kushi-stara-zagora` (Houses)
- `/ofisi-stara-zagora` (Offices)
- etc.

### 2. URL Format Issues
While the Breadcrumb components used Next.js `<Link>` components (which expect relative paths), the breadcrumb helper was generating full absolute URLs with domain names (e.g., `https://novanest.bg/properties`).

## Solution

### 1. Updated Breadcrumb Generation Logic
**File:** `src/lib/seo/breadcrumb-helpers.ts`

Changed the `getPropertyBreadcrumbs()` function to:
- Remove non-existent category breadcrumb links
- Link directly to neighborhood landing pages (which DO exist at `/[neighborhood-slug]`)
- Simplified the breadcrumb path to: **Home > Properties > Neighborhood > Property**

**Before:**
```
Home > Properties > Category > Neighborhood > Property
                     ^^^^^^^^
                     (404 - doesn't exist)
```

**After:**
```
Home > Properties > Neighborhood > Property
                    ^^^^^^^^^^^^
                    (exists at /[neighborhood-slug])
```

### 2. Updated Breadcrumb Components with URL Conversion
**File:** `src/components/ui/Breadcrumbs.tsx`

Added a `getRelativePath()` helper function to all three breadcrumb components:
- `Breadcrumbs` (main component)
- `CompactBreadcrumbs`
- `BreadcrumbsWithHome`

This function converts full URLs to relative paths for proper Next.js Link navigation:
```typescript
const getRelativePath = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname; // e.g., 'https://novanest.bg/properties' -> '/properties'
  } catch {
    return url; // Already a relative path
  }
};
```

## Breadcrumb Structure

### Property Detail Pages
Now generates the following breadcrumb path:

1. **Начало** (Home) → `/`
2. **Имоти** (Properties) → `/properties`
3. **[Neighborhood Name]** → `/[neighborhood-slug]` (if neighborhood exists)
4. **[Property Title]** → `/properties/[id]` (current page)

Example:
```
Начало > Имоти > Център > Тристаен апартамент в център
  /    /properties  /centur  (current page)
```

### Neighborhood Landing Pages
Breadcrumb path remains the same:

1. **Начало** (Home) → `/`
2. **Имоти** (Properties) → `/properties`
3. **Имоти в [Neighborhood Name]** → `/[neighborhood-slug]` (current page)

## Files Modified

1. ✅ `src/lib/seo/breadcrumb-helpers.ts` - Updated breadcrumb generation logic
2. ✅ `src/components/ui/Breadcrumbs.tsx` - Added URL-to-path conversion for all variants

## Files NOT Modified (Working As Expected)

- `src/lib/seo/neighborhood-breadcrumbs.ts` - Already working correctly
- `src/components/seo/BreadcrumbSchema.tsx` - Schema.org structured data (requires full URLs)
- `src/app/properties/[id]/page.tsx` - No changes needed
- `src/app/[neighborhood-slug]/page.tsx` - No changes needed

## Benefits of This Approach

### 1. SEO Benefits Preserved
- Structured data (JSON-LD) still uses full absolute URLs (required by Google)
- Visual breadcrumbs use relative paths for navigation

### 2. User Experience Improved
- All breadcrumb links now work correctly
- Navigation flows naturally through existing pages
- No more 404 errors

### 3. Code Maintainability
- Removed references to non-existent category pages
- Centralized URL conversion logic in reusable helper function
- Clear separation between SEO schema (absolute URLs) and UI navigation (relative paths)

## Testing Checklist

- [x] Breadcrumb on property detail page shows: Home > Imoti > Neighborhood > Property
- [x] Clicking "Начало" (Home) navigates to `/`
- [x] Clicking "Имоти" (Properties) navigates to `/properties`
- [x] Clicking neighborhood name navigates to `/[neighborhood-slug]`
- [x] Current property title is not a link (last breadcrumb item)
- [x] No 404 errors when clicking breadcrumb links
- [x] Breadcrumb structured data (JSON-LD) still uses absolute URLs for SEO

## Future Enhancements (Optional)

If category pages are added in the future:
1. Create route files at `src/app/apartamenti-stara-zagora/page.tsx` (etc.)
2. Update `getPropertyBreadcrumbs()` to include category breadcrumb
3. Update breadcrumb structure to: Home > Properties > Category > Neighborhood > Property

For now, the simplified path works perfectly with the existing route structure.

