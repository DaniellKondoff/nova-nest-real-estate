"use client";

import { ExternalLink } from "lucide-react";

export interface ParsedProperty {
  id: string;
  operationType: string;
  price: string;
  area: string;
  rooms: string;
  neighborhood: string;
  url: string;
}

/**
 * Parses property lines from assistant context text.
 * Matches lines like:
 *   ID: 42 | Продажба | 120000 EUR | 85 кв.м | 3 стаи | Център | https://…/properties/42
 */
export function parsePropertyLines(text: string): ParsedProperty[] {
  const results: ParsedProperty[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    // Must contain "ID:" and a properties URL
    if (!line.includes("ID:") || !line.includes("/properties/")) continue;

    const idMatch = line.match(/(?:^|\s)ID:\s*(\d+)/);
    const opMatch = line.match(/\|\s*(Продажба|Наем)\s*\|/);
    const priceMatch = line.match(/\|\s*([\d\s.,]+\s*(?:EUR|лв\.?))\s*\|/i);
    const areaMatch = line.match(/\|\s*([\d.,]+\s*кв\.м)\s*\|/);
    const roomsMatch = line.match(/\|\s*(\d+\s*стаи)\s*\|/);
    // Neighborhood: field after rooms, before the URL — any non-pipe text that isn't a URL
    const neighborhoodMatch = line.match(/\|\s*(\d+\s*стаи)\s*\|\s*([^|]+?)\s*\|\s*https?:\/\//);
    const urlMatch = line.match(/(https?:\/\/[^\s|]+\/properties\/\d+\/?)/);

    if (!idMatch || !urlMatch) continue;

    results.push({
      id: idMatch[1],
      operationType: opMatch?.[1] ?? "",
      price: priceMatch?.[1]?.trim() ?? "",
      area: areaMatch?.[1]?.trim() ?? "",
      rooms: roomsMatch?.[1]?.trim() ?? "",
      neighborhood: neighborhoodMatch?.[2]?.trim() ?? "",
      url: urlMatch[1],
    });
  }

  return results;
}

interface PropertyCardProps {
  property: ParsedProperty;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <a
      href={property.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-2 p-2.5 rounded-xl border border-gray-200 bg-white hover:border-accent/50 hover:shadow-gold transition-all duration-150 text-left no-underline"
    >
      <div className="flex-1 min-w-0">
        {property.operationType && (
          <div className="mb-1">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                property.operationType === "Наем"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {property.operationType}
            </span>
          </div>
        )}

        {property.price && (
          <p className="text-sm font-semibold text-primary leading-tight">
            {property.price}
          </p>
        )}

        <div className="flex gap-2 mt-0.5">
          {property.area && (
            <span className="text-xs text-gray-500">{property.area}</span>
          )}
          {property.rooms && (
            <span className="text-xs text-gray-500">{property.rooms}</span>
          )}
          {property.neighborhood && (
            <span className="text-xs text-gray-400">{property.neighborhood}</span>
          )}
        </div>
      </div>

      <ExternalLink className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
