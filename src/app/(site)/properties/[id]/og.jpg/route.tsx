import { fetchPropertyDetails } from "@/lib/queries/property-detail";
import { extractPropertyId } from "@/lib/seo/property-slug";
import { neighborhoodLabel } from "@/lib/seo/property-metadata";
import { renderOgCard, toJpegResponse } from "@/lib/seo/og-image";
import { formatPrice } from "@/components/property/utils";

/**
 * Listing share card for Facebook/Messenger/Viber: primary photo + price, area and rooms.
 *
 * A route handler on a ".jpg" path instead of the opengraph-image file convention: Next's trailingSlash
 * redirect skips paths with a file extension, so crawlers get a 200 directly. The file convention emitted an
 * extensionless URL that 308-redirected first, and Facebook/Messenger then showed no image at all.
 * The URL is versioned with ?v=<updated_at> (see propertyOgImageUrl), so it can be cached for a long time.
 */
const CACHE_HEADERS = { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800" };

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idNum = /^\d+$/.test(id) ? Number(id) : extractPropertyId(id);
  const details = idNum ? await fetchPropertyDetails(idNum) : null;

  if (!details) {
    const fallback = await renderOgCard({ eyebrow: "Недвижими имоти", title: "Имоти в Стара Загора" });
    return toJpegResponse(fallback, CACHE_HEADERS);
  }

  const { property, category, neighborhood, images } = details;
  const primary = [...(images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )[0];
  const operation = property.operation_type === "rent" ? "под наем" : "за продажба";
  const nbh = neighborhoodLabel(neighborhood?.name_bg);

  const card = await renderOgCard({
    variant: "photo",
    eyebrow: nbh ? `${nbh} · Стара Загора` : "Стара Загора",
    title: `${category?.name_bg ?? "Имот"} ${operation}`,
    facts: [
      typeof property.price_eur === "number" && property.price_eur > 0 ? formatPrice(property.price_eur) : null,
      property.area_sqm ? `${Math.round(property.area_sqm)} м²` : null,
      property.rooms ? (property.rooms === 1 ? "1 стая" : `${property.rooms} стаи`) : null,
    ].filter((f): f is string => Boolean(f)),
    imageUrl: primary?.url ?? null,
  });
  return toJpegResponse(card, CACHE_HEADERS);
}
