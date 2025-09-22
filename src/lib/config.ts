/*
 * Application configuration and environment helpers for Nova Nest Real Estate.
 * Provides type-safe access to environment variables, localized formatting
 * utilities for Bulgarian market, and grouped service configurations.
 */

type NonEmptyString<T extends string> = T & { __brand: "NonEmptyString" };

function requireEnv(name: string): NonEmptyString<string> {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value as NonEmptyString<string>;
}

function optionalEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name];
  if (value && value.trim().length > 0) return value;
  return fallback;
}

function parseNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw.trim() === "") return fallback;
  const num = Number(raw);
  if (Number.isNaN(num)) {
    throw new Error(`Invalid number for environment variable ${name}: ${raw}`);
  }
  return num;
}

function parseCSVEnv(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export const appConfig = {
  siteName: optionalEnv("NEXT_PUBLIC_SITE_NAME", "Nova Nest Real Estate")!,
  appUrl: optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")!,
  locale: "bg",
  fallbackLocale: "en",
} as const;

export const supabaseConfig = {
  url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  serviceRoleKey: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"), // server-only usage
} as const;

export const uploadConfig = {
  maxFileSizeBytes: parseNumberEnv("MAX_FILE_SIZE", 5 * 1024 * 1024),
  allowedFileTypes: parseCSVEnv("ALLOWED_FILE_TYPES", ["jpg", "jpeg", "png", "webp"]),
} as const;

export const emailConfig = {
  resendApiKey: optionalEnv("RESEND_API_KEY"),
  fromEmail: optionalEnv("SMTP_FROM_EMAIL", "info@novanest.bg")!,
} as const;

export const googleConfig = {
  mapsApiKey: optionalEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"),
  myBusinessApiKey: optionalEnv("GOOGLE_MY_BUSINESS_API_KEY"),
  analyticsId: optionalEnv("NEXT_PUBLIC_GA_ID"),
  searchConsoleKey: optionalEnv("GOOGLE_SEARCH_CONSOLE_KEY"),
} as const;

// Bulgarian locale and currency utilities
const bgLocale = "bg-BG";
const eurLocale = "de-DE"; // common formatting for EUR

export function formatCurrencyBGN(amount: number): string {
  return new Intl.NumberFormat(bgLocale, {
    style: "currency",
    currency: "BGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyEUR(amount: number): string {
  return new Intl.NumberFormat(eurLocale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAreaSqm(area: number): string {
  return `${new Intl.NumberFormat(bgLocale, { maximumFractionDigits: 0 }).format(area)} кв.м`;
}

export function buildCanonicalUrl(pathname: string): string {
  const base = appConfig.appUrl.replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export type AppConfig = typeof appConfig;
export type SupabaseConfig = typeof supabaseConfig;
export type UploadConfig = typeof uploadConfig;
export type EmailConfig = typeof emailConfig;
export type GoogleConfig = typeof googleConfig;


