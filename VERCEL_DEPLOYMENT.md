# Vercel Deployment Guide

This guide covers deploying Nova Nest Real Estate to Vercel with proper environment variable configuration.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Set up your Supabase project with database schema
3. **Domain** (optional): Configure custom domain for production

## Environment Variables Configuration

### Required Environment Variables

Set these in your Vercel project settings under **Settings > Environment Variables**:

#### Core Application
```bash
# Site Configuration
NEXT_PUBLIC_SITE_NAME=Nova Nest Real Estate
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Optional but Recommended
```bash
# Google Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
GOOGLE_MY_BUSINESS_API_KEY=your-gmb-key

# Email Service
RESEND_API_KEY=your-resend-key
SMTP_FROM_EMAIL=info@novanest.bg

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
GOOGLE_SEARCH_CONSOLE_KEY=your-search-console-key

# Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp

# Property Images Host
NEXT_PUBLIC_PROPERTY_IMAGES_HOST=img.novanest.bg
```

### Environment Variable Setup Steps

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click **Settings** tab
   - Click **Environment Variables**

2. **Add Each Variable**
   - Click **Add New**
   - Enter variable name and value
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

3. **Verify Configuration**
   - Ensure all required variables are set
   - Check that `NEXT_PUBLIC_*` variables are marked as public
   - Verify sensitive keys (service role, API keys) are private

## Deployment Process

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Root**
   ```bash
   vercel
   ```

4. **Follow Prompts**
   - Link to existing project or create new
   - Confirm build settings
   - Deploy

### Method 2: Git Integration

1. **Connect Repository**
   - Go to Vercel Dashboard
   - Click **New Project**
   - Import from GitHub/GitLab/Bitbucket

2. **Configure Build Settings**
   - Framework: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Deploy**
   - Push to main branch triggers automatic deployment
   - Preview deployments for pull requests

## Production Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] Supabase project set up with proper schema
- [ ] Database migrations applied
- [ ] Admin user created in Supabase Auth
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate verified

### After Deployment
- [ ] Test all major functionality
- [ ] Verify property listings load correctly
- [ ] Test contact forms and inquiries
- [ ] Check admin panel access
- [ ] Verify image uploads work
- [ ] Test search and filtering
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags
- [ ] Test sitemap and robots.txt

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to project settings
   - Click **Domains**
   - Add your domain (e.g., `novanest.bg`)

2. **Configure DNS**
   - Add CNAME record pointing to Vercel
   - Or use A records for apex domain

3. **SSL Certificate**
   - Vercel automatically provisions SSL
   - Wait for certificate to be issued

### Subdomain Configuration

For property images subdomain (`img.novanest.bg`):
1. Add subdomain in Vercel domains
2. Configure DNS CNAME record
3. Update `NEXT_PUBLIC_PROPERTY_IMAGES_HOST` environment variable

## Performance Optimization

### Vercel-Specific Optimizations

1. **Edge Functions**
   - API routes automatically deployed as serverless functions
   - Configured with 30-second timeout in `vercel.json`

2. **Caching Strategy**
   - Static assets cached for 1 year
   - API routes set to no-cache
   - Images optimized with Next.js Image component

3. **Build Optimization**
   - Using Turbopack for faster builds
   - Automatic code splitting
   - Tree shaking enabled

## Monitoring and Analytics

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals
- Track performance metrics

### Error Monitoring
- Check Vercel function logs
- Monitor API route performance
- Set up alerts for errors

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify all dependencies in `package.json`
   - Check build logs in Vercel dashboard

2. **Runtime Errors**
   - Verify Supabase connection
   - Check API route logs
   - Ensure all required env vars are present

3. **Image Loading Issues**
   - Verify `NEXT_PUBLIC_PROPERTY_IMAGES_HOST` is set
   - Check image domain in `next.config.ts`
   - Ensure proper CORS configuration

### Debug Commands

```bash
# Check build locally
npm run build

# Test production build
npm run start

# Check environment variables
vercel env ls

# View deployment logs
vercel logs [deployment-url]
```

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive keys to git
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **API Security**
   - Supabase RLS policies configured
   - Admin routes protected with authentication
   - Input validation on all forms

3. **Headers Configuration**
   - Security headers configured in `vercel.json`
   - CSP policies (temporarily disabled for testing)
   - HSTS enabled

## Backup and Recovery

1. **Database Backups**
   - Supabase automatic backups enabled
   - Manual backup before major changes
   - Test restore procedures

2. **Code Backups**
   - Git repository as primary backup
   - Vercel deployment history
   - Environment variable documentation

## Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Project Issues](https://github.com/your-repo/issues)

---

**Last Updated**: $(date)
**Version**: 1.0.0
