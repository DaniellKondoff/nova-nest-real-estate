# Nova Nest: UX, Functionality & SEO Audit

_Date: 2026-10-30 · Branch: `dev/public-ui-ssr-mobile` · Scope: public site and admin panel · Bulgarian only_

**How this audit was done**
- Read the code end to end.
- Ran `npm run dev` against the Supabase project in `.env.local` and fetched `/`, `/properties/`, `/imoti-za-prodazhba/`, `/centar/`, `/properties/45-apartament-3-stai-opalchenski/` and a 404 URL. From each I checked the title, meta description, canonical, robots, H1 and JSON-LD.
- Ran `npm run type-check` (clean) and ESLint (0 errors, 181 warnings).

**Limits**
- I had no browser screenshot tool, so visual and mobile layout claims come from the markup and Tailwind classes.
- Each finding that rests on an assumption is labelled **(assumption)**.

**Overall:** the codebase is already in good shape.
- Pages are rendered on the server.
- Canonical URLs, landing pages and the sitemap are well thought out.
- Mobile tap targets and native GET forms are done right.

The findings below are the gaps that remain.

---

## 1. Executive summary: the 5 most impactful improvements

1. **Show listings on the home page.** The home page has a search box, marketing sections and testimonials, but not one property. Visitors who don't search see nothing to buy or rent. Google also gets no link from the strongest page to fresh listings. Adding a "Нови обяви" row of 6 cards is the biggest single conversion and SEO win. (UX-1)
2. **Make the inquiry pipeline safe and reliable.** The inquiry form has five problems:
   - no spam protection or rate limit;
   - no GDPR consent and no privacy policy page;
   - the notification email puts the visitor's text into HTML without escaping it;
   - the email doesn't say which property the inquiry is about;
   - the email is sent "fire-and-forget", and Vercel can stop the function before it goes out.

   Leads are the business, so this comes first. (F-1, F-2, F-3)
3. **Fix search for how Bulgarians actually search.** There is no rooms filter ("двустаен", "тристаен"). The `minBedrooms`, `new` and `featured` URL filters are read but then ignored. Feature filters return listings with *any* chosen feature instead of *all* of them. (F-4, F-5)
4. **Stop publishing structured data that can backfire.** Every page, including property pages, outputs the Organization schema with `aggregateRating` and 7 `Review` objects taken from your own testimonials. Google treats that as self-serving review markup, and your own CLAUDE.md rule says never to attach reviews to listings. The hero and About sections also claim "95% успешни сделки", "24/7 съдействие" and "100% доверие" with no source. "24/7" also contradicts your posted hours. (S-1, UX-2)
5. **Close the AI-chat cost hole.** `/api/chat` has two problems:
   - its rate limiter lives in server memory, which doesn't persist on Vercel;
   - the message history it accepts has no length limit.

   Anyone can script large requests against your Anthropic key. (F-6)

---

## 2. Findings by area

Impact: **H** / **M** / **L**. Effort: **S** (≤ ½ day) / **M** (1–3 days) / **L** (> 3 days).

### UX & conversion

#### UX-1: The home page shows no properties · Impact H · Effort S · ✅ Done
- **Problem:** `/` renders Hero → About → Services → Why us → Testimonials → Contact. There is no listing card anywhere. A real-estate visitor's first question is "what do you have?" To answer it they must use the search form or find "Всички имоти". The home page is also the strongest page for crawling, and it doesn't link to any property.
- **Where:** `src/app/(site)/page.tsx:38-52`
- **Fix:** add a server-rendered "Нови обяви" section right after the hero. Reuse the existing helpers:
  ```tsx
  // src/components/home/LatestListingsSection.tsx (server)
  const { properties } = await searchPropertyListings({}, 1, 6);
  return (
    <Section aria-labelledby="latest-title">
      <SectionHeading id="latest-title" title="Нови обяви" />
      <PropertyGrid properties={properties} />
      <Button asChild variant="outline"><Link href="/properties/">Всички имоти</Link></Button>
    </Section>
  );
  ```
  Add links to the sale and rent landing pages under it. The counts are already available from `getSiteNavLinks()`.

#### UX-2: The trust stats are unsubstantiated and contradict the business hours · Impact M · Effort S · ✅ Done
- **Problem:** the hero and About sections show "95% Успешни сделки", "24/7 Съдействие/Поддръжка" and "100% Доверие". "24/7" contradicts `site.contact.businessHours` (Sunday: "Почивен ден"). Claims that can't be verified lower trust. Under Bulgarian consumer-protection rules (ЗЗП) they could also count as misleading advertising **(assumption, legal review advised)**.
- **Where:**
  - `src/components/home/HeroSection.tsx:24-28`
  - `src/components/home/AboutSection.tsx:32-33`
  - `src/config/site.ts:16-20`
- **Fix:** replace them with real, live numbers. The active listing count and the number of neighborhoods covered come from `getCachedListingIndex()`. Add years in business and a real count of closed deals. Use "Пон–Съб" instead of "24/7".

#### UX-3: The inquiry form asks for the wrong required field and has no "viewing" option · Impact M · Effort S
- **Problem:** the email field is required and the phone field is optional. Most Bulgarian property leads are followed up by phone, so a lead without a phone number is hard to work. Visitors also can't say "I want a viewing", although the API already accepts `inquiry_type: "viewing_request"`.
- **Where:**
  - `src/lib/validations.ts:243-258`: `ContactFormSchema` requires `email` and makes `phone` optional.
  - `src/components/property/PropertyInquiryForm.tsx:47-48`: the form hardcodes `inquiry_type: "property_interest"`.
  - `src/app/api/inquiries/route.ts:12-14`: the API's list of inquiry types.
- **Fix:**
  - Require a phone **or** an email (a Zod `.refine` on the whole object), and show the phone field first.
  - Add two chips, "Искам оглед" and "Искам повече информация", that set `inquiry_type`.
  - Relax the name regex at `validations.ts:241`. It rejects apostrophes, dots and Cyrillic letters outside а–я, such as "ѝ".

#### UX-4: No Viber or WhatsApp contact · Impact M · Effort S · 🟡 Quick-win part done
- **Problem:** Viber is the main messaging app in Bulgaria. The sticky mobile bar and the agent card offer only a phone call or a form. Many buyers browse at times when they won't call, such as evenings or at work, but would send a message.
- **Where:** `src/components/property/MobileContactBar.tsx:41-48`, `src/components/property/PropertyContact.tsx:38-47`
- **Fix:**
  - Add a Viber deep link that pre-fills the property URL. Add WhatsApp the same way if you want.
  - Keep the phone number in one place, `site.contact`.
  ```tsx
  <a href={`viber://chat?number=${encodeURIComponent(site.contact.phone)}&draft=${encodeURIComponent(`Здравейте, интересувам се от ${absoluteUrl(path)}`)}`}>Viber</a>
  ```

#### UX-5: There is no contact or about page; "Свържете се" jumps to a home-page anchor · Impact M · Effort M
- **Problem:** 9 CTAs point to `/#contact`. On a property page, that throws the visitor off the listing and onto the home page. `/about` and `/contact` 301-redirect to anchors (`next.config.ts`, the "Pages that never existed" block). Visitors therefore have no page with the address, map, hours and the people behind the agency. SEO impact is covered in S-3.
- **Fix:** create `/kontakti/` (NAP, map embed, hours, contact form, Viber) and `/za-nas/` (agent bio and photo, licence, years in business). Point the global CTAs to `/kontakti/`. On property pages, keep CTAs pointing to `#contact-sidebar`, which already exists.

#### UX-6: Village listings show "кв. <village>" · Impact L · Effort S · ✅ Done
- **Problem:** the property card hardcodes `кв. ${neighborhoodName}`, but the project has `neighborhoodLabel()`, which returns "село X" for villages. Cards for village listings read "кв. Богомилово".
- **Where:**
  - `src/components/property/PropertyCard.tsx:136`
  - `src/app/(site)/[neighborhood-slug]/page.tsx:115-116` ("в квартал …")
- **Fix:** `{neighborhoodLabel(neighborhoodName) ?? "Стара Загора"}`

---

### Functionality

#### F-1: The public inquiry endpoint has no spam or abuse protection · Impact H · Effort S · 🟡 Quick-win part done
- **Problem:** `POST /api/inquiries` writes to the database with the **service role** key and sends an email, with no rate limit, honeypot or bot check. One script can flood both the admin inbox and the Resend quota.
- **Where:** `src/app/api/inquiries/route.ts:17-44`
- **Fix:**
  - Add a hidden honeypot field, and reject it if it is filled.
  - Reject submissions that arrive less than about 3 s after the page loaded.
  - Add a per-IP limit stored somewhere durable: Upstash, or a Supabase `inquiry_rate` table with a 10-minute window.
  - Add Cloudflare Turnstile only if spam continues.

#### F-2: Notification email is HTML-injectable, has no property context, and may never send · Impact H · Effort S · ✅ Done
- **Problem:**
  1. `message` and `full_name` go into the email HTML without escaping. Anyone can put links or fake "admin" content into the agency's inbox, a phishing vector.
  2. The email omits `property_id` and `inquiry_type`, so the agent can't tell which listing the lead is about without opening the admin panel.
  3. The email is sent fire-and-forget after the response returns. On Vercel the function can be frozen before the send finishes. Use `after()` from `next/server`, which Next 15.1+ provides.
  4. The `to:` address is hardcoded instead of coming from `site.contact.email`.
- **Where:** `src/lib/email.ts:13-33`, `src/app/api/inquiries/route.ts:54-63`
- **Fix:**
  ```ts
  import { after } from "next/server";
  after(() => sendInquiryNotification({ ...data, inquiryId: inserted.id, propertyId: data.property_id, inquiryType }));
  // in email.ts: escape every interpolated value
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  ```
  Add the property headline and its public URL to the email, and set `replyTo: email`.

#### F-3: No privacy policy and no consent on forms (GDPR) · Impact H · Effort S
- **Problem:** the contact and inquiry forms collect name, email, phone and a free-text message. The site has no privacy policy page and no consent notice. That is a GDPR (Регламент 2016/679) transparency requirement, and the Bulgarian data protection authority (КЗЛД) enforces it **(assumption: legal text to be supplied by the business)**.
- **Where:**
  - The forms: `src/components/forms/ContactForm.tsx`, `src/components/property/PropertyInquiryForm.tsx`
  - The footer, which has no legal links: `src/components/layout/Footer.tsx`
- **Fix:**
  - Add a `/politika-za-poveritelnost/` page and link it from the footer.
  - Add one line under each submit button: "С изпращането се съгласявате с обработката на данните ви съгласно Политиката за поверителност."

#### F-4: Some search filters are silently ignored · Impact M · Effort S · ✅ Done (rooms landing pages still open)
- **Problem:** `urlParamsToFilters` parses `minBedrooms`, `featured` and `new`, and `countActiveFilters` counts them. `searchPropertyListings` then builds `queryFilters` without them, and `hasSearchCriteria` ignores them too. A link such as `?minBedrooms=2` shows "1 active filter" but returns unfiltered results. The UI also has no **rooms** filter, which is the primary search axis in Bulgaria ("едностаен / двустаен / тристаен / многостаен").
- **Where:**
  - `src/lib/queries/property-listings.ts:37-48`, `:82-91`
  - `src/lib/search/params.ts:85-87`
  - `src/components/property/listing/PropertyFilterForm.tsx`
- **Fix:**
  - Add a `rooms` URL parameter as a multi-select: 1, 2, 3, 4+.
  - Pass it, plus `isNew` and `isFeatured`, through to the query as `.in("rooms", …)` / `.gte("rooms", 4)`.
  - Show it as chips in the filter bar.
  - Consider landing pages such as `/imoti-za-prodazhba/dvustaini-apartamenti/` later. These are high-volume search queries.

#### F-5: Feature filter returns "any of" instead of "all of", and loads the whole join table · Impact M · Effort S · ✅ Done (run migration 015)
- **Problem:** with features "Асансьор" and "Паркинг" selected, users get listings that have *either* feature. The query also fetches every matching `property_property_features` row with no limit, then filters in JavaScript.
- **Where:** `src/lib/queries/properties.ts:114-130` (and the same pattern in the fallback)
- **Fix:** group by `property_id` and keep only properties where the count equals the number of selected features. Do it in the `search_properties_v2` RPC (`HAVING count(DISTINCT feature_id) = cardinality(p_feature_ids)`). Add a migration in `scripts/migrations/`.

#### F-6: The AI chat endpoint can be abused for cost · Impact H · Effort S · 🟡 Quick-win part done
- **Problem:**
  - The rate limiter is a module-level `Map`. On Vercel each instance has its own copy, and cold starts reset it, so the limit barely applies. The map is also never pruned.
  - `history` allows 20 messages with **no maximum length per message**, and `message` has no maximum length either. Each request can push very large prompts to Anthropic.
  - The IP comes from the first `x-forwarded-for` value, which a client can spoof unless the platform overwrites it. On Vercel, prefer `x-real-ip`.
- **Where:** `src/lib/chat/rate-limit.ts:1-28`, `src/app/api/chat/route.ts:8-16`, `:37`
- **Fix:**
  - Add `.max(1000)` on `message` and `.max(2000)` on history content.
  - Cap total characters per request.
  - Move the rate limit to durable storage, shared with F-1.
  - Set a daily spend cap in the Anthropic console.

#### F-7: View counter is inflated · Impact M · Effort S
- **Problem:** the route builds a `rateLimitKey` and never uses it. The comment says "1 view per IP per 5 minutes", but every page load counts. Googlebot runs JavaScript, so its renders count as views too **(assumption: Googlebot executes the POST; it generally does fetch during render)**. As a result, the numbers in `/admin/analytics/views` are unreliable.
- **Where:** `src/app/api/properties/[id]/view/route.ts:22-36`, `src/hooks/usePropertyViewTracking.ts`
- **Fix:**
  - On the client, skip known bots (`/bot|crawl|spider|lighthouse/i.test(navigator.userAgent)`).
  - Dedupe per session with `sessionStorage`.
  - Dedupe on the server: insert `(property_id, ip_hash, day)` into a views table with a unique constraint.

#### F-8: No error boundary on the public site · Impact M · Effort S · ✅ Done
- **Problem:** the app has `not-found.tsx` files but no `error.tsx` or `global-error.tsx` anywhere. If Supabase is slow or down, `/properties/` and the landing pages throw (for example, `property-listings.ts` throws "Грешка при извличане на данни"). Visitors then get the generic Next.js error screen, with no phone number and no way back.
- **Fix:** add `src/app/(site)/error.tsx` as a client component. It should say "Нещо се обърка", offer a retry button, show `tel:` and Viber links, and link to `/`. Add a minimal `src/app/global-error.tsx` as well.

#### F-9: Admin inquiries page loads every inquiry in the browser · Impact M · Effort M
- **Problem:**
  - The page queries Supabase directly from the browser with no `.range()` and filters in memory. A paginated `GET /api/admin/inquiries` already exists (limit 20) and is bypassed.
  - The page also re-checks auth on the client, which the middleware already does, and reports errors through `alert()` (29 `alert`/`confirm` calls across admin).
  - The page selects `price_bgn`, which is a legacy currency now that the site shows EUR.
- **Where:** `src/app/admin/inquiries/page.tsx:40-57`, `:83-173`; `src/app/admin/crm/page.tsx:69-158`; `src/app/admin/properties/page.tsx:169,263`
- **Fix:**
  - Use the paginated API and keep status and type filters in the URL.
  - Replace `alert()` with an inline toast or banner component.
  - Add a "new inquiries" badge to the admin header. See also feature idea 6 (inquiry → CRM).

#### F-10: Unused public routes that change property data · Impact L · Effort S
- **Problem:** `POST /api/properties`, `PUT`/`DELETE /api/properties/[id]` and `POST /api/properties/[id]/images` are admin-guarded, but the admin UI doesn't use them; it uses `/api/admin/properties/*`. They also skip `revalidatePublicPages()`, so any use of them leaves public pages stale. This is extra attack surface and a source of confusion.
- **Fix:** remove the mutating handlers and keep the `GET`s. Confirm first that no external tool calls them **(assumption)**.

---

### SEO

#### S-1: Review markup appears site-wide, including on listing pages · Impact M · Effort S · ✅ Done
- **Problem:** `OrganizationSchema` is rendered in the root layout and contains `aggregateRating` plus 7 `Review` objects from the testimonials. The live HTML of `/properties/45-…/` and `/centar/` both contain `"@type":"Review"` ×7. Google says reviews a business publishes about itself on its own site are not eligible for review rich results. That also breaks your own rule: "Never attach testimonials/reviews to listings."
- **Where:** `src/components/seo/StructuredData.tsx:15-30`, `src/app/layout.tsx:29`
- **Fix:** drop `review` and `aggregateRating` from the Organization or RealEstateAgent schema. Keep testimonials as visible HTML on the home page only. Send customers to Google Business Profile reviews instead (see feature idea 7).

#### S-2: Property meta descriptions leak ALL-CAPS admin text · Impact M · Effort S · ✅ Done
- **Problem:** the meta description adds `description_bg` as it is. The live example reads: "…Цена 79 990 € (1509 €/м²). 2+КУХНЯ | КВ. ОПЪЛЧЕНСКИ | 53 КВ.М | 6-ТИ…". That's a shouty, cut-off search snippet that repeats facts already given. The H1 also shows "53.01 м²" where "53 м²" was intended.
- **Where:** `src/lib/seo/property-metadata.ts:103`, plus the area formatting in `propertyHeadline()`
- **Fix:**
  - Drop leading description lines that are mostly upper-case or pipe-separated.
  - Run the rest through the sentence-casing in `displayTitle()`.
  - Round the area for display (`Math.round` in the headline, one decimal in the facts table).

#### S-3: No local-SEO landing page for the agency itself · Impact M · Effort M
- **Problem:** the queries "агенция за недвижими имоти Стара Загора" and "контакти" have no dedicated page. The home page is doing every job at once. Without an About page, Google has nothing about who stands behind the listings, which hurts E-E-A-T in a "your money" category such as real estate.
- **Fix:** build the pages from UX-5:
  - `/kontakti/` with a `RealEstateAgent` schema that reuses `site.ts`, an embedded map and opening hours.
  - `/za-nas/` with a `Person` schema for the manager.
  - Add both to `sitemap.ts`.
  - Replace the `/about` and `/contact` redirects so they point to the new pages.

#### S-4: Favicon, logo and PWA icons are one mislabelled JPEG · Impact M · Effort S
- **Problem:** `public/favicon.ico`, `public/favicon.png` and `public/images/logo.png` are byte-identical JPEG files (`ff d8 ff e0` header, same MD5). The consequences:
  - `manifest.json` declares them as 192×192 and 512×512 PNGs.
  - The Organization schema `logo` points to a ".png" that is actually a JPEG.
  - Google's favicon in search results and the iOS home-screen icon may not show, or may look blurry.
- **Where:** `public/`, `public/manifest.json`, `src/lib/seo/generate-schema.ts:35`, `src/lib/seo/metadata.ts:123-131`
- **Fix:**
  - Export real square assets from `logo.svg`: `favicon.ico` (32), `icon.png` (512), `apple-icon.png` (180), `logo.png` (a real PNG of at least 112 px).
  - Better still, use the Next file conventions `src/app/icon.png` and `apple-icon.png`.

#### S-5: Leftover English-locale code · Impact L · Effort S
- **Problem:** the site is Bulgarian-only, which is correct: there is no hreflang to emit. However, `middleware.ts:9-13`, the `/en` redirect in `next.config.ts` and `src/lib/i18n/locales.ts` keep English-locale code alive, and CLAUDE.md still says "English secondary".
- **Fix:** keep the `/en/*` → `/` 301 redirect, since old links may exist. Remove the duplicate redirect from either middleware or config, and update CLAUDE.md.

**What's already right (no action needed):**
- Every checked page has one H1 and a unique title and description.
- Canonicals are absolute and end with a slash.
- Filter combinations use `noindex,follow`.
- The sitemap lists only indexable URLs and includes image entries.
- `robots.txt` blocks only `/admin/` and `/api/`.
- Property URLs carry slugs and redirect with a 301 when the slug changes.
- There are per-property OG images.
- Closed listings stay live with a "sold/rented" notice.

---

### Accessibility (WCAG 2.1 AA)

#### A-1: Low-contrast text · Impact M · Effort S · ✅ Done
- **Problem:** the contrast ratios below are computed from the tokens in `globals.css`. Charcoal (#2d3748) is the base colour for the opacity variants. AA requires at least 4.5:1 for small text.

  | Class | Contrast on white | Example |
  |---|---|---|
  | `text-charcoal/50` | ≈ 2.8:1 | "(по избор)", "Отговаряме в рамките на работния ден." in `PropertyInquiryForm.tsx` |
  | `text-charcoal/60` (20 uses) | ≈ 3.7:1 | business hours line, `PropertyContact.tsx:45` |
  | `text-charcoal/40` (3 uses) | ≈ 2.2:1 | |
  | `text-gray-400` (53 uses) | ≈ 2.5:1 | mostly placeholders and the "€" unit suffix |
- **Fix:** use `text-charcoal/75` (≈ 6:1) as the minimum for informative text, and `placeholder:text-gray-500`. Add a `text-subtle` token to `@theme` so the value lives in one place.

#### A-2: Chat widget is not usable with a screen reader or keyboard · Impact M · Effort S · 🟡 Quick-win part done
- **Problem:**
  - Streamed answers aren't announced, because the message list has no `aria-live` or `role="log"`.
  - There is no Escape-to-close.
  - On mobile the panel is full-screen (`inset-0`) but declared `aria-modal="false"` and doesn't trap focus, so focus can move to the hidden page behind it.
  - The close button's `X` icon has no `aria-hidden`.
- **Where:** `src/components/chat/ChatWidget.tsx:194-196`, `:216-219`, `:222`
- **Fix:**
  - Add `role="log" aria-live="polite"` to the message list container.
  - Close on Escape and return focus to the launcher.
  - On mobile, use the Radix Dialog that is already a dependency, which provides modal semantics and the focus trap.

#### A-3: The inquiry message error isn't tied to its field · Impact L · Effort S · ✅ Done
- **Problem:** the `<textarea>` gets `aria-invalid`, but its error `<p>` has no `id` or `aria-describedby`, unlike the input fields in the same form. Screen-reader users hear "invalid" with no reason.
- **Where:** `src/components/property/PropertyInquiryForm.tsx:127-135`
- **Fix:** add `id="inq-message-error"` and `aria-describedby`, and move focus to the first invalid field on submit, as `ContactForm` already does.

---

### Performance

#### P-1: Filtered search makes 3–4 sequential database round trips · Impact M (grows with inventory) · Effort M
- **Problem:** with any filter applied, `/properties/` runs four steps in sequence:
  1. the `search_properties_v2` RPC, which returns every match;
  2. an optional feature-join query;
  3. a second query that sorts all matched IDs;
  4. a fourth query for the page's details.

  With today's inventory (~16 for sale) this is fast. At a few hundred listings it adds roughly 100–300 ms to TTFB per filter change, and because the page is fully dynamic it isn't cached **(assumption: Supabase round trip ≈ 50–80 ms from Vercel `fra1`)**.
- **Where:** `src/lib/queries/property-listings.ts:72-160`, `src/lib/queries/properties.ts:84-139`
- **Fix:** make the RPC do filtering, feature AND-matching (F-5), status, sort, `LIMIT/OFFSET` and `count(*) OVER()` in one call, then run a single details query. Use a migration in `scripts/migrations/`.

#### Other performance notes (no action needed)
- **Already good:**
  - The hero image uses `next/image` with `priority`.
  - The chat JS is loaded only when the visitor shows intent.
  - The listing pages ship almost no client JS.
  - Pages use ISR with on-demand purges.
- **Housekeeping:** 181 ESLint warnings, mostly `no-explicit-any` and unused variables. They don't affect users, but they hide real warnings. Clean them up gradually.

---

## 3. Quick wins (high value, about one day in total) — ✅ all done (2026-10-30)

| # | Item | Ref | Status |
|---|---|---|---|
| 1 | Escape the email HTML, add property and type to the email, send it with `after()`, set `replyTo` | F-2 | ✅ Done |
| 2 | Add a honeypot and a minimum fill time to the inquiry and contact forms | F-1 | ✅ Done |
| 3 | Add `.max()` limits to chat input and history | F-6 | ✅ Done |
| 4 | Remove `review` and `aggregateRating` from the site-wide schema | S-1 | ✅ Done |
| 5 | Replace the "95% / 24/7 / 100%" stats with real numbers | UX-2 | ✅ Done |
| 6 | Add `src/app/(site)/error.tsx` | F-8 | ✅ Done |
| 7 | Use `neighborhoodLabel()` on cards and the neighborhood page | UX-6 | ✅ Done |
| 8 | Clean the property meta description and round the area | S-2 | ✅ Done |
| 9 | Fix the contrast utilities (`/50`, `/60`, `gray-400`) | A-1 | ✅ Done |
| 10 | Add a Viber button to the mobile bar and the agent card | UX-4 | ✅ Done |
| 11 | Fix the textarea `aria-describedby` and add Escape and `aria-live` to the chat | A-2, A-3 | ✅ Done |

---

## 4. New feature ideas

1. **"Нови обяви" on the home page.** See UX-1. This is the cheapest lift for both conversion and crawling.
2. **Rooms filter and landing pages for it ("двустайни апартаменти Стара Загора").** This is how Bulgarians search. It's a natural extension of the existing landing-page system in `lib/seo/landing.ts`.
3. **Saved listings without an account.** Store a heart toggle in `localStorage` and add a `/izbrani/` page that renders the saved IDs with a server action. The site has no user accounts, and buyers compare 3–5 flats over days.
4. **"Уведоми ме за нови обяви" (saved-search email alerts).** Store a filter set and an email address (double opt-in), then send matches with the Resend account you already have when an admin publishes. Inventory is small (~16 for sale), so capturing demand when nothing matches today is valuable. The empty states already say "Свържете се, за да ви уведомим".
5. **Map on the property page.** `latitude` and `longitude` are already stored and used in the schema but never shown. Add a lightweight static map image or a click-to-load embed so the page stays fast.
6. **Turn an inquiry into a CRM contact in one click.** Inquiries and the CRM are separate today, so agents re-type leads. Add a button in `InquiryDetailsModal` that creates the `crm_contact`, links the property and logs the message as the first activity.
7. **Ask for Google reviews after a deal.** Testimonials can't earn stars in search (S-1), but Google Business Profile reviews drive the local map pack. Add a "Request review" action to closed CRM contacts that emails the GBP review link.
8. **Free valuation form ("Безплатна оценка").** `inquiry_type: "valuation"` already exists, and the header already says "Продавате или отдавате имот? Безплатна оценка". It deserves its own short form, asking for address, type and m², because seller leads are worth the most.
9. **Price per m² on cards.** It is already computed for meta descriptions (`property-metadata.ts:97`). Bulgarian buyers compare on €/m², so show it on cards next to the price.

---

## 5. Suggested roadmap

1. **Week 1: protect leads and trust.** F-2, F-1, F-3, F-6, S-1, UX-2, F-8. This is all safety and correctness, with no design work.
2. **Week 1–2: conversion basics.** UX-1 (home listings), UX-4 (Viber), UX-3 (phone-first form with a viewing option), UX-6, A-1, A-2, A-3.
3. **Week 2: search that matches the market.** F-4 (rooms filter and ignored params), F-5 (AND features), then P-1 (a single-RPC search) in the same migration.
4. **Week 3: local SEO pages.** UX-5 and S-3 (`/kontakti/`, `/za-nas/`, `/politika-za-poveritelnost/`), S-2, S-4 (icons).
5. **Week 3–4: admin efficiency.** F-9 (paginated inquiries, no `alert()`), feature 6 (inquiry → CRM), F-7 (honest view counts), F-10.
6. **After that: growth features.** Rooms landing pages, saved listings, saved-search alerts, a valuation form, maps and €/m² on cards.
