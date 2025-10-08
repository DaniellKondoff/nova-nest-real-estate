export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          phone?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          email: string
          full_name: string
          id: number
          inquiry_type: Database["public"]["Enums"]["inquiry_type"]
          message: string
          phone: string | null
          preferred_neighborhoods: string[] | null
          preferred_property_types: string[] | null
          property_id: number | null
          responded_at: string | null
          source: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          subject: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email: string
          full_name: string
          id?: number
          inquiry_type: Database["public"]["Enums"]["inquiry_type"]
          message: string
          phone?: string | null
          preferred_neighborhoods?: string[] | null
          preferred_property_types?: string[] | null
          property_id?: number | null
          responded_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string
          full_name?: string
          id?: number
          inquiry_type?: Database["public"]["Enums"]["inquiry_type"]
          message?: string
          phone?: string | null
          preferred_neighborhoods?: string[] | null
          preferred_property_types?: string[] | null
          property_id?: number | null
          responded_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhoods: {
        Row: {
          amenities: Json | null
          center_lat: number | null
          center_lng: number | null
          description: string | null
          id: number
          name_bg: string
          name_en: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          transport_info: Json | null
        }
        Insert: {
          amenities?: Json | null
          center_lat?: number | null
          center_lng?: number | null
          description?: string | null
          id?: number
          name_bg: string
          name_en?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          transport_info?: Json | null
        }
        Update: {
          amenities?: Json | null
          center_lat?: number | null
          center_lng?: number | null
          description?: string | null
          id?: number
          name_bg?: string
          name_en?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          transport_info?: Json | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address_bg: string | null
          amenities: Json | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          category_id: number
          created_at: string
          created_by: string
          description_bg: string | null
          description_en: string | null
          features: Json | null
          floor: number | null
          id: number
          is_featured: boolean
          is_new: boolean
          last_viewed_at: string | null
          latitude: number | null
          longitude: number | null
          neighborhood_id: number
          og_image: string | null
          operation_type: Database["public"]["Enums"]["property_operation_type"]
          price_bgn: number | null
          price_eur: number | null
          rooms: number | null
          search_vector: unknown | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string | null
          status: Database["public"]["Enums"]["property_status"]
          title_bg: string
          title_en: string | null
          total_floors: number | null
          updated_at: string | null
          view_count: number | null
          year_built: number | null
        }
        Insert: {
          address_bg?: string | null
          amenities?: Json | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id: number
          created_at?: string
          created_by: string
          description_bg?: string | null
          description_en?: string | null
          features?: Json | null
          floor?: number | null
          id?: number
          is_featured?: boolean
          is_new?: boolean
          last_viewed_at?: string | null
          latitude?: number | null
          longitude?: number | null
          neighborhood_id: number
          og_image?: string | null
          operation_type: Database["public"]["Enums"]["property_operation_type"]
          price_bgn?: number | null
          price_eur?: number | null
          rooms?: number | null
          search_vector?: unknown | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          title_bg: string
          title_en?: string | null
          total_floors?: number | null
          updated_at?: string | null
          view_count?: number | null
          year_built?: number | null
        }
        Update: {
          address_bg?: string | null
          amenities?: Json | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id?: number
          created_at?: string
          created_by?: string
          description_bg?: string | null
          description_en?: string | null
          features?: Json | null
          floor?: number | null
          id?: number
          is_featured?: boolean
          is_new?: boolean
          last_viewed_at?: string | null
          latitude?: number | null
          longitude?: number | null
          neighborhood_id?: number
          og_image?: string | null
          operation_type?: Database["public"]["Enums"]["property_operation_type"]
          price_bgn?: number | null
          price_eur?: number | null
          rooms?: number | null
          search_vector?: unknown | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          title_bg?: string
          title_en?: string | null
          total_floors?: number | null
          updated_at?: string | null
          view_count?: number | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "property_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      property_categories: {
        Row: {
          created_at: string
          description_bg: string | null
          icon: string | null
          id: number
          is_active: boolean
          name_bg: string
          name_en: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description_bg?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean
          name_bg: string
          name_en?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description_bg?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean
          name_bg?: string
          name_en?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      property_features: {
        Row: {
          category: Database["public"]["Enums"]["property_feature_category"]
          created_at: string
          icon: string | null
          id: number
          is_active: boolean
          name_bg: string
          name_en: string | null
          sort_order: number
        }
        Insert: {
          category: Database["public"]["Enums"]["property_feature_category"]
          created_at?: string
          icon?: string | null
          id?: number
          is_active?: boolean
          name_bg: string
          name_en?: string | null
          sort_order?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["property_feature_category"]
          created_at?: string
          icon?: string | null
          id?: number
          is_active?: boolean
          name_bg?: string
          name_en?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      property_images: {
        Row: {
          alt_text_bg: string | null
          alt_text_en: string | null
          created_at: string
          file_size: number | null
          filename: string | null
          height: number | null
          id: number
          is_primary: boolean
          property_id: number
          sort_order: number
          url: string
          width: number | null
        }
        Insert: {
          alt_text_bg?: string | null
          alt_text_en?: string | null
          created_at?: string
          file_size?: number | null
          filename?: string | null
          height?: number | null
          id?: number
          is_primary?: boolean
          property_id: number
          sort_order?: number
          url: string
          width?: number | null
        }
        Update: {
          alt_text_bg?: string | null
          alt_text_en?: string | null
          created_at?: string
          file_size?: number | null
          filename?: string | null
          height?: number | null
          id?: number
          is_primary?: boolean
          property_id?: number
          sort_order?: number
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_property_features: {
        Row: {
          feature_id: number
          property_id: number
        }
        Insert: {
          feature_id: number
          property_id: number
        }
        Update: {
          feature_id?: number
          property_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "property_property_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "property_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_property_features_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          category_id: number | null
          content_bg: string | null
          content_en: string | null
          created_at: string
          h1_bg: string
          h1_en: string | null
          id: number
          is_published: boolean
          last_viewed_at: string | null
          meta_description: string
          meta_keywords: string[] | null
          meta_title: string
          neighborhood_id: number | null
          page_type: Database["public"]["Enums"]["seo_page_type"]
          slug: string
          title_bg: string
          title_en: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          canonical_url?: string | null
          category_id?: number | null
          content_bg?: string | null
          content_en?: string | null
          created_at?: string
          h1_bg: string
          h1_en?: string | null
          id?: number
          is_published?: boolean
          last_viewed_at?: string | null
          meta_description: string
          meta_keywords?: string[] | null
          meta_title: string
          neighborhood_id?: number | null
          page_type: Database["public"]["Enums"]["seo_page_type"]
          slug: string
          title_bg: string
          title_en?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          canonical_url?: string | null
          category_id?: number | null
          content_bg?: string | null
          content_en?: string | null
          created_at?: string
          h1_bg?: string
          h1_en?: string | null
          id?: number
          is_published?: boolean
          last_viewed_at?: string | null
          meta_description?: string
          meta_keywords?: string[] | null
          meta_title?: string
          neighborhood_id?: number | null
          page_type?: Database["public"]["Enums"]["seo_page_type"]
          slug?: string
          title_bg?: string
          title_en?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "seo_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "property_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_pages_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          client_initial: string | null
          client_name: string
          client_role: string | null
          content_bg: string
          content_en: string | null
          created_at: string
          id: number
          is_featured: boolean
          is_published: boolean
          property_id: number | null
          rating: number | null
          review_date: string
          service_type: string | null
          updated_at: string
        }
        Insert: {
          client_initial?: string | null
          client_name: string
          client_role?: string | null
          content_bg: string
          content_en?: string | null
          created_at?: string
          id?: number
          is_featured?: boolean
          is_published?: boolean
          property_id?: number | null
          rating?: number | null
          review_date?: string
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          client_initial?: string | null
          client_name?: string
          client_role?: string | null
          content_bg?: string
          content_en?: string | null
          created_at?: string
          id?: number
          is_featured?: boolean
          is_published?: boolean
          property_id?: number | null
          rating?: number | null
          review_date?: string
          service_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      inquiry_status: "new" | "in_progress" | "responded" | "closed"
      inquiry_type:
        | "general"
        | "property_interest"
        | "viewing_request"
        | "valuation"
        | "selling"
        | "renting"
      property_feature_category:
        | "interior"
        | "exterior"
        | "building"
        | "location"
        | "buildingType"
      property_operation_type: "sale" | "rent"
      property_status:
        | "available"
        | "under_offer"
        | "sold"
        | "rented"
        | "archived"
      seo_page_type: "neighborhood" | "category" | "service" | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
