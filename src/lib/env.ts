import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL" })
    .describe("Public URL of your Supabase project"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, { message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required" }),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url({ message: "NEXT_PUBLIC_APP_URL must be a valid URL" })
    .optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, { message: "SUPABASE_SERVICE_ROLE_KEY is required (server-only)" }),
  RESEND_API_KEY: z.string().optional(),
  SMTP_FROM_EMAIL: z
    .string()
    .email({ message: "SMTP_FROM_EMAIL must be a valid email" })
    .optional(),
  GOOGLE_MY_BUSINESS_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function formatIssues(issues: z.ZodIssue[]): string {
  return issues.map((i) => `- ${i.path.join(".") || "value"}: ${i.message}`).join("\n");
}

export const env: PublicEnv = (() => {
  // Build an explicit object so Next.js inlines these keys in client bundles
  const raw = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  };
  const parsed = clientEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const message =
      "Missing or invalid public environment variables:\n" +
      formatIssues(parsed.error.issues) +
      "\n\nCheck your .env.local and ensure all NEXT_PUBLIC_* values are set.";
    throw new Error(message);
  }
  return {
    NEXT_PUBLIC_SUPABASE_URL: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: parsed.data.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SITE_NAME: parsed.data.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_GA_ID: parsed.data.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: parsed.data.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  };
})();

// Note: Call this ONLY on the server. Do not import in client components.
export function getServerEnv(): ServerEnv {
  // Explicit object for clarity
  const raw = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    GOOGLE_MY_BUSINESS_API_KEY: process.env.GOOGLE_MY_BUSINESS_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  };
  const parsed = serverEnvSchema.safeParse(raw as Record<string, unknown>);
  if (!parsed.success) {
    const message =
      "Missing or invalid server-only environment variables:\n" +
      formatIssues(parsed.error.issues) +
      "\n\nSet these in .env.local and never expose them to the client.";
    throw new Error(message);
  }
  return {
    SUPABASE_SERVICE_ROLE_KEY: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: parsed.data.RESEND_API_KEY,
    SMTP_FROM_EMAIL: parsed.data.SMTP_FROM_EMAIL,
    GOOGLE_MY_BUSINESS_API_KEY: parsed.data.GOOGLE_MY_BUSINESS_API_KEY,
    OPENAI_API_KEY: parsed.data.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: parsed.data.ANTHROPIC_API_KEY,
  };
}


