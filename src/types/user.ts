import { PropertyType } from "@/types/property";

/**
 * User roles within the Nova Nest admin panel.
 */
export enum UserRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  VIEWER = "VIEWER",
}

/**
 * Bulgarian address structure used for local contact details.
 */
export interface BulgarianAddress {
  city: string;
  postal_code: string;
}

/**
 * Profile details for users in the admin panel.
 */
export interface UserProfile {
  avatar_url: string | null;
  bio: string | null;
  office_location: string | null;
  languages: string[];
  specializations: PropertyType[];
  /** Bulgarian phone in format like "+359 XX XXX XXXX" */
  phone_bg: string | null;
  /** Bulgarian address with city and postal code */
  address_bg: BulgarianAddress | null;
}

/**
 * Core user entity stored in the database.
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

/**
 * Session object for authenticated admin users.
 */
export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

/**
 * Fine-grained permissions used by the admin UI.
 */
export interface UserPermissions {
  can_create_properties: boolean;
  can_edit_properties: boolean;
  can_delete_properties: boolean;
  can_manage_users: boolean;
  can_view_inquiries: boolean;
}

export type { User as NovaNestUser };


