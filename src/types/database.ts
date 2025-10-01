import type { Property, PropertyImage as AppPropertyImage } from "@/types/property";
import type { User as AppUser } from "@/types/user";

/**
 * Supabase-generated Database interface (hand-authored here for strong typing in the app).
 * This should mirror your Supabase schema. Update as the DB evolves.
 */
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: PropertiesRow;
        Insert: InsertProperty;
        Update: UpdateProperty;
        Relationships: [
          {
            foreignKeyName: "properties_neighborhood_id_fkey";
            columns: ["neighborhood_id"];
            referencedRelation: "neighborhoods";
            referencedColumns: ["id"];
          }
        ];
      };
      property_images: {
        Row: PropertyImagesRow;
        Insert: InsertPropertyImage;
        Update: UpdatePropertyImage;
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: UsersRow;
        Insert: InsertUser;
        Update: UpdateUser;
        Relationships: [];
      };
      neighborhoods: {
        Row: NeighborhoodsRow;
        Insert: InsertNeighborhood;
        Update: UpdateNeighborhood;
        Relationships: [];
      };
      inquiries: {
        Row: InquiriesRow;
        Insert: InsertInquiry;
        Update: UpdateInquiry;
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      testimonials: {
        Row: TestimonialsRow;
        Insert: InsertTestimonial;
        Update: UpdateTestimonial;
        Relationships: [
          {
            foreignKeyName: "testimonials_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

/**
 * PROPERTIES
 * Row maps closely to app Property, but uses DB-friendly primitives.
 */
export interface PropertiesRow {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "BGN" | "EUR";
  type: Property["type"];
  status: Property["status"];
  condition: Property["condition"];
  heating: Property["heating"];
  features: Property["features"];
  bg_features: Property["bg_features"];
  location: Property["location"];
  neighborhood_id: string; // relational column to neighborhoods.id
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  is_active: boolean;
  view_count: number;
}

export type SelectProperty = PropertiesRow;

// Insert allows partials for server defaults; keep required minimal fields.
export interface InsertProperty {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: "BGN" | "EUR";
  type: Property["type"];
  status: Property["status"];
  condition: Property["condition"];
  heating: Property["heating"];
  features: Property["features"];
  bg_features: Property["bg_features"];
  location: Property["location"];
  neighborhood_id: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  view_count?: number;
}

export interface UpdateProperty {
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: "BGN" | "EUR";
  type?: Property["type"];
  status?: Property["status"];
  condition?: Property["condition"];
  heating?: Property["heating"];
  features?: Partial<Property["features"]> | Property["features"];
  bg_features?: Partial<Property["bg_features"]> | Property["bg_features"];
  location?: Partial<Property["location"]> | Property["location"];
  neighborhood_id?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  view_count?: number;
}

/**
 * PROPERTY IMAGES
 */
export interface PropertyImagesRow {
  id: string;
  property_id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

export interface InsertPropertyImage {
  id?: string;
  property_id: string;
  url: string;
  alt_text: string;
  is_primary?: boolean;
  order?: number;
  created_at?: string;
}

export interface UpdatePropertyImage {
  id?: string;
  property_id?: string;
  url?: string;
  alt_text?: string;
  is_primary?: boolean;
  order?: number;
  created_at?: string;
}

/**
 * USERS
 */
export interface UsersRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: "ADMIN" | "AGENT" | "VIEWER";
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface InsertUser {
  id?: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role?: "ADMIN" | "AGENT" | "VIEWER";
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface UpdateUser {
  id?: string;
  email?: string;
  full_name?: string;
  phone?: string | null;
  role?: "ADMIN" | "AGENT" | "VIEWER";
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

/**
 * NEIGHBORHOODS
 */
export interface NeighborhoodsRow {
  id: number;
  name_bg: string;
  name_en?: string;
  slug: string;
  description?: string;
  center_lat?: number;
  center_lng?: number;
  amenities?: any; // JSONB
  transport_info?: any; // JSONB
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface InsertNeighborhood {
  id?: number;
  name_bg: string;
  name_en?: string;
  slug: string;
  description?: string;
  center_lat?: number;
  center_lng?: number;
  amenities?: any;
  transport_info?: any;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface UpdateNeighborhood {
  id?: number;
  name_bg?: string;
  name_en?: string;
  slug?: string;
  description?: string;
  center_lat?: number;
  center_lng?: number;
  amenities?: any;
  transport_info?: any;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

/**
 * INQUIRIES
 */
export type InquiryType = "VIEWING" | "INFO" | "CALLBACK";
export type InquiryStatus = "NEW" | "CONTACTED" | "CLOSED";

export interface InquiriesRow {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiry_type: InquiryType;
  status: InquiryStatus;
  created_at: string;
}

export interface InsertInquiry {
  id?: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiry_type: InquiryType;
  status?: InquiryStatus;
  created_at?: string;
}

export interface UpdateInquiry {
  id?: string;
  property_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  inquiry_type?: InquiryType;
  status?: InquiryStatus;
  created_at?: string;
}

/**
 * TESTIMONIALS
 */
export interface TestimonialsRow {
  id: string;
  client_name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review_text: string;
  property_id: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface InsertTestimonial {
  id?: string;
  client_name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review_text: string;
  property_id?: string | null;
  is_featured?: boolean;
  created_at?: string;
}

export interface UpdateTestimonial {
  id?: string;
  client_name?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  review_text?: string;
  property_id?: string | null;
  is_featured?: boolean;
  created_at?: string;
}

/**
 * Relationship helper types for richer selects.
 */
export interface PropertyWithImages extends Omit<SelectProperty, "created_at" | "updated_at"> {
  images: AppPropertyImage[];
  created_at: string;
  updated_at: string;
}

export interface PropertyWithNeighborhood extends SelectProperty {
  neighborhood: NeighborhoodsRow | null;
}

export interface InquiryWithProperty extends InquiriesRow {
  property: SelectProperty | null;
}

// Re-export app-level types when useful in DB context
export type { Property };
export type { AppUser as User };


