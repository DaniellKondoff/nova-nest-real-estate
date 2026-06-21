import type { Tables } from "@/types/database.generated";

export type CrmContactStatus = "active" | "inactive" | "closed";
export type CrmClientType = "buyer" | "seller" | "renter" | "landlord";
export type CrmActivityType = "note" | "call" | "meeting";

/** Mirrors the crm_contacts database table. */
export interface CrmContact {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  phone: string;
  email: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string;
  status: CrmContactStatus;
  /** TEXT[] column — values are CrmClientType literals but typed as string[] to match Supabase return. */
  client_types: string[];
  general_notes: string | null;
}

/** Mirrors the crm_activities database table. */
export interface CrmActivity {
  id: string;
  created_at: string;
  contact_id: string;
  type: CrmActivityType;
  content: string;
  outcome: string | null;
  occurred_at: string;
}

/** CrmContact enriched with joined neighborhoods, properties, and activities. */
export interface CrmContactWithRelations extends CrmContact {
  neighborhoods: Tables<"neighborhoods">[];
  properties: Tables<"properties">[];
  activities: CrmActivity[];
}

export type CreateCrmContactInput = Omit<
  CrmContact,
  "id" | "created_at" | "updated_at"
>;
export type UpdateCrmContactInput = Partial<CreateCrmContactInput>;

/** contact_id is kept — caller always provides it. */
export type CreateCrmActivityInput = Omit<CrmActivity, "id" | "created_at">;

export interface CrmContactFilters {
  status?: CrmContactStatus;
  client_type?: CrmClientType;
  search?: string;
}

export const CRM_STATUS_LABELS: Record<CrmContactStatus, string> = {
  active: "Активен",
  inactive: "Неактивен",
  closed: "Затворен",
} as const;

export const CRM_CLIENT_TYPE_LABELS: Record<CrmClientType, string> = {
  buyer: "Купувач",
  seller: "Продавач",
  renter: "Наемател",
  landlord: "Наемодател",
} as const;

export const CRM_ACTIVITY_TYPE_LABELS: Record<CrmActivityType, string> = {
  note: "Бележка",
  call: "Обаждане",
  meeting: "Среща",
} as const;
