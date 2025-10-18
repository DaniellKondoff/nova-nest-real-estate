# Deployment Guide: Fix RPC Function Overloading Error

## Summary

This fix resolves the Supabase RPC function overloading error (PGRST203) by creating a new function with an unambiguous name and signature, while maintaining backwards compatibility.

## What Was Changed

### 1. New Database Migration
- **File**: `scripts/migrations/002_create_search_properties_v2.sql`
- **Action**: Creates new `search_properties_v2` function with clear parameter names (using `p_` prefix)
- **Impact**: Additive only - does not modify or drop existing functions

### 2. TypeScript Code Updates
- **File**: `src/lib/queries/properties.ts` (line 84-94)
  - Changed RPC call from `search_properties_combined` to `search_properties_v2`
  - Updated parameter names with `p_` prefix
  
- **File**: `src/app/api/search/route.ts` (line 68-78)
  - Same changes for English language fallback search

## Safe Deployment Steps for Production

### Phase 1: Apply Database Migration (Safe - No Breaking Changes)

1. **Open Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project
   - Go to SQL Editor

2. **Copy and Execute Migration**
   - Open `scripts/migrations/002_create_search_properties_v2.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify Function Creation**
   Run this test query in SQL Editor:
   ```sql
   SELECT * FROM search_properties_v2(
     p_search_term := 'апартамент',
     p_language_code := 'bg'
   ) LIMIT 5;
   ```
   
   Expected: Should return property results without errors.

4. **Important**: At this point, your application continues working normally with the old function. No user impact.

### Phase 2: Deploy Code Changes

1. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "fix: replace search_properties_combined with search_properties_v2"
   git push
   ```

2. **Deploy to Production**
   - If using Vercel: Deployment happens automatically
   - If using other hosting: Follow your deployment process

3. **Monitor Deployment**
   - Check deployment logs for any errors
   - Verify application starts successfully

### Phase 3: Verify Fix

1. **Test Search Functionality**
   - Go to your production site
   - Open browser DevTools Console (F12)
   - Perform a property search
   
2. **Check for Success**
   - ✅ No "RPC search failed" warnings in console
   - ✅ Search results appear correctly
   - ✅ Search is faster (using RPC instead of fallback)

3. **Test Different Search Scenarios**
   - Bulgarian text search: "апартамент в центъра"
   - English text search: "apartment center"
   - Filter-only search (no text)
   - Combined text + filters

### Phase 4: Cleanup (Optional - Later)

After 1-2 weeks of stable operation, you can optionally remove the old functions:

```sql
BEGIN;

-- Only run this after confirming v2 works perfectly
DROP FUNCTION IF EXISTS public.search_properties_combined CASCADE;

COMMIT;
```

## Rollback Plan (If Needed)

If any issues occur after code deployment:

1. **Immediate Rollback** (via Vercel/hosting platform)
   - Revert to previous deployment
   - Application automatically uses fallback search logic
   - No database changes needed

2. **The new function remains in database harmlessly**
   - Does not affect old code
   - Can retry deployment after investigating issues

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Database migration fails | Very Low | None | Test query shown above |
| Code deployment breaks search | Very Low | Low | Fallback logic already in place |
| Performance issues | Very Low | Low | Function uses same logic as old one |
| Downtime | None | None | Changes are additive and backwards compatible |

## Expected Improvements

After successful deployment:

1. **No More Console Warnings**: The PGRST203 error will disappear
2. **Better Performance**: Search will use the optimized RPC function instead of fallback
3. **Cleaner Code**: Can eventually remove `@ts-expect-error` comments after regenerating types

## Regenerating TypeScript Types (Optional)

After the database function is created, you can regenerate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.generated.ts
```

This will add `search_properties_v2` to the generated types and allow you to remove the `@ts-expect-error` comments.

## Support

If you encounter any issues:

1. Check Supabase Dashboard > Logs for database errors
2. Check browser console for client-side errors
3. Check Vercel/hosting logs for server-side errors
4. The fallback search logic will handle errors gracefully

## Files Modified

- ✅ `scripts/migrations/002_create_search_properties_v2.sql` (new)
- ✅ `src/lib/queries/properties.ts`
- ✅ `src/app/api/search/route.ts`

## Verification Checklist

Before deploying to production:
- [x] Migration file created
- [x] TypeScript code updated
- [x] No linter errors
- [ ] Migration tested in Supabase SQL Editor
- [ ] Function returns expected results
- [ ] Code deployed to production
- [ ] Search functionality verified
- [ ] No console warnings
- [ ] Performance improved

---

**Remember**: Database changes MUST be applied BEFORE code deployment to avoid any issues.

