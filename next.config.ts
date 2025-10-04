import type { NextConfig } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_HOST = (() => {
  try {
    return SUPABASE_URL ? new URL(SUPABASE_URL).hostname : undefined;
  } catch {
    return undefined;
  }
})();

// Placeholder image domain for external property images (replace when ready)
const PROPERTY_IMAGES_HOST = process.env.NEXT_PUBLIC_PROPERTY_IMAGES_HOST || "img.novanest.bg";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "block-all-mixed-content",
  "font-src 'self' https: data:",
  "frame-ancestors 'self'",
  [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    "https://*.googleusercontent.com",
    "https://*.gstatic.com",
    "https://*.google-analytics.com",
    "https://images.unsplash.com",
    "https://*.unsplash.com",
    "https://ui-avatars.com",
    SUPABASE_HOST ? `https://${SUPABASE_HOST}` : undefined,
    `https://${PROPERTY_IMAGES_HOST}`,
  ]
    .filter(Boolean)
    .join(" "),
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://maps.googleapis.com",
  ].join(" "),
  [
    "style-src",
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ].join(" "),
  [
    "connect-src",
    "'self'",
    SUPABASE_HOST ? `https://${SUPABASE_HOST}` : undefined,
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://maps.googleapis.com",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      SUPABASE_HOST
        ? { protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/object/**" }
        : undefined,
      { protocol: "https", hostname: PROPERTY_IMAGES_HOST, pathname: "/**" },
      // Allow example.com for development/demo image sources
      { protocol: "https", hostname: "example.com", pathname: "/**" },
      { protocol: "https", hostname: "maps.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      // Allow Unsplash for testimonial avatars
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "*.unsplash.com", pathname: "/**" },
      // Allow UI Avatars for generated avatars
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/**" },
    ].filter(Boolean) as any,
  },
  serverExternalPackages: ["@supabase/supabase-js"],
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Temporarily disable CSP to test
          // { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Old to new SEO-friendly structures
      // Removed redirects to allow `/imoti` to resolve to its page
      { source: "/apartamenti/centrum", destination: "/apartamenti-centrum-stara-zagora", permanent: true },
      { source: "/apartamenti/centar", destination: "/apartamenti-centrum-stara-zagora", permanent: true },
      { source: "/kusti/samara", destination: "/kushi-samara-stara-zagora", permanent: true },
      // Normalize trailing slash
      { source: "/en", destination: "/", permanent: false },
    ];
  },
  env: {
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_APP_URL: APP_URL,
  },
};

export default nextConfig;
