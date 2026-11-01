import { fetchPropertyDetails } from "@/lib/queries/property-detail";
import { extractPropertyId } from "@/lib/seo/property-slug";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-image";
import { formatPrice } from "@/components/property/utils";

export const alt = "Имот от Nova Nest – Стара Загора";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

/** Listing card for shares on Viber/Facebook: primary photo + price, area and neighborhood */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = /^\d+$/.test(id) ? Number(id) : extractPropertyId(id);
  const details = idNum ? await fetchPropertyDetails(idNum) : null;

  if (!details) {
    return renderOgCard({ eyebrow: "Недвижими имоти", title: "Имоти в Стара Загора" });
  }

  const { property, category, neighborhood, images } = details;
  const primary = [...(images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )[0];
  const operation = property.operation_type === "rent" ? "под наем" : "за продажба";

  return renderOgCard({
    eyebrow: `${category?.name_bg ?? "Имот"} ${operation}`,
    title: property.title_bg,
    facts: [
      typeof property.price_eur === "number" && property.price_eur > 0 ? formatPrice(property.price_eur) : null,
      property.area_sqm ? `${Math.round(property.area_sqm)} м²` : null,
      neighborhood?.name_bg ?? null,
    ].filter((f): f is string => Boolean(f)),
    imageUrl: primary?.url ?? null,
  });
}
