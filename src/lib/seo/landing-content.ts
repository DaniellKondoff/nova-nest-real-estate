import { formatPrice } from "@/components/property/utils";
import type { RoomTypeTile } from "@/components/property/listing/RoomTypeNav";
import type { ListingIndexEntry } from "@/lib/queries/listing-index";
import { ROOM_LANDINGS, listingCountLabel, type ListingStats, type RoomCount, type RoomLanding } from "./landing";

/** Tiles for RoomTypeNav: "Всички" (the apartments page) + one per existing rooms page */
export function roomTiles(
  rooms: RoomLanding[],
  all: { href: string; listings: ListingIndexEntry[] },
  hrefFor: (room: RoomCount) => string,
  active?: RoomCount
): RoomTypeTile[] {
  const allPrices = all.listings.map((l) => l.priceEur).filter((p): p is number => typeof p === "number" && p > 0);
  return [
    {
      href: all.href,
      label: "Всички",
      count: all.listings.length,
      minPrice: allPrices.length ? Math.min(...allPrices) : null,
      active: active == null,
    },
    ...rooms.map((r) => ({
      href: hrefFor(r.room),
      label: ROOM_LANDINGS[r.room].short,
      badge: ROOM_LANDINGS[r.room].badge,
      count: r.listings.length,
      minPrice: r.minPrice,
      active: r.room === active,
    })),
  ];
}

/** Typical size of the listings on a rooms page – "Площ между 48 и 72 м²" keeps the intro factual */
export function areaRangeSentence(listings: ListingIndexEntry[]): string {
  const areas = listings.map((l) => l.areaSqm).filter((a): a is number => typeof a === "number" && a > 0);
  if (areas.length === 0) return "";
  const min = Math.round(Math.min(...areas));
  const max = Math.round(Math.max(...areas));
  return min === max ? `Площта е ${min} м².` : `Площта е между ${min} и ${max} м².`;
}

/** Stat tiles shown under a landing page H1 */
export function statsFacts(stats: ListingStats, isRent: boolean): Array<{ label: string; value: string }> {
  if (stats.count === 0) return [];
  const facts = [{ label: "Активни обяви", value: String(stats.count) }];
  if (stats.minPrice) facts.push({ label: isRent ? "Наем от" : "Цени от", value: formatPrice(stats.minPrice) });
  if (stats.medianPrice && stats.count > 1) facts.push({ label: isRent ? "Среден наем" : "Средна цена", value: formatPrice(stats.medianPrice) });
  if (stats.medianPricePerSqm && !isRent) facts.push({ label: "Средна цена на м²", value: formatPrice(stats.medianPricePerSqm) });
  return facts;
}

/** One factual sentence about the current offer – keeps every landing page's text unique and current */
export function statsSentence(stats: ListingStats, isRent: boolean): string {
  if (stats.count === 0) return "";
  let text = `В момента предлагаме ${listingCountLabel(stats.count)}`;
  if (stats.minPrice) text += ` с ${isRent ? "наем" : "цени"} от ${formatPrice(stats.minPrice)}`;
  text += ".";
  if (stats.medianPricePerSqm && !isRent) text += ` Средната цена е ${formatPrice(stats.medianPricePerSqm)} на квадратен метър.`;
  return text;
}
