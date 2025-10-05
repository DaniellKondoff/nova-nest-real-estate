# Structured Data Components

This directory contains Schema.org structured data components for Nova Nest Real Estate to enable rich search results in Google.

## Components

### OrganizationSchema
- **Purpose**: Provides business information to Google
- **Schema Type**: `RealEstateAgent`
- **Benefits**: 
  - Appears in Google Maps
  - Shows business hours, phone, address in search results
  - Enables star ratings and reviews
- **Usage**: Automatically included in root layout

### WebsiteSchema
- **Purpose**: Provides website information to Google
- **Schema Type**: `WebSite`
- **Benefits**:
  - Enables search box in Google search results
  - Helps Google understand site structure
- **Usage**: Automatically included in root layout

### PropertySchema
- **Purpose**: Provides individual property information
- **Schema Type**: `RealEstateListing`
- **Benefits**:
  - Rich property listings in search results
  - Shows price, location, features
- **Usage**: Add to individual property pages

### BreadcrumbSchema
- **Purpose**: Shows navigation structure
- **Schema Type**: `BreadcrumbList`
- **Benefits**:
  - Breadcrumb navigation in search results
  - Helps Google understand site hierarchy
- **Usage**: Add to pages with breadcrumb navigation

### FAQSchema
- **Purpose**: Provides FAQ information
- **Schema Type**: `FAQPage`
- **Benefits**:
  - FAQ rich results in search
  - Direct answers in search results
- **Usage**: Add to FAQ pages

## Implementation

### Automatic Components
The following components are automatically included in the root layout:
- `OrganizationSchema` - Business information
- `WebsiteSchema` - Website information

### Manual Components
Add these to specific pages as needed:

```tsx
import { PropertySchema, BreadcrumbSchema, FAQSchema } from '@/components/seo/StructuredData';

// Property page
<PropertySchema property={propertyData} />

// Page with breadcrumbs
<BreadcrumbSchema items={breadcrumbItems} />

// FAQ page
<FAQSchema faqs={faqData} />
```

## Testing

Use Google's Rich Results Test to validate your structured data:
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

## Configuration

All business information is pulled from `src/lib/seo/config.ts`. Update the following fields as needed:
- Business address (currently placeholder)
- Social media URLs
- Business hours
- Contact information

## Notes

- The address field contains a placeholder `'ул. [Your Address]'` - update with actual business address
- Social media URLs are filtered to remove empty strings
- All schemas use proper TypeScript typing for better development experience
- JSON-LD format is used for better performance and compatibility
