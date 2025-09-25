import type { Enums, Tables } from "@/types/database.generated";
import type { User as AppUser } from "@/types/user";

export enum AdminRole {
  admin = "admin",
  agent = "agent",
  manager = "manager",
}

export type InquiryStatus = Enums<"inquiry_status">;
export type InquiryType = Enums<"inquiry_type">;

export interface AdminProfile extends AppUser {
  profile: Tables<"admin_profiles"> | null;
  role: AdminRole | "viewer";
}

export interface InquiryWithRelations extends Tables<"inquiries"> {
  property: Tables<"properties"> | null;
  assigned_agent: Tables<"admin_profiles"> | null;
}


