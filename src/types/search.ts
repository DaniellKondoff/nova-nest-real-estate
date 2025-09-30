import type { Tables } from "@/types/database.generated";
import type { OperationType, PropertyWithDetails } from "@/types/property";

export interface SearchResultItem {
  id: number;
  title_bg: string;
  description_bg: string;
  price_eur: number | null;
  rank: number; // ts_rank from fulltext search
}

export interface SearchResults {
  results: SearchResultItem[];
  total: number;
  tookMs?: number;
}

export interface NeighborhoodWithProperties {
  neighborhood: Tables<"neighborhoods">;
  properties: PropertyWithDetails[];
}

export interface SEOPage {
  page: Tables<"seo_pages">;
}

export interface LocalSearchParams {
  city: "Stara Zagora" | string;
  neighborhoodSlug?: string;
  categorySlug?: string;
  operationType?: OperationType;
}

// Alias for UI use across BG neighborhood selections
export type StaraZagoraNeighborhood = Tables<"neighborhoods">;

export interface GeographicSearchParams {
  center_lat: number;
  center_lng: number;
  radius_km: number; // up to 50 for local searches
  operationType?: OperationType;
  category_id?: number;
}


