import { getServiceClient } from "@/lib/supabase/service";

// ---------------------------------------------------------------------------
// Keyword → category name mapping (Bulgarian)
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Array<{ patterns: RegExp[]; nameBg: string }> = [
  { patterns: [/\bпарцел[и]?\b/i, /\bземя\b/i, /\bземеделска\b/i], nameBg: "Парцел" },
  { patterns: [/\bапартамент[и]?\b/i, /\bжилище\b/i],               nameBg: "Апартамент" },
  { patterns: [/\bкъща\b/i, /\bкъщи\b/i, /\bвила\b/i],              nameBg: "Къща" },
  { patterns: [/\bофис[и]?\b/i],                                     nameBg: "Офис" },
  { patterns: [/\bгараж[и]?\b/i],                                    nameBg: "Гараж" },
  { patterns: [/\bтърговски\b/i, /\bмагазин[и]?\b/i],               nameBg: "Търговски имот" },
];

// ---------------------------------------------------------------------------
// In-memory cache (populated once per process)
// ---------------------------------------------------------------------------

let categoryCache: Array<{ id: number; nameBg: string }> | null = null;

async function loadCategories(): Promise<Array<{ id: number; nameBg: string }>> {
  if (categoryCache) return categoryCache;

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("property_categories")
      .select("id, name_bg");

    if (error || !data) {
      console.warn("[categories] failed to load property_categories:", error?.message);
      return [];
    }

    categoryCache = data.map((row) => ({ id: row.id as number, nameBg: row.name_bg as string }));
    return categoryCache;
  } catch (err) {
    console.error("[categories] unexpected error loading categories:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detects a property type keyword in the query and resolves it to the
 * matching category ID from the database. Returns undefined if no match
 * or if the DB lookup fails — never throws.
 */
export async function getCategoryByKeyword(query: string): Promise<number | undefined> {
  const match = CATEGORY_KEYWORDS.find(({ patterns }) =>
    patterns.some((p) => p.test(query))
  );

  if (!match) return undefined;

  const categories = await loadCategories();
  const row = categories.find(
    (c) => c.nameBg.toLowerCase() === match.nameBg.toLowerCase()
  );

  return row?.id;
}
