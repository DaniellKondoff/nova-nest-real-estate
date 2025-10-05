# Dynamic Sitemap Generation for Nova Nest Real Estate

This document explains the dynamic sitemap.xml generation system that automatically discovers and includes all published content.

## Overview

The sitemap is automatically generated at `/sitemap.xml` and includes:
- Static pages (homepage, about, services, contact)
- Property category pages (apartments, houses, offices, etc.)
- Dynamic property pages (all published properties)
- Neighborhood landing pages (active neighborhoods)
- SEO landing pages (active SEO pages)

## Sitemap Structure

### 1. Static Pages
High-priority static pages that are always included:

| URL | Priority | Change Frequency | Description |
|-----|----------|------------------|-------------|
| `/` | 1.0 | daily | Homepage |
| `/properties` | 0.9 | daily | Properties listing |
| `/services` | 0.8 | monthly | Services page |
| `/about` | 0.7 | monthly | About page |
| `/contact` | 0.7 | monthly | Contact page |

### 2. Property Category Pages
SEO-optimized category landing pages:

| URL | Priority | Change Frequency | Description |
|-----|----------|------------------|-------------|
| `/apartamenti-stara-zagora` | 0.85 | weekly | Apartments in Stara Zagora |
| `/kushi-stara-zagora` | 0.85 | weekly | Houses in Stara Zagora |
| `/ofisi-stara-zagora` | 0.85 | weekly | Offices in Stara Zagora |
| `/garazhi-stara-zagora` | 0.85 | weekly | Garages in Stara Zagora |
| `/parceli-stara-zagora` | 0.85 | weekly | Plots in Stara Zagora |
| `/skladove-stara-zagora` | 0.85 | weekly | Warehouses in Stara Zagora |

### 3. Dynamic Property Pages
All published properties (status = 'available'):

- **URL Format**: `/properties/{property.id}`
- **Priority**: 0.8
- **Change Frequency**: weekly
- **Last Modified**: Property's `updated_at` timestamp

### 4. Neighborhood Landing Pages
Active neighborhoods from the database:

- **URL Format**: `/{neighborhood.slug}`
- **Priority**: 0.85
- **Change Frequency**: weekly
- **Last Modified**: Neighborhood's `updated_at` timestamp

### 5. SEO Landing Pages
Active SEO pages from the database:

- **URL Format**: `/{seo_page.slug}`
- **Priority**: 0.9
- **Change Frequency**: weekly
- **Last Modified**: SEO page's `updated_at` timestamp

## Database Queries

### Properties Query
```sql
SELECT id, updated_at 
FROM properties 
WHERE status = 'available' 
ORDER BY updated_at DESC
```

### Neighborhoods Query
```sql
SELECT slug, updated_at 
FROM neighborhoods 
WHERE is_active = true 
ORDER BY updated_at DESC
```

### SEO Pages Query
```sql
SELECT slug, updated_at 
FROM seo_pages 
WHERE is_active = true 
ORDER BY updated_at DESC
```

## Error Handling

The sitemap generation includes comprehensive error handling:

1. **Database Connection Errors**: Logs error and continues with static pages
2. **Query Failures**: Individual query failures don't break the entire sitemap
3. **Empty Results**: Gracefully handles empty database results
4. **Fallback Strategy**: Always returns at least static pages

## Performance Optimizations

1. **Parallel Queries**: Uses `Promise.all()` to fetch all dynamic content simultaneously
2. **Minimal Data**: Only selects necessary columns (id, slug, updated_at)
3. **No Joins**: Simple queries without complex joins for better performance
4. **Caching**: Next.js automatically caches the sitemap response

## Monitoring and Logging

The sitemap generation includes detailed logging:

```javascript
console.log(`Sitemap generated with ${allPages.length} pages:`, {
  static: STATIC_PAGES.length,
  categories: PROPERTY_CATEGORY_PAGES.length,
  properties: propertyPages.length,
  neighborhoods: neighborhoodPages.length,
  seoPages: seoPages.length,
});
```

## Example Sitemap Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://novanest.bg</loc>
    <lastmod>2025-10-05T20:26:52.088Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>https://novanest.bg/properties</loc>
    <lastmod>2025-10-05T20:26:52.088Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://novanest.bg/properties/11</loc>
    <lastmod>2025-10-05T20:24:55.305Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... more URLs ... -->
</urlset>
```

## SEO Benefits

1. **Search Engine Discovery**: Helps search engines find all pages
2. **Fresh Content**: Automatically includes new properties and pages
3. **Priority Signals**: Tells search engines which pages are most important
4. **Update Frequency**: Indicates how often pages change
5. **Last Modified**: Shows when content was last updated

## Maintenance

The sitemap requires no manual maintenance:

- **Automatic Updates**: New properties are automatically included
- **Status Changes**: Only published properties appear in sitemap
- **Database Driven**: All dynamic content comes from database
- **Error Resilient**: Continues working even if some queries fail

## Testing

To test the sitemap:

1. **Direct Access**: Visit `https://novanest.bg/sitemap.xml`
2. **Validation**: Use Google Search Console to validate
3. **Monitoring**: Check server logs for generation statistics
4. **Performance**: Monitor response times and database queries

## Future Enhancements

Potential improvements for the sitemap system:

1. **Image Sitemaps**: Include property images in separate image sitemap
2. **News Sitemaps**: For blog posts or news articles
3. **Video Sitemaps**: For property video tours
4. **Sitemap Index**: For very large sites with multiple sitemaps
5. **Compression**: Gzip compression for large sitemaps
6. **CDN Integration**: Serve sitemap from CDN for better performance
