# Vercel Production Branch Fix

## Problem
Master branch deployments are creating **Preview** deployments instead of **Production** deployments.

## Root Cause
The Vercel project does not have a production branch configured (`"live": false` in project settings).

## Solution

### Option 1: Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/daniellkondoffs-projects/nova-nest-real-estate/settings/git

2. Find **"Production Branch"** setting

3. Set to: `master`

4. Click **Save**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link

# Set production branch
vercel env production-branch master
```

## Verification

After setting the production branch, verify by checking a new deployment:

```bash
# Get latest deployment
vercel list

# Or check via API that deployment has "target": "production"
```

Expected result:
- Deployments from `master` should show `"target": "production"`
- Production URL: `nova-nest-real-estate.vercel.app`
- Preview URLs: `nova-nest-real-estate-git-{branch}-daniellkondoffs-projects.vercel.app`

## ✅ SOLUTION IMPLEMENTED

**Root Cause:** Disconnect between Vercel Dashboard UI configuration and actual project state.

**Fix Applied:** Used Vercel CLI to force a production deployment:

```bash
vercel deploy --prod
```

**Results:**
- ✅ New deployment: `dpl_6w9SfUZsW7Lvhc37Yme6y4HbSM9x`
- ✅ Target: **"production"** (not null)
- ✅ Production URL: `nova-nest-real-estate.vercel.app`
- ✅ Aliases: `nova-nest-real-estate-daniellkondoffs-projects.vercel.app`

## Current Status

- ✅ Latest deployment: **Production** (`dpl_6w9SfUZsW7Lvhc37Yme6y4HbSM9x`)
- ✅ Target: **"production"** 
- ✅ Production URL working: `nova-nest-real-estate.vercel.app`

## Next Steps

1. **Test automatic deployments:** Push a commit to `master` to verify it now creates production deployments
2. **Monitor:** Check that future `master` merges create `"target": "production"` instead of `null`

## Alternative Solutions (if issue persists)

If automatic deployments still create preview deployments:

1. **Reconfigure in Dashboard:**
   - Go to: https://vercel.com/daniellkondoffs-projects/nova-nest-real-estate/settings/git
   - Temporarily change production branch to another branch
   - Save, then change back to `master`
   - Save again

2. **Use CLI for production deployments:**
   ```bash
   vercel deploy --prod
   ```

3. **Force redeploy existing deployment as production:**
   ```bash
   vercel redeploy <deployment-id> --prod
   ```

