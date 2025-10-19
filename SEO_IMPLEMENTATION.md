# SEO Implementation Guide - Nova Nest Real Estate

This document provides a comprehensive overview of the SEO implementation for the Nova Nest Real Estate platform. Use this as context when working on SEO-related features, optimizations, or troubleshooting.

---

## Table of Contents

1. [Overview](#overview)
2. [SEO Architecture](#seo-architecture)
3. [Metadata System](#metadata-system)
4. [Structured Data (Schema.org)](#structured-data-schemaorg)
5. [Sitemap & Robots.txt](#sitemap--robotstxt)
6. [URL Structure & Slugs](#url-structure--slugs)
7. [Localization](#localization)
8. [Keywords & Content Strategy](#keywords--content-strategy)
9. [Page-Specific SEO](#page-specific-seo)
10. [Technical SEO](#technical-seo)
11. [Best Practices](#best-practices)

---

## Overview

**Target Market**: Stara Zagora, Bulgaria
**Primary Language**: Bulgarian (Cyrillic)
**Secondary Language**: English (minimal)
**Target Audience**: Bulgarian property buyers/renters in Stara Zagora region
**SEO Focus**: Local SEO for Bulgarian real estate market

### Core SEO Strategy
- **Local SEO**: Targeting "имоти Стара Загора" and related Bulgarian keywords
- **Neighborhood Landing Pages**: SEO-optimized pages for each neighborhood in Stara Zagora
- **Rich Snippets**: Product schema for properties, Organization schema with ratings
- **Breadcrumb Navigation**: Structured data for improved search result display
- **Bulgarian-First Content**: All content optimized for Bulgarian language and local search behavior

---

## SEO Architecture

### Directory Structure

```
src/
├── lib/
│   ├── seo/
│   │   ├── config.ts                    # Central SEO configuration
│   │   ├── metadata.ts                  # Next.js Metadata generators
│   │   ├── property-metadata.ts         # Property-specific metadata
│   │   ├── neighborhood-metadata.ts     # Neighborhood page metadata
│   │   ├── property-schema.ts           # Product & listing schemas
│   │   ├── breadcrumb-schema.ts         # Breadcrumb structured data
│   │   ├── generate-schema.ts           # General schema generators
│   │   ├── property-slug.ts             # SEO-friendly URL slugs
│   │   ├── breadcrumb-helpers.ts        # Breadcrumb generation utilities
│   │   └── neighborhood-breadcrumbs.ts  # Neighborhood breadcrumbs
│   └── seo-config.ts                    # Legacy config (deprecated)
├── components/
│   └── seo/
│       ├── StructuredData.tsx           # Base schema components
│       ├── PropertySchema.tsx           # Property schema components
│       ├── BreadcrumbSchema.tsx         # Breadcrumb schema components
│       └── PropertyReviewSchema.tsx     # Review schema (prepared for future)
└── app/
    ├── layout.tsx                       # Root layout with default metadata
    ├── sitemap.ts                       # Dynamic sitemap generator
    ├── robots.ts                        # Robots.txt configuration
    ├── page.tsx                         # Homepage with metadata
    ├── properties/[id]/page.tsx         # Property pages with rich metadata
    └── [neighborhood-slug]/page.tsx     # Neighborhood landing pages
```

---

## Metadata System

### Configuration Files

**Primary Config**: `src/lib/seo/config.ts`

```typescript
export const SEO_CONFIG = {
  siteName: 'Nova Nest Real Estate',
  siteUrl: 'https://novanest.bg',
  defaultTitle: 'Nova Nest - Недвижими имоти в Стара Загора',
  defaultDescription: 'Професионални услуги за недвижими имоти в Стара Загора...',
  primaryKeywords: [
    'имоти Стара Загора',
    'апартаменти Стара Загора',
    'къщи за продажба Стара Загора',
    // ... more Bulgarian keywords
  ],
  locale: 'bg_BG',
  location: {
    city: 'Стара Загора',
    region: 'Стара Загора',
    country: 'Bulgaria',
    coordinates: { lat: 42.4258, lng: 25.6347 }
  },
  contact: {
    phone: '+359899897776',
    email: 'info@novanest.bg'
  },
  social: {
    facebook: '',  // TODO: Add when available
    instagram: '' // TODO: Add when available
  }
};
```

### Metadata Generators

**Default Site Metadata**: `generateDefaultMetadata()` in `src/lib/seo/metadata.ts`
- Used in root layout (`src/app/layout.tsx`)
- Includes metadataBase, title template, OpenGraph, Twitter cards
- Geo-tagging for local SEO (BG-24 region code)
- Google verification placeholder

**Page Metadata**: `generateMetadata()` in `src/lib/seo/metadata.ts`
- Accepts PageMetadata object (title, description, path, keywords, image)
- Automatically appends site name to titles
- Generates complete OpenGraph and Twitter card metadata
- Adds geo-location meta tags for local SEO

**Property Metadata**: `generatePropertyMetadata()` in `src/lib/seo/property-metadata.ts`
- Auto-generates Bulgarian keywords from property data
- Smart title generation: `{Title} - {Neighborhood}, Стара Загора | Nova Nest`
- Auto description with area, rooms, price
- Custom SEO fields support (`seo_description`, `seo_keywords`)
- Property-specific meta tags (type, operation, price, area, rooms)

**Neighborhood Metadata**: `generateNeighborhoodMetadata()` in `src/lib/seo/neighborhood-metadata.ts`
- Generates metadata for neighborhood landing pages
- Title format: `Имоти в {Neighborhood}, Стара Загора - {Count} обяви | Nova Nest`
- Auto-generates neighborhood-specific keywords
- Special keyword mapping for major neighborhoods (Център, Самара, etc.)

---

## Structured Data (Schema.org)

### Organization Schema

**Component**: `OrganizationSchema` in `src/components/seo/StructuredData.tsx`
**Generator**: `generateOrganizationSchema()` in `src/lib/seo/generate-schema.ts`

**Schema Type**: `RealEstateAgent`

**Features**:
- Business name, address, contact info
- Geo-coordinates for Google Maps integration
- Opening hours specification (Mon-Fri 09:00-18:00, Sat 10:00-15:00)
- Area served: Stara Zagora (with Wikidata ID)
- Aggregate ratings from testimonials (dynamically fetched)
- Review snippets (top 10 most recent testimonials)
- Social media links (when available)

**Usage**: Automatically included in root layout for all pages

### Website Schema

**Component**: `WebsiteSchema` in `src/components/seo/StructuredData.tsx`
**Generator**: `generateWebsiteSchema()` in `src/lib/seo/generate-schema.ts`

**Schema Type**: `WebSite`

**Features**:
- Site name and description
- Search action for Google search box integration
- Target URL: `{siteUrl}/properties?search={search_term_string}`
- Links to Organization schema via `@id`

**Usage**: Automatically included in root layout for all pages

### Property Schema

**Component**: `PropertySchema` in `src/components/seo/PropertySchema.tsx`
**Generator**: `generatePropertySchema()` in `src/lib/seo/property-schema.ts`

**Schema Type**: `Product`

**Features**:
- Property title, description (Bulgarian)
- Image URLs (all property images)
- Offer data: price (EUR), availability, seller info
- Address: PostalAddress with full Bulgarian address
- Geo-coordinates (if available)
- Additional properties array:
  - Property type (Тип имот)
  - Neighborhood (Квартал)
  - Area (Площ) with MTK unit code
  - Rooms (Брой стаи)
  - Bedrooms (Спални)
  - Bathrooms (Бани)
  - Floor (Етаж)
  - Operation type (Продажба/Наем)

**Usage**: Added to individual property detail pages (`/properties/[id]`)

### Breadcrumb Schema

**Component**: `BreadcrumbSchema` in `src/components/seo/BreadcrumbSchema.tsx`
**Generator**: `generateBreadcrumbSchema()` in `src/lib/seo/breadcrumb-schema.ts`

**Schema Type**: `BreadcrumbList`

**Features**:
- Position-based breadcrumb items
- Validation to ensure required fields
- Auto-sorting by position
- Used on property pages and neighborhood pages

**Property Breadcrumbs** (`src/lib/seo/breadcrumb-helpers.ts`):
```
Начало > Имоти > {Category} > {Property Title}
```

**Neighborhood Breadcrumbs** (`src/lib/seo/neighborhood-breadcrumbs.ts`):
```
Начало > Квартали > {Neighborhood Name}
```

### Review Schema (Future)

**Component**: `PropertyReviewSchema` in `src/components/seo/PropertyReviewSchema.tsx`

**Status**: Prepared but not fully implemented
**TODO**: Implement property-specific reviews (currently only organization-level reviews exist)

---

## Sitemap & Robots.txt

### Dynamic Sitemap

**File**: `src/app/sitemap.ts`

**Features**:
- **Static Pages**: Homepage, /properties, /about, /services, /contact
- **Property Pages**: Dynamically generated from database (available properties only)
- **Neighborhood Pages**: All neighborhoods with slug
- **SEO Pages**: Custom SEO pages from `seo_pages` table (if published)
- **Priority Levels**:
  - Homepage: 1.0
  - Properties listing: 0.9
  - SEO pages: 0.9
  - Neighborhood pages: 0.85
  - Individual properties: 0.8
  - Static pages: 0.7-0.8
- **Change Frequency**: Daily (homepage/properties), weekly (property pages), monthly (static)
- **URL Format**: Uses SEO-friendly slugs when available
- **Error Handling**: Gracefully falls back to static pages if database queries fail

**Generation**: Runs at build time and on-demand (ISR)

### Robots.txt

**File**: `src/app/robots.ts`

**Configuration**:
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

Sitemap: https://novanest.bg/sitemap.xml
```

**Purpose**:
- Allow all crawlers access to public pages
- Block admin panel, API routes, Next.js internals
- Direct crawlers to sitemap

---

## URL Structure & Slugs

### SEO-Friendly Property URLs

**Implementation**: `src/lib/seo/property-slug.ts`

**Old Format** (deprecated but still supported):
```
/properties/11
```

**New Format** (SEO-optimized):
```
/properties/11-apartament-3-stai-centrum-stara-zagora
```

**Format**: `{id}-{slug}`

**Slug Generation Rules**:
- Lowercase Bulgarian Cyrillic text
- Spaces replaced with hyphens
- Special characters removed
- Truncated to reasonable length
- Always prefixed with numeric ID for uniqueness

**Functions**:
- `getPropertyUrlSlug(id, slug)` - Creates full URL slug
- `extractPropertyId(urlSlug)` - Extracts ID from slug
- `isValidPropertySlug(urlSlug)` - Validates slug format

**Behavior**:
- Old numeric URLs redirect to new slugged URLs
- Database field: `properties.slug` (nullable)
- Backward compatibility maintained

### Neighborhood URLs

**Format**: `/{neighborhood-slug}`

**Examples**:
- `/centrum-stara-zagora`
- `/samara-stara-zagora`
- `/zheleznik-stara-zagora`

**Implementation**: Dynamic route `src/app/[neighborhood-slug]/page.tsx`

**SEO Benefits**:
- Clean, readable URLs
- Keyword-rich (neighborhood name + city)
- Short and memorable

---

## Localization

### Language Configuration

**Primary Language**: Bulgarian (bg)
**Locale Code**: `bg_BG`
**HTML lang**: `bg` (set in `src/app/layout.tsx`)

### Geo-Targeting

**Meta Tags** (in metadata.ts):
```typescript
other: {
  'geo.region': 'BG-24',              // Stara Zagora region code
  'geo.placename': 'Стара Загора',
  'geo.position': '42.4258;25.6347',
  'ICBM': '42.4258, 25.6347',
  'contact:phone_number': '+359899897776',
  'contact:email': 'info@novanest.bg',
  'contact:country_name': 'Bulgaria',
  'contact:locality': 'Стара Загора',
  'contact:region': 'Стара Загора'
}
```

### Bulgarian Content Considerations

**Font Support**: Inter font with Cyrillic subset loaded via `next/font`

**Validation Patterns** (`src/lib/validations.ts`):
- Bulgarian phone: `+359 XX XXX XXXX` or `08X XXX XXXX`
- Postal codes: `6000-6999` (Stara Zagora region)
- Email TLDs include `.bg`

**Property Types** (Bulgarian):
- Апартамент (Apartment)
- Къща (House)
- Офис (Office)
- Гараж (Garage)
- Парцел (Plot)
- Комерсиален имот (Commercial)

---

## Keywords & Content Strategy

### Primary Keywords

**Top-Level** (from `SEO_CONFIG.primaryKeywords`):
```
имоти Стара Загора
апартаменти Стара Загора
къщи за продажба Стара Загора
наем апартаменти Стара Загора
агенция недвижими имоти
недвижими имоти Стара Загора
продажба имоти Стара Загора
под наем Стара Загора
офиси Стара Загора
комерсиални имоти Стара Загора
```

### Property Page Keywords

**Auto-Generated** (in `property-metadata.ts`):
- Category name (lowercase): "апартамент", "къща"
- Category + neighborhood: "апартамент център"
- Category + city: "апартамент стара загора"
- Operation type: "продажба", "наем"
- Neighborhood name: "център", "самара"
- Location combo: "имоти център"
- Size-based: "малък имот", "голям имот" (based on sqm)
- Room-based: "едностаен", "двустаен", "тристаен", "многостаен"

**Limit**: 8 keywords per property (duplicates removed)

### Neighborhood Page Keywords

**Auto-Generated** (in `neighborhood-metadata.ts`):

**Base Keywords**:
```typescript
`имоти ${neighborhood}`,
`апартаменти ${neighborhood}`,
`къщи ${neighborhood}`,
`${neighborhood} стара загора`,
`недвижими имоти ${neighborhood}`,
'имоти стара загора',
'апартаменти стара загора',
'къщи стара загора',
'nova nest',
'агенция недвижими имоти'
```

**Neighborhood-Specific** (hardcoded for major neighborhoods):
- **Център**: "апартаменти център стара загора", "офиси център стара загора"
- **Самара**: "къщи самара стара загора", "къщи с двор самара"
- **Железник**: "имоти железник стара загора"
- **Аязмото**: "имоти аязмото стара загора"
- And more...

---

## Page-Specific SEO

### Homepage (`/`)

**Metadata**: Inline in `src/app/page.tsx`

**Title**: "Nova Nest Real Estate - Имоти в Стара Загора"

**Description**: "Професионални услуги за недвижими имоти в Стара Загора. Апартаменти, къщи, офиси за продажба и под наем."

**Keywords**: ["имоти", "Стара Загора", "апартаменти", "къщи", "офиси", "продажба", "наем", "агенция за недвижими имоти"]

**Structured Data**:
- OrganizationSchema (with ratings & reviews)
- WebsiteSchema (with search action)

### Property Detail Pages (`/properties/[id]`)

**Metadata Generator**: `generatePropertyMetadata()` in `property-metadata.ts`

**Title Format**: `{PropertyTitle} - {Neighborhood}, Стара Загора | Nova Nest`

**Description**:
- Custom SEO description if provided (`seo_description` field)
- Auto-generated: "{Category} в {Neighborhood}, {Area} кв.м, {Rooms} стаи, {Price}, {Description excerpt}..."

**Keywords**:
- Custom keywords if provided (`seo_keywords` field, comma-separated)
- Auto-generated keywords (8 max)

**Structured Data**:
- PropertyDetailSchema (Product + Breadcrumb)
- BreadcrumbSchema

**Special Features**:
- Property-specific meta tags in `other` field
- Auto-redirect from old URLs to new slugged URLs
- Property view tracking on page load
- Geo-location meta tags

### Neighborhood Landing Pages (`/[neighborhood-slug]`)

**Metadata Generator**: `generateNeighborhoodMetadata()` in `neighborhood-metadata.ts`

**Title Format**: `Имоти в {Neighborhood}, Стара Загора - {Count} обяви | Nova Nest`

**Description**: "Открийте {count} имота в {Neighborhood}, Стара Загора. Апартаменти, къщи и офиси за продажба и под наем..."

**Structured Data**:
- Place schema (with geo-coordinates)
- BreadcrumbSchema
- Property count as additionalProperty

**Static Generation**: `generateStaticParams()` pre-builds all neighborhood pages at build time

**SEO Features**:
- Custom SEO title/description from database if available
- Neighborhood-specific keyword mapping
- Property count in title and description
- Visual and schema breadcrumbs

### Properties Listing Page (`/properties`)

**Priority**: 0.9 in sitemap

**Change Frequency**: Daily

**Purpose**: Main property search/filter page

---

## Technical SEO

### Next.js Configuration

**File**: `next.config.ts`

**SEO-Related Settings**:
- `trailingSlash: true` - All URLs end with `/` for consistency
- OpenGraph images: AVIF, WebP formats
- Security headers (Strict-Transport-Security, X-Frame-Options, etc.)
- CSP temporarily disabled (line 96-97) - TODO: Re-enable with proper configuration

**Image Optimization**:
- Formats: AVIF (primary), WebP (fallback)
- Remote patterns: Supabase Storage, Unsplash, UI Avatars
- Property images domain: `img.novanest.bg` (or `NEXT_PUBLIC_PROPERTY_IMAGES_HOST`)

### Performance

**Vercel Analytics**: Integrated in root layout

**Speed Insights**: Integrated in root layout

**Server Components**: Used by default for better performance and SEO

**Dynamic Rendering**: Property pages use `force-dynamic` to ensure fresh data

### Canonical URLs

**Implementation**: Automatically generated via `alternates.canonical` in metadata

**Format**: Always includes trailing slash

**Examples**:
- `https://novanest.bg/`
- `https://novanest.bg/properties/`
- `https://novanest.bg/properties/11-apartament-3-stai/`
- `https://novanest.bg/centrum-stara-zagora/`

### Meta Tags Coverage

**Standard Tags**:
- title, description, keywords
- author, creator, publisher
- robots (index, follow, googleBot config)

**OpenGraph**:
- og:title, og:description, og:url
- og:type, og:locale, og:site_name
- og:image (1200x630, AVIF/WebP)

**Twitter Card**:
- twitter:card (summary_large_image)
- twitter:site (@novanest_bg)
- twitter:creator (@novanest_bg)
- twitter:title, twitter:description, twitter:image

**Geo Tags**:
- geo.region, geo.placename, geo.position
- ICBM coordinates
- contact:* tags for local business

**Verification**:
- Google Site Verification placeholder (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var)

---

## Best Practices

### When Adding New Pages

1. **Generate Metadata**: Use `generateMetadata()` from `metadata.ts`
2. **Add to Sitemap**: Update `sitemap.ts` if it's a new route type
3. **Create Breadcrumbs**: Generate breadcrumb schema and visual breadcrumbs
4. **Structured Data**: Add appropriate schema (Product, Place, Article, etc.)
5. **Bulgarian Content**: Ensure all content is in Bulgarian with proper Cyrillic
6. **Keywords**: Add relevant Bulgarian keywords (3-10 per page)
7. **Canonical URL**: Ensure canonical URL is set correctly

### When Modifying Property Schema

**Database Fields**:
- `properties.slug` - SEO-friendly URL slug (nullable)
- `properties.seo_description` - Custom meta description (nullable)
- `properties.seo_keywords` - Custom keywords, comma-separated (nullable)
- `properties.title_bg` - Bulgarian title (required)
- `properties.description_bg` - Bulgarian description (required)

**Schema Updates**:
1. Update `src/lib/seo/property-schema.ts`
2. Update `src/types/property.ts` if adding new fields
3. Regenerate `src/types/database.generated.ts` if database schema changed
4. Test schema with Google Rich Results Test

### When Adding New Neighborhoods

1. Add to `neighborhoods` table with `slug` field
2. Slug format: `{neighborhood}-stara-zagora` (lowercase, hyphens)
3. Optional: Add SEO title/description overrides
4. Optional: Add geo-coordinates for map integration
5. Run build to pre-generate static page via `generateStaticParams()`
6. Add neighborhood-specific keywords to keyword map if major neighborhood

### Schema Validation

**Tools**:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

**Common Issues**:
- Missing required fields (name, url for Organization)
- Invalid image URLs
- Incorrect date formats (use ISO 8601)
- Missing price currency for Offers

### SEO Checklist for New Features

- [ ] Metadata generated with Bulgarian title and description
- [ ] Keywords include relevant Bulgarian terms
- [ ] Canonical URL set correctly
- [ ] OpenGraph and Twitter cards configured
- [ ] Structured data added (if applicable)
- [ ] Breadcrumbs implemented (visual + schema)
- [ ] Added to sitemap (if new route type)
- [ ] URL is SEO-friendly (readable, keyword-rich)
- [ ] Page uses Bulgarian language content
- [ ] Geo-location tags added (if local-specific)
- [ ] Images have alt text in Bulgarian
- [ ] Internal linking from relevant pages

---

## Environment Variables

**Required for SEO**:
- `NEXT_PUBLIC_APP_URL` - Site URL (defaults to `http://localhost:3000`)
- `NEXT_PUBLIC_SITE_NAME` - Site name (optional, defaults to "Nova Nest Real Estate")

**Optional**:
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - Google Search Console verification code
- `NEXT_PUBLIC_PROPERTY_IMAGES_HOST` - Custom domain for property images

---

## Future Improvements

**TODO List**:
1. **Re-enable CSP** in `next.config.ts` with proper configuration
2. **Add Social Links** in `SEO_CONFIG` (Facebook, Instagram)
3. **Property Reviews**: Implement property-specific reviews (currently only org-level)
4. **FAQ Schema**: Add FAQ structured data for common questions
5. **Video Schema**: Add if property videos are implemented
6. **Local Business Hours**: Update if business hours change
7. **Organization Address**: Replace placeholder address with actual business address
8. **Aggregate Rating**: Ensure testimonials are approved before including in schema
9. **Multi-language**: Add full English language support (currently minimal)
10. **Image Optimization**: Create neighborhood-specific OG images

---

## Key Files Reference

**Configuration**:
- `src/lib/seo/config.ts` - Central SEO configuration
- `src/lib/seo-config.ts` - Legacy config (deprecated)

**Metadata Generators**:
- `src/lib/seo/metadata.ts` - General metadata functions
- `src/lib/seo/property-metadata.ts` - Property pages
- `src/lib/seo/neighborhood-metadata.ts` - Neighborhood pages

**Schema Generators**:
- `src/lib/seo/generate-schema.ts` - Organization, Website, Property schemas
- `src/lib/seo/property-schema.ts` - Detailed Product schema for properties
- `src/lib/seo/breadcrumb-schema.ts` - Breadcrumb structured data

**Components**:
- `src/components/seo/StructuredData.tsx` - Base schema components
- `src/components/seo/PropertySchema.tsx` - Property schema rendering
- `src/components/seo/BreadcrumbSchema.tsx` - Breadcrumb schema rendering
- `src/components/seo/PropertyReviewSchema.tsx` - Review schema (future)

**Utilities**:
- `src/lib/seo/property-slug.ts` - SEO-friendly URL generation
- `src/lib/seo/breadcrumb-helpers.ts` - Property breadcrumbs
- `src/lib/seo/neighborhood-breadcrumbs.ts` - Neighborhood breadcrumbs

**Site Generation**:
- `src/app/sitemap.ts` - Dynamic sitemap
- `src/app/robots.ts` - Robots.txt

**Pages with SEO**:
- `src/app/layout.tsx` - Root layout with default metadata
- `src/app/page.tsx` - Homepage
- `src/app/properties/[id]/page.tsx` - Property details
- `src/app/[neighborhood-slug]/page.tsx` - Neighborhood landing pages

---

## Contact & Maintenance

For SEO-related questions or updates, refer to:
- **Primary Developer**: Claude Code
- **Documentation**: This file (SEO_IMPLEMENTATION.md)
- **Related Docs**: CLAUDE.md, TESTING_SUMMARY.md

**Last Updated**: 2025-10-18
