# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nova Nest Real Estate** is a Bulgarian real estate platform built for Stara Zagora. The application is fully localized to Bulgarian (primary language) with optional English support. It provides property listings, search/filtering, neighborhood pages, SEO-optimized structured data, and an admin panel for managing properties, inquiries, and testimonials.

## Technology Stack

- **Framework**: Next.js 15 with App Router (using Turbopack for fast builds)
- **Language**: TypeScript (strict mode enabled)
- **Database**: Supabase (PostgreSQL with generated types)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Radix UI primitives + custom components
- **Forms**: React Hook Form + Zod validation
- **Fonts**: Inter (Latin + Cyrillic subsets via next/font)
- **i18n**: Bulgarian (default locale `bg`), English (`en`) secondary

## Essential Commands

### Development
```bash
npm run dev          # Start dev server with Turbopack (port 3000)
npm run build        # Production build with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Setup
```bash
npm run setup:env    # Copy env.example to .env.local
npm install          # Install dependencies
```

Required environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_NAME` (optional)
- `NEXT_PUBLIC_APP_URL` (optional, defaults to localhost:3000)

## Architecture Patterns

### 1. Supabase Client Architecture

**Server-side** (RSC, Route Handlers):
- Use `getServerClient()` from `src/lib/supabase/server.ts`
- Async/await required for `cookies()` in Next.js 15+
- Access to server-only database operations

**Client-side** (Browser components):
- Use `getBrowserClient()` from `src/lib/supabase/client.ts`
- Manual cookie handling via document.cookie
- Client components must be marked with `'use client'`

### 2. Type System

**Generated Types**:
- `src/types/database.generated.ts` contains Supabase-generated database types
- Regenerate when database schema changes

**Domain Types**:
- `src/types/property.ts` - Property enums and interfaces (Bulgarian market-specific)
- `src/types/search.ts` - Search and filter types
- `src/types/admin.ts` - Admin panel types
- `src/types/forms.ts` - Form validation schemas

**Path Alias**: All imports use `@/*` alias mapping to `./src/*`

### 3. Data Fetching Patterns

**Server-side queries** (`src/lib/queries/`):
- `properties.ts` - Property listing queries (server-side)
- `features.ts` - Property features and categories
- `testimonials.ts` - Testimonials with ratings (server RSC)

**Client-side queries**:
- Some query files have `-client.ts` variants for browser components
- Example: `testimonials-client.ts` for client-side testimonial fetching

**Custom Hooks** (`src/hooks/`):
- `usePropertySearch.ts` - Search with debouncing, filters, pagination
- `usePropertyCategories.ts` - Category and feature data
- `useNeighborhoods.ts` - Neighborhood data
- `useAuth.ts` - Authentication state
- `usePropertyViewTracking.ts` - Property view analytics

### 4. API Route Structure

All API routes in `src/app/api/` follow Next.js 15 async params pattern:

```typescript
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // ... handle request
}
```

**Public API routes**:
- `/api/properties` - Property listings with search/filters
- `/api/properties/[id]` - Single property details
- `/api/properties/nearby` - Nearby properties
- `/api/search` - Global search
- `/api/categories` - Property categories
- `/api/health` - Health check endpoint

**Admin API routes** (`/api/admin/*`):
- `/api/admin/properties` - CRUD for properties
- `/api/admin/testimonials` - CRUD for testimonials
- `/api/admin/inquiries` - Inquiry management
- `/api/admin/neighborhoods` - Neighborhood management
- `/api/admin/dashboard` - Dashboard stats

### 5. SEO Implementation

**Structured Data** (`src/components/seo/`):
- `OrganizationSchema` - Schema.org Organization with aggregate ratings
- `WebsiteSchema` - Schema.org WebSite
- `BreadcrumbSchema` - Breadcrumb navigation
- `ProductSchema` - Property listings (Product schema)
- `PropertyReviewSchema` - Property-specific reviews

**Metadata Generation** (`src/lib/seo/`):
- `metadata.ts` - Next.js Metadata object generation
- `generate-schema.ts` - JSON-LD schema generation
- `config.ts` - SEO configuration constants

**Dynamic Routes**:
- `src/app/sitemap.ts` - Dynamic XML sitemap generation
- `src/app/robots.ts` - Dynamic robots.txt

### 6. Bulgarian Localization

**Language**: All user-facing content is in Bulgarian (Cyrillic)
- Property types: "Апартамент", "Къща", "Офис", etc.
- Form labels and validation messages are bilingual (BG/EN)
- Bulgarian phone format: `+359 XX XXX XXXX` or `08X XXX XXXX`
- Postal codes: `6000-6999` (Stara Zagora region)

**Validation** (`src/lib/validations.ts`):
- `bgPhoneRegex` - Bulgarian phone validation
- `bgPostalCodeRegex` - Stara Zagora postal codes
- `emailRegex` - Common TLDs including `.bg`

### 7. Design System

**Colors** (defined in `src/app/globals.css` and `tailwind.config.ts`):
- Primary Navy: `#1a2642` → `bg-primary` / `--brand-navy`
- Accent Gold: `#d4af37` → `bg-accent` / `--brand-gold`

**Components** (`src/components/`):
- `ui/` - Base UI primitives (Button, Input, Card, Typography, etc.)
- `property/` - Property listing components (Card, Grid, Filters, etc.)
- `layout/` - Layout components (Header, Footer, Container, etc.)
- `admin/` - Admin panel components
- `forms/` - Form components (InquiryForm, SearchForm, etc.)
- `seo/` - SEO structured data components

**Spacing**: 8px grid system (use Tailwind's numeric scale)

**Typography**: Inter font loaded via next/font with CSS variable `--font-inter`

### 8. Property Data Model

Key property attributes for Bulgarian market:
- **Types**: Apartment, House, Office, Garage, Plot, Commercial
- **Status**: Sale, Rent, Sold, Rented, Reserved
- **Condition**: New, Excellent, Good, Needs Renovation, Under Construction
- **Heating**: Central (ТЕЦ), Individual Gas, Electric, Solid Fuel, None
- **Features**: Rooms, bedrooms, bathrooms, area (sqm), floor, total floors
- **Bulgarian-specific**: Parking spots, balcony, terrace, basement, attic, elevator

### 9. Neighborhood Landing Pages

**Route**: `src/app/[neighborhood-slug]/page.tsx`

Dynamic neighborhood pages with SEO optimization:
- Breadcrumb structured data
- Neighborhood-specific property listings
- Local area information and statistics
- Canonical URLs with trailing slashes

**Data**: Neighborhoods defined in `src/constants/neighborhoods.ts`

### 10. Admin Panel

**Authentication**: Supabase Auth with role-based access
- Admin routes protected via `src/lib/auth-server.ts`
- Admin profiles stored in `admin_profiles` table
- Role-based permissions system

**Admin Routes** (`src/app/admin/`):
- `/admin/dashboard` - Overview with stats
- `/admin/properties` - Property management with bulk operations
- `/admin/testimonials` - Testimonial CRUD
- `/admin/inquiries` - Inquiry management with status tracking
- `/admin/analytics/views` - Property view analytics

## Important Implementation Notes

### Next.js 15 Patterns

1. **Async Dynamic APIs**: All dynamic APIs (`cookies()`, `headers()`, `params`) must be awaited
2. **Server Components by Default**: Components are RSC unless marked with `'use client'`
3. **Turbopack**: Used for both dev and build (configured in `next.config.ts`)

### File Naming Conventions

- Page routes: `page.tsx`
- Layouts: `layout.tsx`
- Loading states: `loading.tsx`
- Not found: `not-found.tsx`
- API routes: `route.ts`
- Client components: Often suffixed with `-client.ts` for query files

### Code Quality

ESLint rules are warnings (not errors) to allow flexibility:
- `@typescript-eslint/no-explicit-any: warn`
- `@typescript-eslint/no-unused-vars: warn`
- Run `npm run lint` to check for issues

### Image Handling

**Next Image Configuration** (`next.config.ts`):
- Formats: AVIF, WebP
- Remote patterns configured for Supabase Storage, Unsplash, UI Avatars
- Property images domain: `img.novanest.bg` (or `NEXT_PUBLIC_PROPERTY_IMAGES_HOST`)

**Image Storage**:
- Property images stored in Supabase Storage bucket
- Image CRUD via `/api/images/[id]` and `/api/properties/[id]/images`
- Max upload size: 5MB (validated in `src/lib/validations.ts`)

### Security Headers

Configured in `next.config.ts`:
- CSP temporarily disabled (line 96-97)
- Strict-Transport-Security enabled
- X-Frame-Options: SAMEORIGIN
- Permissions-Policy for geolocation/camera/microphone

### Magic UI Integration

Placeholder directories for MCP-fetched components:
- `src/magic/components/` - Magic UI components
- `src/magic/icons/` - Icon assets
- `src/magic/styles/` - Additional styles

## Common Development Tasks

### Adding a New Property Field

1. Update database schema in Supabase
2. Regenerate types: Update `src/types/database.generated.ts`
3. Update `src/types/property.ts` interfaces
4. Add validation in `src/lib/validations.ts`
5. Update API route handlers in `src/app/api/properties/`
6. Update UI components in `src/components/property/`

### Creating a New API Endpoint

1. Create `route.ts` in `src/app/api/[your-endpoint]/`
2. Use Next.js 15 async params pattern (see examples in existing routes)
3. Use `getServerClient()` for database access
4. Return `NextResponse.json()` with proper status codes
5. Add TypeScript types in `src/types/api.ts`

### Adding a New Page

1. Create `page.tsx` in appropriate `src/app/` directory
2. Generate metadata using `generateMetadata()` from `src/lib/seo/metadata.ts`
3. Add route to sitemap in `src/app/sitemap.ts`
4. Add breadcrumb schema if applicable
5. Ensure Bulgarian language content

### Working with Forms

1. Define Zod schema in `src/lib/validations.ts`
2. Use React Hook Form with `@hookform/resolvers/zod`
3. Create form component in `src/components/forms/`
4. Use Bulgarian/English bilingual error messages
5. Follow existing form patterns (e.g., `InquiryForm`, `SearchForm`)

## Testing Status

According to `TESTING_SUMMARY.md`:
- ✅ TypeScript compilation passing
- ✅ Development server running
- ✅ Home page and Bulgarian content verified
- ✅ Responsive design tested across breakpoints
- 🟡 Property listing functionality in testing
- ⏳ Property detail pages, performance, accessibility pending

## Notes for Future Development

- Complete testing checklist in `TESTING_CHECKLIST.md`
- Review/rating schema implementation documented in `REVIEW_SCHEMA_IMPLEMENTATION.md`
- Recent work includes neighborhood landing pages, breadcrumb schema, and structured data implementation
- The codebase follows modern React Server Component patterns with proper separation of server/client code
