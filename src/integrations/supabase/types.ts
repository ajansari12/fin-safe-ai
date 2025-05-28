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
      business_functions: {
        Row: {
          category: string | null
          created_at: string | null
          criticality: string
          description: string | null
          id: string
          name: string
          org_id: string | null
          owner: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criticality: string
          description?: string | null
          id?: string
          name: string
          org_id?: string | null
          owner?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criticality?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string | null
          owner?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      governance_change_logs: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string
          description: string | null
          framework_id: string | null
          id: string
          new_version: number | null
          policy_id: string | null
          previous_version: number | null
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string
          description?: string | null
          framework_id?: string | null
          id?: string
          new_version?: number | null
          policy_id?: string | null
          previous_version?: number | null
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string
          description?: string | null
          framework_id?: string | null
          id?: string
          new_version?: number | null
          policy_id?: string | null
          previous_version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_change_logs_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "governance_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_change_logs_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "governance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_frameworks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          org_id: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      governance_policies: {
        Row: {
          created_at: string
          description: string | null
          file_path: string | null
          file_type: string | null
          framework_id: string | null
          id: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_type?: string | null
          framework_id?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_type?: string | null
          framework_id?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "governance_policies_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "governance_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_policy_approvals: {
        Row: {
          approval_date: string
          approver_id: string
          approver_name: string
          created_at: string
          id: string
          policy_id: string | null
          signature: string | null
          updated_at: string
        }
        Insert: {
          approval_date: string
          approver_id: string
          approver_name: string
          created_at?: string
          id?: string
          policy_id?: string | null
          signature?: string | null
          updated_at?: string
        }
        Update: {
          approval_date?: string
          approver_id?: string
          approver_name?: string
          created_at?: string
          id?: string
          policy_id?: string | null
          signature?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_policy_approvals_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "governance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_policy_reviews: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          policy_id: string | null
          reviewer_id: string
          reviewer_name: string
          status: string
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          policy_id?: string | null
          reviewer_id: string
          reviewer_name: string
          status: string
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          policy_id?: string | null
          reviewer_id?: string
          reviewer_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_policy_reviews_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "governance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_review_schedule: {
        Row: {
          created_at: string
          id: string
          last_review_date: string | null
          next_review_date: string
          policy_id: string | null
          reminder_sent: boolean | null
          review_frequency_months: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_review_date?: string | null
          next_review_date: string
          policy_id?: string | null
          reminder_sent?: boolean | null
          review_frequency_months: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_review_date?: string | null
          next_review_date?: string
          policy_id?: string | null
          reminder_sent?: boolean | null
          review_frequency_months?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_review_schedule_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "governance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_roles: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          framework_id: string | null
          id: string
          responsibilities: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          framework_id?: string | null
          id?: string
          responsibilities?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          framework_id?: string | null
          id?: string
          responsibilities?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_roles_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "governance_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_structure: {
        Row: {
          created_at: string
          description: string | null
          framework_id: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework_id?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          framework_id?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_structure_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "governance_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_tolerances: {
        Row: {
          compliance_impact: string | null
          created_at: string | null
          created_by: string | null
          financial_impact: string | null
          function_id: string
          id: string
          max_tolerable_downtime: string
          quantitative_threshold: string
          recovery_time_objective: string
          reputational_impact: string | null
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          compliance_impact?: string | null
          created_at?: string | null
          created_by?: string | null
          financial_impact?: string | null
          function_id: string
          id?: string
          max_tolerable_downtime: string
          quantitative_threshold: string
          recovery_time_objective: string
          reputational_impact?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          compliance_impact?: string | null
          created_at?: string | null
          created_by?: string | null
          financial_impact?: string | null
          function_id?: string
          id?: string
          max_tolerable_downtime?: string
          quantitative_threshold?: string
          recovery_time_objective?: string
          reputational_impact?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_tolerances_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_logs: {
        Row: {
          assigned_to: string | null
          business_function_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          impact_rating: number | null
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          business_function_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_rating?: number | null
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          business_function_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_rating?: number | null
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_logs_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      kri_definitions: {
        Row: {
          created_at: string
          critical_threshold: string | null
          description: string | null
          id: string
          measurement_frequency: string | null
          name: string
          target_value: string | null
          threshold_id: string
          updated_at: string
          warning_threshold: string | null
        }
        Insert: {
          created_at?: string
          critical_threshold?: string | null
          description?: string | null
          id?: string
          measurement_frequency?: string | null
          name: string
          target_value?: string | null
          threshold_id: string
          updated_at?: string
          warning_threshold?: string | null
        }
        Update: {
          created_at?: string
          critical_threshold?: string | null
          description?: string | null
          id?: string
          measurement_frequency?: string | null
          name?: string
          target_value?: string | null
          threshold_id?: string
          updated_at?: string
          warning_threshold?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kri_definitions_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "risk_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      kri_logs: {
        Row: {
          actual_value: number
          created_at: string | null
          id: string
          kri_id: string
          measurement_date: string
          notes: string | null
          threshold_breached: string | null
          updated_at: string | null
        }
        Insert: {
          actual_value: number
          created_at?: string | null
          id?: string
          kri_id: string
          measurement_date: string
          notes?: string | null
          threshold_breached?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_value?: number
          created_at?: string | null
          id?: string
          kri_id?: string
          measurement_date?: string
          notes?: string | null
          threshold_breached?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kri_logs_kri_id_fkey"
            columns: ["kri_id"]
            isOneToOne: false
            referencedRelation: "kri_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_appetite_statements: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          org_id: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      risk_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_thresholds: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          escalation_trigger: string | null
          id: string
          statement_id: string
          tolerance_level: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          escalation_trigger?: string | null
          id?: string
          statement_id: string
          tolerance_level: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          escalation_trigger?: string | null
          id?: string
          statement_id?: string
          tolerance_level?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_thresholds_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "risk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_thresholds_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "risk_appetite_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      third_party_reviews: {
        Row: {
          assigned_reviewer: string | null
          created_at: string | null
          id: string
          last_review_date: string | null
          next_review_date: string
          notes: string | null
          review_type: string
          risk_rating: string | null
          status: string
          updated_at: string | null
          vendor_name: string
        }
        Insert: {
          assigned_reviewer?: string | null
          created_at?: string | null
          id?: string
          last_review_date?: string | null
          next_review_date: string
          notes?: string | null
          review_type: string
          risk_rating?: string | null
          status?: string
          updated_at?: string | null
          vendor_name: string
        }
        Update: {
          assigned_reviewer?: string | null
          created_at?: string | null
          id?: string
          last_review_date?: string | null
          next_review_date?: string
          notes?: string | null
          review_type?: string
          risk_rating?: string | null
          status?: string
          updated_at?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_framework_access: {
        Args: { framework_id: string }
        Returns: boolean
      }
      check_user_framework_for_changelog: {
        Args: { framework_id: string }
        Returns: boolean
      }
      check_user_org_for_framework: {
        Args: { org_id: string }
        Returns: boolean
      }
      check_user_policy_access: {
        Args: { policy_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
