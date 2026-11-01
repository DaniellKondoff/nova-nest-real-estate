"use server";

import type { PropertyWithDetails } from "@/types/property";
import { getStaticServerClient } from "@/lib/supabase/server";
import { LISTING_SELECT } from "@/lib/queries/listing-select";
import { mapRow } from "@/lib/queries/property-listings";

const MAX_IDS = 50;

export interface SavedListingsResult {
  /** Listings that still exist, in the saved order */
  items: PropertyWithDetails[];
  /** Ids that are gone (deleted/archived) – the client prunes them from localStorage */
  missing: number[];
  error?: boolean;
}

function sanitizeIds(input: unknown): number[] {
  if (!Array.isArray(input)) return [];
  const ids = input.filter((v): v is number => Number.isInteger(v) && v > 0 && v <= Number.MAX_SAFE_INTEGER);
  return [...new Set(ids)].slice(0, MAX_IDS);
}

/**
 * Loads the visitor's saved listings ("Избрани имоти").
 * Public and read-only: ids come from the visitor's localStorage, only non-archived listings are returned.
 * Returns plain data (not JSX) – client components inside an action's JSX must already be in the page's client manifest.
 */
export async function getSavedListings(input: unknown): Promise<SavedListingsResult> {
  const ids = sanitizeIds(input);
  if (ids.length === 0) return { items: [], missing: [] };

  const { data, error } = await getStaticServerClient()
    .from("properties")
    .select(LISTING_SELECT)
    .in("id", ids)
    .neq("status", "archived");

  // Never prune the visitor's list because of a transient DB error
  if (error) {
    console.error("Saved listings: query failed", error);
    return { items: [], missing: [], error: true };
  }

  const byId = new Map((data ?? []).map((row) => [Number((row as unknown as { id: number }).id), row]));
  return {
    items: ids.filter((id) => byId.has(id)).map((id) => mapRow(byId.get(id))),
    missing: ids.filter((id) => !byId.has(id)),
  };
}
