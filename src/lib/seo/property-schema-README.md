# Property Schema.org Implementation

This document explains the property-specific structured data implementation for Nova Nest Real Estate.

## Files Created

### 1. `src/lib/seo/property-schema.ts`
Contains the core schema generation functions:

- **`generatePropertySchema(property)`** - Main function for individual property pages
- **`generatePropertyListSchema(properties)`** - For property listing pages
- **`generatePropertyBreadcrumbSchema(property)`** - For breadcrumb navigation

### 2. `src/components/seo/PropertySchema.tsx`
React components for rendering structured data:

- **`PropertySchema`** - Individual property schema
- **`PropertyBreadcrumbSchema`** - Breadcrumb schema
- **`PropertyDetailSchema`** - Combined schema (recommended for property pages)

## Schema Structure

### Product Schema (Main)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://novanest.bg/properties/123",
  "name": "Property Title",
  "description": "Property description (truncated to 500 chars)",
  "image": ["image1.jpg", "image2.jpg"],
  "brand": {
    "@type": "Organization",
    "name": "Nova Nest Real Estate"
  },
  "offers": {
    "@type": "Offer",
    "price": 150000,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2024-04-15T00:00:00.000Z",
    "url": "https://novanest.bg/properties/123",
    "seller": {
      "@type": "RealEstateAgent",
      "name": "Nova Nest Real Estate"
    }
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Тип имот",
      "value": "Апартамент"
    },
    {
      "@type": "PropertyValue",
      "name": "Площ",
      "value": "85 кв.м",
      "unitCode": "MTK"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Пример 123",
    "addressLocality": "Стара Загора",
    "addressRegion": "Стара Загора",
    "postalCode": "6000",
    "addressCountry": "BG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 42.4258,
    "longitude": 25.6347
  }
}
```

## Implementation

### Property Detail Pages
```tsx
import { PropertyDetailSchema } from '@/components/seo/PropertySchema';

export default function PropertyPage({ property }) {
  return (
    <div>
      <PropertyDetailSchema property={property} />
      {/* Rest of your page content */}
    </div>
  );
}
```

### Property Listing Pages
```tsx
import { generatePropertyListSchema } from '@/lib/seo/property-schema';

export default function PropertyListPage({ properties }) {
  const schema = generatePropertyListSchema(properties);
  
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema)
        }}
      />
      {/* Rest of your page content */}
    </div>
  );
}
```

## Features Included

### ✅ Basic Product Information
- Property title and description
- All property images
- Brand information (Nova Nest Real Estate)

### ✅ Pricing Information
- Price in EUR
- Availability status
- Price validity (90 days)
- Seller information

### ✅ Property Details (additionalProperty)
- Property type (Тип имот)
- Neighborhood (Квартал)
- Area (Площ) with unit code
- Rooms (Брой стаи)
- Bedrooms (Спални)
- Bathrooms (Бани)
- Floor (Етаж)
- Operation type (Тип операция)

### ✅ Location Information
- Full address in Bulgarian
- GPS coordinates (if available)
- Stara Zagora location details

### ✅ Navigation
- Breadcrumb schema for site structure
- Proper URL structure

## Benefits

### 🎯 Rich Search Results
- Properties appear with price, images, and location
- "For Sale" or "For Rent" badges
- Image carousel in Google search results
- Better click-through rates

### 🎯 Google Maps Integration
- Properties appear in local search results
- GPS coordinates for precise location
- Address information for directions

### 🎯 Enhanced Visibility
- Structured data helps Google understand content
- Better ranking for property-related searches
- Rich snippets increase click-through rates

## Testing

Use these tools to validate your structured data:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/
3. **Google Search Console**: Monitor rich results performance

## Notes

- Description is automatically truncated to 500 characters for SEO optimization
- All Bulgarian text is properly encoded
- GPS coordinates are only included if available
- Price validity is set to 90 days from generation
- Images are filtered to remove empty URLs
- All optional fields are handled gracefully with null checks
