# Breadcrumb System for Nova Nest Real Estate

This document explains the comprehensive breadcrumb system implementation for navigation and SEO.

## Files Created

### 1. `src/lib/seo/breadcrumb-schema.ts`
Core schema generation functions:
- **`generateBreadcrumbSchema(items)`** - Main function for BreadcrumbList schema
- **`validateBreadcrumbItems(items)`** - Validates breadcrumb items
- **`generateValidatedBreadcrumbSchema(items)`** - Schema with validation

### 2. `src/components/seo/BreadcrumbSchema.tsx`
React components for structured data:
- **`BreadcrumbSchema`** - Renders breadcrumb schema with validation
- **`BreadcrumbSchemaWithFallback`** - Renders schema even with invalid items

### 3. `src/lib/seo/breadcrumb-helpers.ts`
Helper functions for different page types:
- **`getPropertyBreadcrumbs(property)`** - Property detail pages
- **`getCategoryBreadcrumbs(categoryName)`** - Category pages
- **`getNeighborhoodBreadcrumbs(category, neighborhood)`** - Neighborhood pages
- **`getPropertiesBreadcrumbs()`** - Properties listing page
- **`getHomeBreadcrumbs()`** - Home page
- **`getAdminBreadcrumbs(sectionName)`** - Admin pages

### 4. `src/components/ui/Breadcrumbs.tsx`
Visual breadcrumb components:
- **`Breadcrumbs`** - Standard breadcrumb navigation
- **`CompactBreadcrumbs`** - Compact version for mobile
- **`BreadcrumbsWithHome`** - With home icon

## Schema Structure

### BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Начало",
      "item": "https://novanest.bg"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Имоти",
      "item": "https://novanest.bg/properties"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Апартаменти",
      "item": "https://novanest.bg/apartamenti-stara-zagora"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Център",
      "item": "https://novanest.bg/apartamenti-centrum-stara-zagora"
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Property Title",
      "item": "https://novanest.bg/properties/123"
    }
  ]
}
```

## Implementation Examples

### Property Detail Pages
```tsx
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getPropertyBreadcrumbs } from '@/lib/seo/breadcrumb-helpers';

export default function PropertyPage({ property }) {
  const breadcrumbs = getPropertyBreadcrumbs(property);
  
  return (
    <div>
      {/* Structured Data */}
      <BreadcrumbSchema items={breadcrumbs} />
      
      {/* Visual Navigation */}
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Rest of page content */}
    </div>
  );
}
```

### Category Pages
```tsx
import { getCategoryBreadcrumbs } from '@/lib/seo/breadcrumb-helpers';

export default function CategoryPage({ categoryName }) {
  const breadcrumbs = getCategoryBreadcrumbs(categoryName);
  
  return (
    <div>
      <BreadcrumbSchema items={breadcrumbs} />
      <Breadcrumbs items={breadcrumbs} />
    </div>
  );
}
```

### Properties Listing Page
```tsx
import { getPropertiesBreadcrumbs } from '@/lib/seo/breadcrumb-helpers';

export default function PropertiesPage() {
  const breadcrumbs = getPropertiesBreadcrumbs();
  
  return (
    <div>
      <BreadcrumbSchema items={breadcrumbs} />
      <Breadcrumbs items={breadcrumbs} />
    </div>
  );
}
```

## Breadcrumb Paths

### Property Detail Pages
**Path**: Home > Properties > Category > Neighborhood > Property Title
- **Home**: `https://novanest.bg`
- **Properties**: `https://novanest.bg/properties`
- **Category**: `https://novanest.bg/apartamenti-stara-zagora` (if available)
- **Neighborhood**: `https://novanest.bg/apartamenti-centrum-stara-zagora` (if available)
- **Property**: `https://novanest.bg/properties/123`

### Category Pages
**Path**: Home > Properties > Category
- **Home**: `https://novanest.bg`
- **Properties**: `https://novanest.bg/properties`
- **Category**: `https://novanest.bg/apartamenti-stara-zagora`

### Neighborhood Pages
**Path**: Home > Properties > Category > Neighborhood
- **Home**: `https://novanest.bg`
- **Properties**: `https://novanest.bg/properties`
- **Category**: `https://novanest.bg/apartamenti-stara-zagora`
- **Neighborhood**: `https://novanest.bg/apartamenti-centrum-stara-zagora`

## URL Slug Generation

### Category Slugs
```typescript
'Апартаменти' → 'apartamenti-stara-zagora'
'Къщи' → 'kushi-stara-zagora'
'Офиси' → 'ofisi-stara-zagora'
'Гаражи' → 'garazhi-stara-zagora'
'Парцели' → 'parceli-stara-zagora'
'Търговски' → 'targovski-stara-zagora'
```

### Neighborhood Slugs
```typescript
generateNeighborhoodSlug('Апартаменти', 'Център') → 'apartamenti-centrum-stara-zagora'
generateNeighborhoodSlug('Къщи', 'Изток') → 'kushi-iztok-stara-zagora'
```

## Visual Components

### Standard Breadcrumbs
```tsx
<Breadcrumbs items={breadcrumbs} />
```
- Navy color (#1a2642) for links
- Gold hover color (#d4af37)
- ChevronRight separators
- Last item not clickable

### Compact Breadcrumbs
```tsx
<CompactBreadcrumbs items={breadcrumbs} />
```
- Smaller text (text-xs)
- Simple '›' separators
- Good for mobile or tight spaces

### Breadcrumbs with Home Icon
```tsx
<BreadcrumbsWithHome items={breadcrumbs} />
```
- Home icon for first item
- Same styling as standard breadcrumbs

## Benefits

### 🎯 SEO Benefits
- **Rich Search Results**: Breadcrumbs appear in Google search results
- **Better Navigation**: Users understand page location
- **Improved CTR**: Enhanced search result appearance
- **Site Structure**: Google understands site hierarchy

### 🎯 User Experience
- **Clear Navigation**: Users know where they are
- **Easy Navigation**: Click to go back to any level
- **Consistent Design**: Uniform breadcrumb styling
- **Mobile Friendly**: Responsive design

### 🎯 Technical Benefits
- **Type Safety**: Full TypeScript support
- **Reusable**: Works across all page types
- **Maintainable**: Centralized breadcrumb logic
- **Validated**: Schema validation included

## Testing

Use these tools to validate breadcrumb structured data:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/
3. **Google Search Console**: Monitor breadcrumb performance

## Notes

- All breadcrumb text is in Bulgarian for local market
- URLs are generated for future category/neighborhood pages
- Schema validation ensures only valid breadcrumbs are rendered
- Visual components are fully responsive and accessible
- Last breadcrumb item is not clickable (current page)
- Position numbers are automatically generated and sorted
