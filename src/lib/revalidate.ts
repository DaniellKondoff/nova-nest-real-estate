import { revalidatePath, revalidateTag } from "next/cache";
import { LISTINGS_CACHE_TAG } from "@/lib/queries/listing-index";

/**
 * Purges every cached public page after a listing changes.
 * Property pages are cached under their slug URL (not the numeric id) and listings also
 * appear on neighborhood pages, landing pages and in the sitemap, so the whole site is purged.
 * Admin writes are rare, so this is cheaper than tracking every affected path.
 */
export function revalidatePublicPages(): void {
  revalidateTag(LISTINGS_CACHE_TAG);
  revalidatePath("/", "layout");
}
