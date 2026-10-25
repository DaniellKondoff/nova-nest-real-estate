import { formatPrice } from "@/components/property/utils";
import { listingCountLabel, type ListingStats } from "./landing";

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
