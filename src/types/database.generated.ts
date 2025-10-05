export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
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
          status: Database["public"]["Enums"]["property_status"]
          title_bg: string
          title_en: string | null
          total_floors: number | null
          updated_at: string | null
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
          status?: Database["public"]["Enums"]["property_status"]
          title_bg: string
          title_en?: string | null
          total_floors?: number | null
          updated_at?: string | null
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
          status?: Database["public"]["Enums"]["property_status"]
          title_bg?: string
          title_en?: string | null
          total_floors?: number | null
          updated_at?: string | null
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
      assign_inquiry_to_agent: {
        Args: { agent_id: string; inquiry_id: number }
        Returns: boolean
      }
      auto_approve_testimonial: {
        Args: { min_rating?: number; testimonial_id: number }
        Returns: boolean
      }
      get_current_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_featured_properties: {
        Args: { limit_count?: number; operation_type_filter?: string }
        Returns: {
          id: number
          neighborhood_name: string
          price_eur: number
          primary_image_url: string
          title_bg: string
        }[]
      }
      get_properties_within_radius: {
        Args: { center_lat: number; center_lng: number; radius_km?: number }
        Returns: {
          distance_km: number
          id: number
          price_eur: number
          title_bg: string
        }[]
      }
      get_property_stats: {
        Args: { p_property_id: number }
        Returns: {
          last_inquiry_date: string
          total_inquiries: number
          total_views: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_published_property: {
        Args: { p_property_id: number }
        Returns: boolean
      }
      search_properties_combined: {
        Args:
          | {
              category_id?: number
              language_code?: string
              max_area?: number
              max_price?: number
              min_area?: number
              min_price?: number
              neighborhood_id?: number
              operation_type?: string
              search_term?: string
            }
          | {
              filter_category_id?: number
              filter_neighborhood_id?: number
              language_code?: string
              max_area?: number
              max_price?: number
              min_area?: number
              min_price?: number
              operation_type?: string
              search_term?: string
            }
        Returns: {
          description_bg: string
          id: number
          price_eur: number
          rank: number
          title_bg: string
        }[]
      }
      search_properties_fulltext: {
        Args: { language_code?: string; search_term: string }
        Returns: {
          description_bg: string
          id: number
          price_eur: number
          rank: number
          title_bg: string
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      update_property_new_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_seo_page_views: {
        Args: { page_slug: string }
        Returns: undefined
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      inquiry_status: ["new", "in_progress", "responded", "closed"],
      inquiry_type: [
        "general",
        "property_interest",
        "viewing_request",
        "valuation",
        "selling",
        "renting",
      ],
      property_feature_category: [
        "interior",
        "exterior",
        "building",
        "location",
        "buildingType",
      ],
      property_operation_type: ["sale", "rent"],
      property_status: [
        "available",
        "under_offer",
        "sold",
        "rented",
        "archived",
      ],
      seo_page_type: ["neighborhood", "category", "service", "custom"],
    },
  },
} as const