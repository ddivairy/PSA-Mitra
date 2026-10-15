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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_name: string
          actor_role: string
          details: string
          entity_id: string
          entity_type: string
          id: string
          timestamp: string
        }
        Insert: {
          action: string
          actor_name: string
          actor_role: string
          details: string
          entity_id: string
          entity_type: string
          id: string
          timestamp?: string
        }
        Update: {
          action?: string
          actor_name?: string
          actor_role?: string
          details?: string
          entity_id?: string
          entity_type?: string
          id?: string
          timestamp?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          link_type: string | null
          message: string
          read: boolean | null
          recipient_user_id: string
          timestamp: string
          title: string
        }
        Insert: {
          id: string
          link_type?: string | null
          message: string
          read?: boolean | null
          recipient_user_id: string
          timestamp?: string
          title: string
        }
        Update: {
          id?: string
          link_type?: string | null
          message?: string
          read?: boolean | null
          recipient_user_id?: string
          timestamp?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_documents: {
        Row: {
          id: string
          name: string
          organization_id: string
          size: string
          type: string
          uploaded_at: string
          verification_status: string | null
        }
        Insert: {
          id: string
          name: string
          organization_id: string
          size: string
          type: string
          uploaded_at?: string
          verification_status?: string | null
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string
          size?: string
          type?: string
          uploaded_at?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_organizations: {
        Row: {
          address: string | null
          city: string
          collaboration_focus: string[] | null
          collaboration_objective: string | null
          collaboration_period: string | null
          collaboration_reason: string | null
          created_at: string
          description: string | null
          history: Json | null
          id: string
          name: string
          offered_contribution: string | null
          pic_email: string
          pic_name: string
          pic_phone: string
          pic_role: string
          province: string
          review_notes: string | null
          sector: string
          status: string
          target_impact: string | null
          type: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city: string
          collaboration_focus?: string[] | null
          collaboration_objective?: string | null
          collaboration_period?: string | null
          collaboration_reason?: string | null
          created_at?: string
          description?: string | null
          history?: Json | null
          id: string
          name: string
          offered_contribution?: string | null
          pic_email: string
          pic_name: string
          pic_phone: string
          pic_role: string
          province: string
          review_notes?: string | null
          sector: string
          status?: string
          target_impact?: string | null
          type: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          collaboration_focus?: string[] | null
          collaboration_objective?: string | null
          collaboration_period?: string | null
          collaboration_reason?: string | null
          created_at?: string
          description?: string | null
          history?: Json | null
          id?: string
          name?: string
          offered_contribution?: string | null
          pic_email?: string
          pic_name?: string
          pic_phone?: string
          pic_role?: string
          province?: string
          review_notes?: string | null
          sector?: string
          status?: string
          target_impact?: string | null
          type?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          accessibility_info: string | null
          address: string | null
          category: string
          city: string | null
          created_at: string
          deadline: string
          description: string
          end_date: string
          enrolled_count: number
          format: string
          id: string
          image: string
          objectives: string[] | null
          partner_id: string
          partner_name: string
          pic_contact: string
          pic_name: string
          proposal_status: string
          province: string | null
          published_status: string
          requirements: string[] | null
          review_notes: string | null
          schedule: string
          start_date: string
          summary: string
          target_quota: number
          title: string
        }
        Insert: {
          accessibility_info?: string | null
          address?: string | null
          category: string
          city?: string | null
          created_at?: string
          deadline: string
          description: string
          end_date: string
          enrolled_count?: number
          format: string
          id: string
          image: string
          objectives?: string[] | null
          partner_id: string
          partner_name: string
          pic_contact: string
          pic_name: string
          proposal_status?: string
          province?: string | null
          published_status?: string
          requirements?: string[] | null
          review_notes?: string | null
          schedule: string
          start_date: string
          summary: string
          target_quota?: number
          title: string
        }
        Update: {
          accessibility_info?: string | null
          address?: string | null
          category?: string
          city?: string | null
          created_at?: string
          deadline?: string
          description?: string
          end_date?: string
          enrolled_count?: number
          format?: string
          id?: string
          image?: string
          objectives?: string[] | null
          partner_id?: string
          partner_name?: string
          pic_contact?: string
          pic_name?: string
          proposal_status?: string
          province?: string | null
          published_status?: string
          requirements?: string[] | null
          review_notes?: string | null
          schedule?: string
          start_date?: string
          summary?: string
          target_quota?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          name: string
          org_id: string | null
          phone: string | null
          role: string
          verified: boolean | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          org_id?: string | null
          phone?: string | null
          role: string
          verified?: boolean | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          org_id?: string | null
          phone?: string | null
          role?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_applications: {
        Row: {
          answers: Json | null
          history: Json | null
          id: string
          motivation: string
          partner_name: string
          program_id: string
          program_title: string
          review_notes: string | null
          status: string
          submitted_at: string
          volunteer_city: string
          volunteer_email: string
          volunteer_gender: string | null
          volunteer_id: string
          volunteer_name: string
          volunteer_phone: string
          volunteer_province: string | null
        }
        Insert: {
          answers?: Json | null
          history?: Json | null
          id: string
          motivation: string
          partner_name: string
          program_id: string
          program_title: string
          review_notes?: string | null
          status?: string
          submitted_at?: string
          volunteer_city: string
          volunteer_email: string
          volunteer_gender?: string | null
          volunteer_id: string
          volunteer_name: string
          volunteer_phone: string
          volunteer_province?: string | null
        }
        Update: {
          answers?: Json | null
          history?: Json | null
          id?: string
          motivation?: string
          partner_name?: string
          program_id?: string
          program_title?: string
          review_notes?: string | null
          status?: string
          submitted_at?: string
          volunteer_city?: string
          volunteer_email?: string
          volunteer_gender?: string | null
          volunteer_id?: string
          volunteer_name?: string
          volunteer_phone?: string
          volunteer_province?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_applications_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_profiles: {
        Row: {
          availability: string | null
          bio: string | null
          birth_date: string | null
          city: string
          created_at: string
          education: string | null
          experience: string | null
          full_name: string
          gender: string | null
          id: string
          interests: string[] | null
          province: string
          skills: string[] | null
          user_id: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          birth_date?: string | null
          city: string
          created_at?: string
          education?: string | null
          experience?: string | null
          full_name: string
          gender?: string | null
          id: string
          interests?: string[] | null
          province: string
          skills?: string[] | null
          user_id: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string
          created_at?: string
          education?: string | null
          experience?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          interests?: string[] | null
          province?: string
          skills?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
