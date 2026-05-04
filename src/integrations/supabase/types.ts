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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          background_color: string | null
          button_color: string | null
          city: string
          commission_rate: number | null
          contact_email: string
          country: string
          created_at: string | null
          domain: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          og_image: string | null
          one_way_fee: number | null
          page_seo: Json | null
          revenue: number | null
          services: string[]
          slug: string
          status: string
          storefront_config: Json | null
          storefront_template: string | null
          total_bookings: number | null
        }
        Insert: {
          background_color?: string | null
          button_color?: string | null
          city: string
          commission_rate?: number | null
          contact_email: string
          country: string
          created_at?: string | null
          domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          og_image?: string | null
          one_way_fee?: number | null
          page_seo?: Json | null
          revenue?: number | null
          services?: string[]
          slug: string
          status?: string
          storefront_config?: Json | null
          storefront_template?: string | null
          total_bookings?: number | null
        }
        Update: {
          background_color?: string | null
          button_color?: string | null
          city?: string
          commission_rate?: number | null
          contact_email?: string
          country?: string
          created_at?: string | null
          domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          og_image?: string | null
          one_way_fee?: number | null
          page_seo?: Json | null
          revenue?: number | null
          services?: string[]
          slug?: string
          status?: string
          storefront_config?: Json | null
          storefront_template?: string | null
          total_bookings?: number | null
        }
        Relationships: []
      }
      agency_members: {
        Row: {
          agency_id: string
          created_at: string | null
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agency_id: string
          amount: number | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          driver_id: string | null
          id: string
          notes: string | null
          pickup_date: string
          pickup_location: string | null
          return_date: string
          return_location: string | null
          service_type: string | null
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          agency_id: string
          amount?: number | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          pickup_date: string
          pickup_location?: string | null
          return_date: string
          return_location?: string | null
          service_type?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          agency_id?: string
          amount?: number | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          pickup_date?: string
          pickup_location?: string | null
          return_date?: string
          return_location?: string | null
          service_type?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      car_rental_pricing: {
        Row: {
          agency_id: string
          brand: string | null
          created_at: string | null
          daily_rate: number
          description: string | null
          drop_off_fee: number
          fuel_type: string | null
          id: string
          image_url: string | null
          model: string | null
          monthly_rate: number | null
          seats: number | null
          transmission: string | null
          vehicle_class: string
          weekly_rate: number | null
          year: number | null
        }
        Insert: {
          agency_id: string
          brand?: string | null
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          drop_off_fee?: number
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          monthly_rate?: number | null
          seats?: number | null
          transmission?: string | null
          vehicle_class: string
          weekly_rate?: number | null
          year?: number | null
        }
        Update: {
          agency_id?: string
          brand?: string | null
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          drop_off_fee?: number
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          monthly_rate?: number | null
          seats?: number | null
          transmission?: string | null
          vehicle_class?: string
          weekly_rate?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "car_rental_pricing_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      city_pricing: {
        Row: {
          agency_id: string
          city_name: string
          country: string
          created_at: string | null
          distance_tiers: Json | null
          drop_off_fee: number | null
          id: string
          transfer_base_fee: number
          transfer_per_km_rate: number
        }
        Insert: {
          agency_id: string
          city_name: string
          country?: string
          created_at?: string | null
          distance_tiers?: Json | null
          drop_off_fee?: number | null
          id?: string
          transfer_base_fee?: number
          transfer_per_km_rate?: number
        }
        Update: {
          agency_id?: string
          city_name?: string
          country?: string
          created_at?: string | null
          distance_tiers?: Json | null
          drop_off_fee?: number | null
          id?: string
          transfer_base_fee?: number
          transfer_per_km_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "city_pricing_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      city_tour_pricing: {
        Row: {
          agency_id: string
          city: string | null
          country: string | null
          created_at: string | null
          daily_rate: number
          description: string | null
          duration_hours: number | null
          half_day_hours: number | null
          half_day_rate: number | null
          id: string
          tour_name: string
        }
        Insert: {
          agency_id: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          duration_hours?: number | null
          half_day_hours?: number | null
          half_day_rate?: number | null
          id?: string
          tour_name: string
        }
        Update: {
          agency_id?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          duration_hours?: number | null
          half_day_hours?: number | null
          half_day_rate?: number | null
          id?: string
          tour_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_tour_pricing_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          agency_id: string
          auth_user_id: string | null
          base_location: string | null
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          status: string
        }
        Insert: {
          agency_id: string
          auth_user_id?: string | null
          base_location?: string | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          status?: string
        }
        Update: {
          agency_id?: string
          auth_user_id?: string | null
          base_location?: string | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      limo_tour_pricing: {
        Row: {
          agency_id: string
          city: string
          created_at: string | null
          daily_rate: number
          description: string | null
          id: string
          min_days: number | null
        }
        Insert: {
          agency_id: string
          city: string
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          id?: string
          min_days?: number | null
        }
        Update: {
          agency_id?: string
          city?: string
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          id?: string
          min_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "limo_tour_pricing_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      transfer_routes: {
        Row: {
          agency_id: string
          created_at: string | null
          destination: string
          distance_km: number | null
          id: string
          notes: string | null
          origin: string
          price_business: number | null
          price_economy: number | null
          price_first_class: number | null
          price_van: number | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          destination: string
          distance_km?: number | null
          id?: string
          notes?: string | null
          origin: string
          price_business?: number | null
          price_economy?: number | null
          price_first_class?: number | null
          price_van?: number | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          destination?: string
          distance_km?: number | null
          id?: string
          notes?: string | null
          origin?: string
          price_business?: number | null
          price_economy?: number | null
          price_first_class?: number | null
          price_van?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_routes_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_blocked_dates: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_blocked_dates_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_pricing: {
        Row: {
          created_at: string | null
          daily_rate: number
          end_date: string
          id: string
          monthly_rate: number | null
          season_name: string
          start_date: string
          vehicle_id: string
          weekly_rate: number | null
        }
        Insert: {
          created_at?: string | null
          daily_rate: number
          end_date: string
          id?: string
          monthly_rate?: number | null
          season_name: string
          start_date: string
          vehicle_id: string
          weekly_rate?: number | null
        }
        Update: {
          created_at?: string | null
          daily_rate?: number
          end_date?: string
          id?: string
          monthly_rate?: number | null
          season_name?: string
          start_date?: string
          vehicle_id?: string
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_pricing_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          agency_id: string
          air_conditioning: boolean | null
          brand: string
          category: string | null
          created_at: string | null
          daily_rate_base: number | null
          free_km_per_day: number | null
          fuel_type: string | null
          id: string
          license_plate: string | null
          mileage_policy: string | null
          model: string
          photo_url: string | null
          price_per_km: number | null
          seats: number | null
          status: string
          transmission: string | null
          vin: string | null
          year: number
        }
        Insert: {
          agency_id: string
          air_conditioning?: boolean | null
          brand: string
          category?: string | null
          created_at?: string | null
          daily_rate_base?: number | null
          free_km_per_day?: number | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          mileage_policy?: string | null
          model: string
          photo_url?: string | null
          price_per_km?: number | null
          seats?: number | null
          status?: string
          transmission?: string | null
          vin?: string | null
          year: number
        }
        Update: {
          agency_id?: string
          air_conditioning?: boolean | null
          brand?: string
          category?: string | null
          created_at?: string | null
          daily_rate_base?: number | null
          free_km_per_day?: number | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          mileage_policy?: string | null
          model?: string
          photo_url?: string | null
          price_per_km?: number | null
          seats?: number | null
          status?: string
          transmission?: string | null
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_user_email: { Args: { target_user_id: string }; Returns: boolean }
      create_user_admin: {
        Args: { p_email: string; p_full_name: string; p_password: string }
        Returns: string
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      get_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      login_driver_by_email: { Args: { driver_email: string }; Returns: Json }
    }
    Enums: {
      app_role: "super_admin" | "agency_admin"
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
      app_role: ["super_admin", "agency_admin"],
    },
  },
} as const
