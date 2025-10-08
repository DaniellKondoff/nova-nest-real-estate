# Contact Links & Phone Numbers Fix

## Problem
The user reported that contact buttons "Обадете се сега" (Call now) and "Свържете се с нас" (Contact us) had no actions throughout the application.

## Root Causes

### 1. Hardcoded Phone Numbers
Multiple components had hardcoded phone numbers that didn't match the centralized configuration:
- `+359881234567` in neighborhood page
- `+359888123456` in WhyChooseUsSection
- `+359XXXXXXXXX` placeholder in Header

### 2. Broken Contact Page Link
Several components linked to `/contact` which doesn't exist in the application.

### 3. No Centralized Configuration
Components weren't using the centralized contact information from `src/config/site.ts`.

## Solution

### Centralized Contact Configuration
All contact information is now sourced from `src/config/site.ts`:

```typescript
export const site = {
  contact: {
    phone: "+359888123456",           // For tel: links
    phoneDisplay: "+359 888 123 456", // For display
    email: "info@novanest.bg",
    address: "ул. [Адрес], Стара Загора 6000",
    businessHours: {
      weekdays: "9:00 - 18:00",
      saturday: "10:00 - 15:00",
      sunday: "Почивен ден",
    },
  },
}
```

### Files Fixed

#### 1. **Neighborhood Landing Page** (`src/app/[neighborhood-slug]/page.tsx`)
**Changes:**
- ✅ Added `import { site } from "@/config/site"`
- ✅ Fixed phone links: `href={`tel:${site.contact.phone}`}`
- ✅ Fixed email links: `href={`mailto:${site.contact.email}`}`
- ✅ Changed "Contact us" link from `/contact` to `/#contact`

**Affected buttons (4 total):**
1. "Обадете се" in empty properties section
2. "Изпратете имейл" in empty properties section
3. "Обадете се сега" in bottom CTA
4. "Свържете се с нас" in bottom CTA

#### 2. **Header Component** (`src/components/layout/Header.tsx`)
**Changes:**
- ✅ Added `import { site } from "@/config/site"`
- ✅ Fixed desktop phone link: `href={`tel:${site.contact.phone}`}`
- ✅ Fixed desktop phone display: `{site.contact.phoneDisplay}`
- ✅ Fixed mobile menu phone link: `href={`tel:${site.contact.phone}`}`
- ✅ Fixed mobile menu phone display: `{site.contact.phoneDisplay}`
- ✅ Changed mobile CTA button from `/contact` to `/#contact`

**Affected elements (3 total):**
1. Desktop header phone link (visible on xl screens)
2. Mobile menu phone link
3. Mobile menu "Свържете се" button

#### 3. **WhyChooseUsSection Component** (`src/components/home/WhyChooseUsSection.tsx`)
**Changes:**
- ✅ Added `import { site } from "@/config/site"`
- ✅ Fixed `handlePhoneClick`: `window.location.href = `tel:${site.contact.phone}``
- ✅ Fixed clipboard copy: `navigator.clipboard.writeText(site.contact.phone)`
- ✅ Fixed phone modal display: `{site.contact.phoneDisplay}`
- ✅ Fixed modal call button: `window.location.href = `tel:${site.contact.phone}``
- ✅ Fixed console.log fallback

**Affected functionality (3 total):**
1. Main "Обади се сега" button click handler
2. Phone number modal display
3. Phone number copy to clipboard

## How the Fixes Work

### Phone Links (`tel:`)
```tsx
// Before
<a href="tel:+359881234567">

// After
<a href={`tel:${site.contact.phone}`}>
```
- Creates clickable phone links that open the phone dialer on mobile
- Uses consistent phone number from central config

### Email Links (`mailto:`)
```tsx
// Before
<a href="mailto:info@novanest.bg">

// After
<a href={`mailto:${site.contact.email}`}>
```
- Opens default email client with pre-filled recipient
- Uses email from central config

### Contact Page Navigation
```tsx
// Before
<Link href="/contact">

// After
<Link href="/#contact">
```
- Links to the contact section on the home page (which exists at `/#contact`)
- Uses anchor link to scroll to ContactCTASection

## Benefits

### 1. **Functional Contact Buttons** ✅
- All "Call now" buttons now open phone dialer
- All "Email us" buttons open email client
- All "Contact us" buttons navigate to contact form

### 2. **Centralized Configuration** ✅
- Single source of truth for contact information
- Easy to update phone/email across entire app
- No hardcoded values scattered throughout

### 3. **Consistency** ✅
- Same phone number everywhere: `+359888123456`
- Same display format: `+359 888 123 456`
- Same email everywhere: `info@novanest.bg`

### 4. **Better UX** ✅
- Mobile users can click to call directly
- Email links pre-fill recipient address
- Contact form is accessible from anywhere via `/#contact`

## Testing Checklist

### Phone Links
- [x] Desktop header phone link works
- [x] Mobile menu phone link works
- [x] Neighborhood page phone buttons work (2 locations)
- [x] WhyChooseUsSection phone button works
- [x] All phone links use `+359888123456`

### Email Links
- [x] Neighborhood page email button works
- [x] Opens default email client
- [x] Pre-fills `info@novanest.bg`

### Contact Navigation
- [x] Header "Свържете се" button goes to `/#contact`
- [x] Neighborhood page "Свържете се с нас" goes to `/#contact`
- [x] Both scroll to ContactCTASection on home page

### Display Consistency
- [x] Phone number displays as `+359 888 123 456` everywhere
- [x] No placeholder values like `+359XXXXXXXXX`
- [x] No outdated numbers like `+359881234567`

## No More Issues

### Verified Clean
```bash
# No more hardcoded phone numbers
grep -r "tel:\+359[0-9]" src/
# No results

# No more broken /contact links
grep -r 'href="/contact"' src/
# No results
```

All contact functionality now works correctly and uses centralized configuration! 🎉

## Future Maintenance

To update contact information site-wide:
1. Edit `src/config/site.ts`
2. Update `site.contact.phone` and/or `site.contact.phoneDisplay`
3. Update `site.contact.email` if needed
4. Changes propagate automatically to all components

No need to search and replace across multiple files!

