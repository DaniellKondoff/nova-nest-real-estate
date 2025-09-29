import { getBrowserClient } from "@/lib/supabase/client";
import type { Database, Tables } from "@/types/database.generated";

export interface Testimonial {
  id: string;
  testimonial: string;
  clientName: string;
  rating: number;
  role?: string | null;
  createdAt: string;
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

type TestimonialsSelect = Pick<
  Tables<"testimonials">,
  | "id"
  | "client_initial"
  | "client_name"
  | "client_role"
  | "content_bg"
  | "created_at"
  | "is_published"
  | "rating"
>;

function mapRowToTestimonial(row: TestimonialsSelect): Testimonial | null {
  // Only include rating >= 4 and published (approved)
  if (!row.is_published) return null;
  const rating = row.rating ?? 0;
  if (rating < 4) return null;
  return {
    id: String(row.id),
    testimonial: row.content_bg,
    clientName: row.client_initial ?? row.client_name,
    rating,
    role: row.client_role ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getApprovedTestimonials(limit = 10): Promise<Testimonial[]> {
  try {
    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select(
        "id, client_initial, client_name, client_role, content_bg, created_at, is_published, rating"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // Surface a Bulgarian message upwards
      throw new DatabaseError("Не успяхме да заредим отзивите от базата данни.");
    }

    const mapped = (data ?? [])
      .map(mapRowToTestimonial)
      .filter((t): t is Testimonial => Boolean(t));

    return mapped;
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Testimonials fetch error:", err);
    }
    if (err instanceof DatabaseError) {
      throw err;
    }
    // Graceful fallback – return empty array; callers can show empty state
    return [];
  }
}

export { DatabaseError };


