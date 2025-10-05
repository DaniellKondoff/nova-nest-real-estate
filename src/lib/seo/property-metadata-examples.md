# Property Metadata Generation Examples

This document provides examples of how the property metadata generation system works for Nova Nest Real Estate.

## Example Property Data

```typescript
const exampleProperty: PropertyWithDetails = {
  property: {
    id: 123,
    title_bg: 'Двустаен апартамент в Център',
    description_bg: 'Луксозно обзаведен апартамент в центъра на града с прекрасна гледка към парка. Модерна кухня, спалня с гардероб, дневна с тераса.',
    price_eur: 120000,
    operation_type: 'sale',
    area_sqm: 85,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    seo_description: null, // Will auto-generate
    seo_keywords: null,    // Will auto-generate
  },
  category: {
    name_bg: 'Апартамент'
  },
  neighborhood: {
    name_bg: 'Център'
  },
  images: [
    {
      url: 'https://example.com/apartment1.jpg',
      alt_text_bg: 'Двустаен апартамент в центъра',
      is_primary: true
    },
    {
      url: 'https://example.com/apartment2.jpg',
      alt_text_bg: 'Гледка от терасата',
      is_primary: false
    }
  ]
};
```

## Generated Metadata Examples

### 1. Page Title
```
"Двустаен апартамент в Център - Център, Стара Загора | Nova Nest"
```

### 2. Page Description
```
"Апартамент в Център, 85 кв.м, 2 стаи, 120,000 EUR. Луксозно обзаведен апартамент в центъра на града с прекрасна гледка към парка. Модерна кухня, спалня с гардероб, дневна с тераса..."
```

### 3. Auto-Generated Keywords
```javascript
[
  'апартамент',
  'апартамент център',
  'апартамент стара загора',
  'продажба',
  'център',
  'имоти център',
  'двустаен'
]
```

### 4. OpenGraph Configuration
```javascript
{
  title: "Двустаен апартамент в Център - Център, Стара Загора | Nova Nest",
  description: "Апартамент в Център, 85 кв.м, 2 стаи, 120,000 EUR. Луксозно обзаведен апартамент в центъра на града с прекрасна гледка към парка. Модерна кухня, спалня с гардероб, дневна с тераса...",
  url: "https://novanest.bg/properties/123",
  siteName: "Nova Nest Real Estate",
  locale: "bg_BG",
  type: "website",
  images: [
    {
      url: "https://example.com/apartment1.jpg",
      width: 1200,
      height: 630,
      alt: "Двустаен апартамент в центъра"
    }
  ]
}
```

### 5. Twitter Card Configuration
```javascript
{
  card: "summary_large_image",
  site: "@novanest_bg",
  creator: "@novanest_bg",
  title: "Двустаен апартамент в Център - Център, Стара Загора | Nova Nest",
  description: "Апартамент в Център, 85 кв.м, 2 стаи, 120,000 EUR. Луксозно обзаведен апартамент в центъра на града с прекрасна гледка към парка. Модерна кухня, спалня с гардероб, дневна с тераса...",
  images: ["https://example.com/apartment1.jpg"]
}
```

## Edge Cases Handled

### 1. Property with No Images
```typescript
const propertyWithoutImages = {
  // ... other property data
  images: []
};
```
**Result**: Uses default OpenGraph image from SEO_CONFIG

### 2. Property with Missing Optional Fields
```typescript
const propertyWithMissingFields = {
  property: {
    // ... other fields
    area_sqm: null,
    rooms: null,
    price_eur: null
  }
};
```
**Result**: Gracefully handles missing fields in description generation

### 3. Property with Custom SEO Data
```typescript
const propertyWithCustomSEO = {
  property: {
    // ... other fields
    seo_description: "Специално описаниe за този имот",
    seo_keywords: "апартамент, център, луксозен, модерен"
  }
};
```
**Result**: Uses custom SEO data instead of auto-generated content

### 4. Property Not Found
```typescript
// When property is not found
generatePropertyNotFoundMetadata("999");
```
**Result**: Returns appropriate 404 metadata with noindex

## Price Formatting Examples

```javascript
formatPrice(120000)  // "120,000 EUR"
formatPrice(85000)   // "85,000 EUR"
formatPrice(0)       // "Цена по договаряне"
formatPrice(null)    // "Цена по договаряне"
```

## Usage in Page Components

```typescript
// app/properties/[id]/page.tsx
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  try {
    const { id } = await params;
    const idNum = validateIdOrNotFound(id);
    const details = await fetchPropertyDetails(idNum);
    
    if (!details) {
      return generatePropertyNotFoundMetadata(id);
    }

    return generatePropertyMetadata(details);
  } catch (error) {
    console.error('Error generating property metadata:', error);
    const { id } = await params;
    return generatePropertyNotFoundMetadata(id);
  }
}
```

## Benefits

1. **SEO Optimized**: Comprehensive metadata for search engines
2. **Social Media Ready**: Optimized OpenGraph and Twitter cards
3. **Bulgarian Localized**: Proper Bulgarian text handling
4. **Edge Case Safe**: Handles missing data gracefully
5. **Customizable**: Supports custom SEO descriptions and keywords
6. **Performance**: Efficient metadata generation
7. **Type Safe**: Full TypeScript support
