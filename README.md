This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Nova Nest Real Estate — Project Structure & Setup

### Tech
- Next.js App Router (i18n enabled: `bg` default, `en` secondary)
- Tailwind CSS v4 with inline design tokens
- Inter font (Latin + Cyrillic)
- Supabase client (browser) prepared
- MCP-ready directories for Magic UI

### Design Tokens
Defined in `src/app/globals.css`:

- Brand navy: `#1a2642` → CSS var `--brand-navy` and Tailwind color `brand`
- Gold accent: `#d4af37` → CSS var `--brand-gold` and Tailwind color `accent`

Use examples:

```tsx
<button className="bg-brand text-white hover:bg-brand/90" />
<span className="text-accent" />
```

### Fonts
Inter is loaded in `src/app/layout.tsx` as a CSS variable `--font-inter` and mapped to Tailwind `font-sans`.

### i18n
- Configured in `next.config.ts` with locales: `bg` (default) and `en`.
- Root HTML `lang` is set to `bg`.
- Optional English landing page: `src/app/(site)/en/page.tsx`.

### SEO
- Base metadata configured in `src/app/layout.tsx` (BG language, OpenGraph, alternates)
- Sitemap at `src/app/sitemap.ts`
- `public/robots.txt`

### Supabase
Client at `src/lib/supabase/client.ts` (browser-only). Install deps and set env vars:

```
npm i
```

Environment variables (create `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### MCP: Magic UI Integration
- Directories under `src/magic/` for components, icons, and styles fetched via MCP.
- Add components to `src/magic/components/` as they’re fetched.

### App Structure (key paths)
- `src/app/(site)/` — public site routes (Bulgarian): `imoti`, `za-nas`, `kontakt`
- `src/components/ui/` — minimal UI primitives (e.g., `Button`)
- `src/components/layout/` — shared layout pieces (e.g., `Header`)
- `src/lib/` — utilities (`supabase`, `i18n`)
- `src/config/` — site configuration
- `src/magic/` — MCP-fetched UI

### Run
```
npm run dev
```

