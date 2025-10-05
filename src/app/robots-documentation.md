# Robots.txt Configuration for Nova Nest Real Estate

This document explains the robots.txt configuration that controls search engine crawling behavior for the Nova Nest Real Estate website.

## Overview

The robots.txt file is automatically generated at `/robots.txt` and provides instructions to search engine crawlers about which pages they can access and where to find the sitemap.

## Current Configuration

### Generated robots.txt Content

```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /admin/*
Disallow: /api/*
Disallow: /_next/*

Sitemap: https://novanest.bg/sitemap.xml
```

## Configuration Details

### 1. User Agent Rules

**Target**: All search engines (`*`)
- **Allow**: `/` - Permits crawling of all public pages by default
- **Disallow**: Specific directories and patterns that should not be crawled

### 2. Disallowed Paths

| Path | Purpose | Reason |
|------|---------|--------|
| `/admin/` | Admin panel routes | Contains sensitive administrative content |
| `/api/` | API endpoints | Backend API routes not meant for indexing |
| `/_next/` | Next.js internals | Framework-generated files and assets |
| `/admin/*` | All admin sub-routes | Comprehensive admin panel blocking |
| `/api/*` | All API sub-routes | Comprehensive API blocking |
| `/_next/*` | All Next.js internals | Comprehensive framework blocking |

### 3. Sitemap Reference

- **URL**: `https://novanest.bg/sitemap.xml`
- **Purpose**: Directs search engines to the comprehensive sitemap
- **Benefit**: Helps search engines discover all crawlable pages efficiently

## SEO Benefits

### 1. **Crawl Budget Optimization**
- Prevents search engines from wasting crawl budget on irrelevant pages
- Focuses crawling on valuable content (properties, pages, neighborhoods)

### 2. **Security Protection**
- Blocks access to admin panel and API endpoints
- Prevents indexing of sensitive administrative content

### 3. **Performance Benefits**
- Reduces server load by preventing unnecessary crawls
- Protects API endpoints from excessive bot traffic

### 4. **Sitemap Discovery**
- Automatically directs search engines to the sitemap
- Ensures efficient discovery of all public content

## Implementation Details

### File Location
- **Source**: `src/app/robots.ts`
- **Generated URL**: `/robots.txt`
- **Framework**: Next.js 14+ App Router

### Configuration Source
```typescript
import { SEO_CONFIG } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/admin/*',
          '/api/*',
          '/_next/*',
        ],
      },
    ],
    sitemap: `${SEO_CONFIG.siteUrl}/sitemap.xml`,
  };
}
```

### Dynamic Generation
- **Automatic**: Generated on each request
- **Configurable**: Uses SEO_CONFIG for site URL
- **Maintainable**: Easy to update rules as needed

## Testing and Validation

### 1. **Direct Access**
Visit `https://novanest.bg/robots.txt` to view the generated file

### 2. **Google Search Console**
- Submit robots.txt for validation
- Monitor crawl errors and blocked resources
- Verify sitemap discovery

### 3. **Third-party Tools**
- Use robots.txt validators to check syntax
- Test with different user agents
- Verify disallow rules work correctly

## Maintenance

### 1. **Automatic Updates**
- No manual maintenance required
- Updates automatically when SEO_CONFIG changes
- Reflects current site structure

### 2. **Adding New Rules**
To add new disallow patterns:

```typescript
disallow: [
  '/admin/',
  '/api/',
  '/_next/',
  '/admin/*',
  '/api/*',
  '/_next/*',
  '/new-restricted-path/', // Add new patterns here
],
```

### 3. **Multiple User Agents**
To add specific rules for different crawlers:

```typescript
rules: [
  {
    userAgent: '*',
    allow: '/',
    disallow: ['/admin/', '/api/'],
  },
  {
    userAgent: 'Googlebot',
    allow: '/',
    disallow: ['/admin/', '/api/'],
  },
],
```

## Best Practices

### 1. **Keep It Simple**
- Use clear, simple rules
- Avoid overly complex patterns
- Test changes before deployment

### 2. **Regular Monitoring**
- Check Google Search Console for crawl errors
- Monitor server logs for blocked requests
- Verify sitemap is being discovered

### 3. **Security Considerations**
- Always block admin and API routes
- Review new routes before adding to allow list
- Consider blocking development/staging environments

### 4. **Performance Optimization**
- Block unnecessary crawls to reduce server load
- Use sitemap to guide efficient crawling
- Monitor crawl frequency and adjust as needed

## Common Issues and Solutions

### 1. **Conflicting Files**
- **Issue**: Static robots.txt in public/ conflicts with dynamic robots.ts
- **Solution**: Remove static file, use dynamic generation

### 2. **Sitemap Not Found**
- **Issue**: Search engines can't find sitemap
- **Solution**: Verify sitemap URL in robots.txt is correct

### 3. **Over-blocking**
- **Issue**: Important pages being blocked
- **Solution**: Review disallow patterns, use more specific rules

### 4. **Under-blocking**
- **Issue**: Sensitive content being crawled
- **Solution**: Add more restrictive disallow patterns

## Future Enhancements

Potential improvements for the robots.txt system:

1. **Environment-specific Rules**: Different rules for dev/staging/production
2. **Dynamic User Agent Rules**: Specific rules for different search engines
3. **Crawl Delay**: Add crawl delay for specific user agents
4. **Host Directive**: Specify preferred domain (www vs non-www)
5. **Multiple Sitemaps**: Reference additional sitemaps (images, videos)

## Integration with SEO Strategy

The robots.txt configuration works together with other SEO components:

1. **Sitemap**: Directs crawlers to comprehensive page list
2. **Meta Tags**: Provides additional crawling instructions
3. **Structured Data**: Helps search engines understand content
4. **Page Speed**: Optimized crawling improves overall SEO performance

This robots.txt configuration provides a solid foundation for search engine optimization while protecting sensitive areas of the Nova Nest Real Estate website.
