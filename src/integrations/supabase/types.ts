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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      lgas: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          email_on_assignment: boolean
          email_on_resolution: boolean
          email_on_status_change: boolean
          id: string
          push_enabled: boolean
          push_on_assignment: boolean
          push_on_resolution: boolean
          push_on_status_change: boolean
          sms_enabled: boolean
          sms_on_resolution: boolean
          sms_on_status_change: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          email_on_assignment?: boolean
          email_on_resolution?: boolean
          email_on_status_change?: boolean
          id?: string
          push_enabled?: boolean
          push_on_assignment?: boolean
          push_on_resolution?: boolean
          push_on_status_change?: boolean
          sms_enabled?: boolean
          sms_on_resolution?: boolean
          sms_on_status_change?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          email_on_assignment?: boolean
          email_on_resolution?: boolean
          email_on_status_change?: boolean
          id?: string
          push_enabled?: boolean
          push_on_assignment?: boolean
          push_on_resolution?: boolean
          push_on_status_change?: boolean
          sms_enabled?: boolean
          sms_on_resolution?: boolean
          sms_on_status_change?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          lga_id: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          lga_id?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          lga_id?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_lga_id_fkey"
            columns: ["lga_id"]
            isOneToOne: false
            referencedRelation: "lgas"
            referencedColumns: ["id"]
          },
        ]
      }
      report_updates: {
        Row: {
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["report_status"]
          notes: string | null
          previous_status: Database["public"]["Enums"]["report_status"] | null
          report_id: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["report_status"]
          notes?: string | null
          previous_status?: Database["public"]["Enums"]["report_status"] | null
          report_id: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["report_status"]
          notes?: string | null
          previous_status?: Database["public"]["Enums"]["report_status"] | null
          report_id?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_updates_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          address: string | null
          assigned_at: string | null
          assigned_officer_id: string | null
          category: Database["public"]["Enums"]["report_category"]
          created_at: string
          description: string
          id: string
          is_anonymous: boolean
          latitude: number | null
          lga_id: string | null
          longitude: number | null
          media_urls: string[] | null
          priority: Database["public"]["Enums"]["report_priority"] | null
          reporter_id: string | null
          resolution_media_urls: string[] | null
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"]
          title: string
          tracking_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_at?: string | null
          assigned_officer_id?: string | null
          category: Database["public"]["Enums"]["report_category"]
          created_at?: string
          description: string
          id?: string
          is_anonymous?: boolean
          latitude?: number | null
          lga_id?: string | null
          longitude?: number | null
          media_urls?: string[] | null
          priority?: Database["public"]["Enums"]["report_priority"] | null
          reporter_id?: string | null
          resolution_media_urls?: string[] | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          tracking_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_at?: string | null
          assigned_officer_id?: string | null
          category?: Database["public"]["Enums"]["report_category"]
          created_at?: string
          description?: string
          id?: string
          is_anonymous?: boolean
          latitude?: number | null
          lga_id?: string | null
          longitude?: number | null
          media_urls?: string[] | null
          priority?: Database["public"]["Enums"]["report_priority"] | null
          reporter_id?: string | null
          resolution_media_urls?: string[] | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          tracking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_lga_id_fkey"
            columns: ["lga_id"]
            isOneToOne: false
            referencedRelation: "lgas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_lga_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_lga_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_lga_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_lga_id_fkey"
            columns: ["assigned_lga_id"]
            isOneToOne: false
            referencedRelation: "lgas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_tracking_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_field_officer: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "citizen" | "field_officer" | "admin" | "super_admin"
      report_category:
        | "illegal_dumping"
        | "blocked_drainage"
        | "open_defecation"
        | "noise_pollution"
        | "sanitation_issues"
        | "environmental_nuisance"
      report_priority: "low" | "medium" | "high" | "emergency"
      report_status:
        | "submitted"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "closed"
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
      app_role: ["citizen", "field_officer", "admin", "super_admin"],
      report_category: [
        "illegal_dumping",
        "blocked_drainage",
        "open_defecation",
        "noise_pollution",
        "sanitation_issues",
        "environmental_nuisance",
      ],
      report_priority: ["low", "medium", "high", "emergency"],
      report_status: [
        "submitted",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
      ],
    },
  },
} as const
