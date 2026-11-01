import type { Enums, Tables } from "@/types/database.generated";
import type { User as AppUser } from "@/types/user";

export enum AdminRole {
  admin = "admin",
  agent = "agent",
  manager = "manager",
}

export type InquiryStatus = Enums<"inquiry_status">;
export type InquiryType = Enums<"inquiry_type">;

export interface AdminProfile extends Omit<AppUser, "role"> {
  profile: Tables<"admin_profiles"> | null;
  role: AdminRole | "viewer";
}

export interface InquiryWithRelations extends Tables<"inquiries"> {
  property: Tables<"properties"> | null;
  assigned_agent: Tables<"admin_profiles"> | null;
}

/** Row shape of GET /api/admin/inquiries (admin inquiries list + details modal) */
export interface AdminInquiry {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  inquiry_type: InquiryType;
  message: string;
  status: InquiryStatus;
  created_at: string;
  property: {
    id: number;
    title_bg: string;
    slug: string | null;
    price_eur: number | null;
  } | null;
}


