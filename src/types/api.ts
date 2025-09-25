import type { Tables } from "@/types/database.generated";
import type { PropertyWithDetails } from "@/types/property";
import type { SearchResults } from "@/types/search";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PropertyListResponse {
  items: PropertyWithDetails[];
  meta: PaginationMeta;
}

export interface SearchResponse {
  data: SearchResults;
  meta: { tookMs?: number };
}

export interface AdminDashboardStats {
  totalProperties: number;
  totalInquiries: number;
  newThisWeek: number;
  soldThisMonth: number;
  avgDaysOnMarket?: number;
}

export interface ErrorResponse {
  error: string;
  code?: string | number;
  details?: Record<string, unknown>;
}

export interface SuccessResponse<T = unknown> {
  data: T;
  message?: string;
}


