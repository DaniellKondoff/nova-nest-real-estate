import type { SemanticPropertyResult, SemanticNeighborhoodResult } from "@/lib/search";

/**
 * Converts semantic search results into a readable text block
 * suitable for injection into the LLM context window.
 */
export function formatSearchContext(
  properties: SemanticPropertyResult[],
  neighborhoods: SemanticNeighborhoodResult[],
  siteUrl: string
): string {
  if (properties.length === 0 && neighborhoods.length === 0) {
    return "Не са намерени релевантни имоти.";
  }

  const lines: string[] = [];

  if (properties.length > 0) {
    lines.push(`## Намерени имоти (${properties.length})`);
    for (const p of properties) {
      const op = p.operationType === "sale" ? "Продажба" : "Наем";
      const price = p.priceEur != null ? `${p.priceEur} EUR` : "цена при запитване";
      const area = p.areaSqm != null ? `${p.areaSqm} кв.м` : "площ н/а";
      const rooms = p.rooms != null ? `${p.rooms} стаи` : "стаи н/а";
      const similarity = (p.similarity * 100).toFixed(0);
      lines.push(
        `- ID: ${p.propertyId} | ${op} | ${price} | ${area} | ${rooms} | квартал ID: ${p.neighborhoodId} | релевантност: ${similarity}% | ${siteUrl}/properties/${p.propertyId}`
      );
    }
  }

  if (neighborhoods.length > 0) {
    lines.push("");
    lines.push("## Свързани квартали");
    for (const n of neighborhoods) {
      const similarity = (n.similarity * 100).toFixed(0);
      lines.push(
        `- ${n.nameBg} (${n.slug}) | релевантност: ${similarity}% | ${siteUrl}/${n.slug}`
      );
    }
  }

  return lines.join("\n");
}
