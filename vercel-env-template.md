# Vercel Environment Variables Template

Copy these environment variables to your Vercel project settings under **Settings > Environment Variables**.

## Required Variables (Production)

### Core Application
```
NEXT_PUBLIC_SITE_NAME=Nova Nest Real Estate
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Optional Variables (Recommended)

### Google Services
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
GOOGLE_MY_BUSINESS_API_KEY=your-gmb-api-key
```

### Email Service
```
RESEND_API_KEY=re_...
SMTP_FROM_EMAIL=info@novanest.bg
```

### Analytics & SEO
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
GOOGLE_SEARCH_CONSOLE_KEY=your-search-console-verification-key
```

### File Upload Configuration
```
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp
NEXT_PUBLIC_PROPERTY_IMAGES_HOST=img.novanest.bg
```

## Environment Configuration

### For Each Variable:
1. **Name**: Copy the variable name exactly as shown
2. **Value**: Replace with your actual values
3. **Environments**: Select all (Production, Preview, Development)
4. **Public**: Only check for `NEXT_PUBLIC_*` variables

### Variable Types:
- **Public Variables** (`NEXT_PUBLIC_*`): Safe to expose to client-side
- **Private Variables**: Server-side only, never exposed to client

## Quick Setup Commands

### Using Vercel CLI:
```bash
# Set environment variables via CLI
vercel env add NEXT_PUBLIC_SITE_NAME production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# List all environment variables
vercel env ls

# Pull environment variables to local .env.local
vercel env pull .env.local
```

### Using Vercel Dashboard:
1. Go to your project in Vercel Dashboard
2. Click **Settings** tab
3. Click **Environment Variables**
4. Add each variable with the exact name and value
5. Select all environments (Production, Preview, Development)
6. Mark `NEXT_PUBLIC_*` variables as public

## Validation Checklist

Before deploying, ensure:
- [ ] All required variables are set
- [ ] Supabase URL and keys are correct
- [ ] App URL matches your Vercel domain
- [ ] Public variables are marked as public
- [ ] Private variables are marked as private
- [ ] No sensitive data in public variables

## Security Notes

- Never commit `.env.local` to git
- Use Vercel's environment variable system for production
- Rotate API keys regularly
- Use different keys for development and production
- Monitor usage of API keys in respective dashboards
