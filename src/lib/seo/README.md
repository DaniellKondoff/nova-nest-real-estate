# SEO Configuration for Nova Nest Real Estate

This directory contains the SEO configuration and utilities for the Nova Nest Real Estate website.

## Files

- `config.ts` - Main SEO configuration with site-wide settings
- `metadata.ts` - Utilities for generating Next.js 14 Metadata objects
- `README.md` - This documentation file

## Usage

### Basic Page Metadata

```typescript
import { generatePageMetadata, generateMetadata } from '@/lib/seo/metadata';

// For a specific page
const pageData = generatePageMetadata(
  'Апартаменти за продажба',
  'Намерете идеалния апартамент в Стара Загора. Голям избор от модерни апартаменти с отлични цени.',
  '/properties',
  {
    keywords: ['апартаменти', 'продажба', 'модерни'],
    image: '/images/properties-og.jpg'
  }
);

export const metadata = generateMetadata(pageData);
```

### Using in Page Components

```typescript
// app/properties/page.tsx
import { generatePageMetadata, generateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadata(
    generatePageMetadata(
      'Недвижими имоти в Стара Загора',
      'Голям избор от недвижими имоти в Стара Загора. Апартаменти, къщи, офиси за продажба и под наем.',
      '/properties',
      {
        keywords: ['недвижими имоти', 'Стара Загора', 'апартаменти', 'къщи']
      }
    )
  );
}
```

### Dynamic Metadata for Property Pages

```typescript
// app/properties/[id]/page.tsx
import { generatePageMetadata, generateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await getProperty(params.id);
  
  return generateMetadata(
    generatePageMetadata(
      `${property.title} - ${property.price} лв`,
      property.description,
      `/properties/${params.id}`,
      {
        keywords: [property.type, property.location, 'продажба'],
        image: property.images[0]?.url
      }
    )
  );
}
```

## Configuration

The main configuration is in `config.ts` and includes:

- Site information (name, URL, description)
- Primary keywords
- Location data (coordinates, city, region)
- Contact information
- Social media links
- Default OpenGraph and Twitter card settings

## Features

- ✅ Next.js 14 Metadata API compliance
- ✅ Full TypeScript support
- ✅ OpenGraph and Twitter Card optimization
- ✅ Bulgarian locale support
- ✅ Geographic metadata for local SEO
- ✅ Structured data for real estate
- ✅ Mobile-optimized viewport settings (separate viewport export)
- ✅ PWA manifest integration
- ✅ Search engine verification tags
- ✅ Proper themeColor configuration

## Customization

To customize the SEO configuration:

1. Update `SEO_CONFIG` in `config.ts`
2. Modify default images and social media links
3. Add new keywords or location data as needed
4. Update the theme color to match your brand

## Best Practices

- Always provide unique titles and descriptions for each page
- Use relevant keywords for each page type
- Include high-quality images for social sharing
- Keep descriptions under 160 characters
- Use structured data for better search results
- Test with Google's Rich Results Test tool
