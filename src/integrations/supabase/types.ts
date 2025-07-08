export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_user_id: string
          admin_user_name: string
          created_at: string
          id: string
          ip_address: unknown | null
          org_id: string
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_user_id: string
          admin_user_name: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          org_id: string
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_user_id?: string
          admin_user_name?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          org_id?: string
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_chat_logs: {
        Row: {
          created_at: string
          feedback_comment: string | null
          feedback_rating: number | null
          id: string
          knowledge_sources_used: Json | null
          message_content: string
          message_type: string
          module_context: string | null
          org_id: string
          response_time_ms: number | null
          session_id: string
          updated_at: string
          user_context: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_comment?: string | null
          feedback_rating?: number | null
          id?: string
          knowledge_sources_used?: Json | null
          message_content: string
          message_type: string
          module_context?: string | null
          org_id: string
          response_time_ms?: number | null
          session_id?: string
          updated_at?: string
          user_context?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_comment?: string | null
          feedback_rating?: number | null
          id?: string
          knowledge_sources_used?: Json | null
          message_content?: string
          message_type?: string
          module_context?: string | null
          org_id?: string
          response_time_ms?: number | null
          session_id?: string
          updated_at?: string
          user_context?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          created_by: string | null
          forecast_period: string | null
          generated_at: string
          id: string
          insight_data: Json
          insight_type: string
          org_id: string
          tags: string[] | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          forecast_period?: string | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type: string
          org_id: string
          tags?: string[] | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          forecast_period?: string | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          org_id?: string
          tags?: string[] | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      anomaly_detections: {
        Row: {
          anomaly_type: string
          baseline_values: Json
          confidence_score: number
          created_at: string
          detected_at: string
          detected_values: Json
          detection_source: string
          deviation_metrics: Json
          id: string
          investigation_notes: string | null
          investigation_status: string
          org_id: string
          resolved_at: string | null
          severity_score: number
        }
        Insert: {
          anomaly_type: string
          baseline_values?: Json
          confidence_score: number
          created_at?: string
          detected_at?: string
          detected_values?: Json
          detection_source: string
          deviation_metrics?: Json
          id?: string
          investigation_notes?: string | null
          investigation_status?: string
          org_id: string
          resolved_at?: string | null
          severity_score: number
        }
        Update: {
          anomaly_type?: string
          baseline_values?: Json
          confidence_score?: number
          created_at?: string
          detected_at?: string
          detected_values?: Json
          detection_source?: string
          deviation_metrics?: Json
          id?: string
          investigation_notes?: string | null
          investigation_status?: string
          org_id?: string
          resolved_at?: string | null
          severity_score?: number
        }
        Relationships: []
      }
      api_integrations: {
        Row: {
          api_endpoint: string
          authentication_config: Json
          authentication_method: string
          created_at: string
          created_by: string | null
          data_mapping: Json | null
          data_quality_score: number | null
          error_details: Json | null
          id: string
          integration_name: string
          integration_type: string
          last_sync_at: string | null
          org_id: string
          provider_name: string
          rate_limits: Json | null
          sync_frequency_hours: number | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint: string
          authentication_config?: Json
          authentication_method: string
          created_at?: string
          created_by?: string | null
          data_mapping?: Json | null
          data_quality_score?: number | null
          error_details?: Json | null
          id?: string
          integration_name: string
          integration_type: string
          last_sync_at?: string | null
          org_id: string
          provider_name: string
          rate_limits?: Json | null
          sync_frequency_hours?: number | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string
          authentication_config?: Json
          authentication_method?: string
          created_at?: string
          created_by?: string | null
          data_mapping?: Json | null
          data_quality_score?: number | null
          error_details?: Json | null
          id?: string
          integration_name?: string
          integration_type?: string
          last_sync_at?: string | null
          org_id?: string
          provider_name?: string
          rate_limits?: Json | null
          sync_frequency_hours?: number | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          key_name: string
          key_type: string
          key_value: string
          last_used_at: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          key_type?: string
          key_value: string
          last_used_at?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          key_type?: string
          key_value?: string
          last_used_at?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appetite_board_reports: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          approved_by_name: string | null
          created_at: string
          executive_summary: string | null
          generated_by: string | null
          generated_by_name: string | null
          id: string
          key_findings: string | null
          org_id: string
          recommendations: string | null
          report_data: Json
          report_period_end: string
          report_period_start: string
          report_type: string
          risk_posture_score: number | null
          status: string
          trend_analysis: string | null
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          created_at?: string
          executive_summary?: string | null
          generated_by?: string | null
          generated_by_name?: string | null
          id?: string
          key_findings?: string | null
          org_id: string
          recommendations?: string | null
          report_data?: Json
          report_period_end: string
          report_period_start: string
          report_type?: string
          risk_posture_score?: number | null
          status?: string
          trend_analysis?: string | null
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          created_at?: string
          executive_summary?: string | null
          generated_by?: string | null
          generated_by_name?: string | null
          id?: string
          key_findings?: string | null
          org_id?: string
          recommendations?: string | null
          report_data?: Json
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          risk_posture_score?: number | null
          status?: string
          trend_analysis?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      appetite_breach_logs: {
        Row: {
          actual_value: number
          alert_sent: boolean | null
          board_reported: boolean | null
          breach_date: string
          breach_severity: string
          business_impact: string | null
          created_at: string
          escalated_at: string | null
          escalated_to: string | null
          escalated_to_name: string | null
          escalation_level: number | null
          id: string
          org_id: string
          remediation_actions: string | null
          resolution_date: string | null
          resolution_notes: string | null
          resolution_status: string
          risk_category_id: string | null
          statement_id: string | null
          threshold_id: string | null
          threshold_value: number
          updated_at: string
          variance_percentage: number | null
        }
        Insert: {
          actual_value: number
          alert_sent?: boolean | null
          board_reported?: boolean | null
          breach_date?: string
          breach_severity: string
          business_impact?: string | null
          created_at?: string
          escalated_at?: string | null
          escalated_to?: string | null
          escalated_to_name?: string | null
          escalation_level?: number | null
          id?: string
          org_id: string
          remediation_actions?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          resolution_status?: string
          risk_category_id?: string | null
          statement_id?: string | null
          threshold_id?: string | null
          threshold_value: number
          updated_at?: string
          variance_percentage?: number | null
        }
        Update: {
          actual_value?: number
          alert_sent?: boolean | null
          board_reported?: boolean | null
          breach_date?: string
          breach_severity?: string
          business_impact?: string | null
          created_at?: string
          escalated_at?: string | null
          escalated_to?: string | null
          escalated_to_name?: string | null
          escalation_level?: number | null
          id?: string
          org_id?: string
          remediation_actions?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          resolution_status?: string
          risk_category_id?: string | null
          statement_id?: string | null
          threshold_id?: string | null
          threshold_value?: number
          updated_at?: string
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appetite_breach_logs_risk_category_id_fkey"
            columns: ["risk_category_id"]
            isOneToOne: false
            referencedRelation: "risk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appetite_breach_logs_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "risk_appetite_statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appetite_breach_logs_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "risk_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      appetite_escalation_rules: {
        Row: {
          auto_escalate: boolean | null
          created_at: string
          escalation_delay_hours: number | null
          escalation_level: number
          id: string
          is_active: boolean | null
          notification_recipients: Json | null
          org_id: string
          rule_description: string | null
          rule_name: string
          threshold_value: number
          trigger_condition: string
          updated_at: string
        }
        Insert: {
          auto_escalate?: boolean | null
          created_at?: string
          escalation_delay_hours?: number | null
          escalation_level: number
          id?: string
          is_active?: boolean | null
          notification_recipients?: Json | null
          org_id: string
          rule_description?: string | null
          rule_name: string
          threshold_value: number
          trigger_condition: string
          updated_at?: string
        }
        Update: {
          auto_escalate?: boolean | null
          created_at?: string
          escalation_delay_hours?: number | null
          escalation_level?: number
          id?: string
          is_active?: boolean | null
          notification_recipients?: Json | null
          org_id?: string
          rule_description?: string | null
          rule_name?: string
          threshold_value?: number
          trigger_condition?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_gap_logs: {
        Row: {
          actual_closure_date: string | null
          actual_effort_hours: number | null
          assigned_to: string | null
          assigned_to_name: string | null
          business_impact_score: number | null
          cost_to_remediate: number | null
          created_at: string
          current_status: string
          estimated_effort_hours: number | null
          gap_description: string | null
          gap_title: string
          gap_type: string
          id: string
          identified_by: string | null
          identified_by_name: string | null
          identified_date: string
          impact_assessment: string | null
          org_id: string
          regulatory_mapping_id: string | null
          regulatory_risk_score: number | null
          resolution_date: string | null
          resolution_plan: string | null
          root_cause_analysis: string | null
          target_closure_date: string | null
          updated_at: string
          verification_date: string | null
          verified_by: string | null
          verified_by_name: string | null
        }
        Insert: {
          actual_closure_date?: string | null
          actual_effort_hours?: number | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          business_impact_score?: number | null
          cost_to_remediate?: number | null
          created_at?: string
          current_status?: string
          estimated_effort_hours?: number | null
          gap_description?: string | null
          gap_title: string
          gap_type?: string
          id?: string
          identified_by?: string | null
          identified_by_name?: string | null
          identified_date?: string
          impact_assessment?: string | null
          org_id: string
          regulatory_mapping_id?: string | null
          regulatory_risk_score?: number | null
          resolution_date?: string | null
          resolution_plan?: string | null
          root_cause_analysis?: string | null
          target_closure_date?: string | null
          updated_at?: string
          verification_date?: string | null
          verified_by?: string | null
          verified_by_name?: string | null
        }
        Update: {
          actual_closure_date?: string | null
          actual_effort_hours?: number | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          business_impact_score?: number | null
          cost_to_remediate?: number | null
          created_at?: string
          current_status?: string
          estimated_effort_hours?: number | null
          gap_description?: string | null
          gap_title?: string
          gap_type?: string
          id?: string
          identified_by?: string | null
          identified_by_name?: string | null
          identified_date?: string
          impact_assessment?: string | null
          org_id?: string
          regulatory_mapping_id?: string | null
          regulatory_risk_score?: number | null
          resolution_date?: string | null
          resolution_plan?: string | null
          root_cause_analysis?: string | null
          target_closure_date?: string | null
          updated_at?: string
          verification_date?: string | null
          verified_by?: string | null
          verified_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_gap_logs_mapping"
            columns: ["regulatory_mapping_id"]
            isOneToOne: false
            referencedRelation: "regulatory_mapping"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audit_gap_logs_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          module: string
          org_id: string
          resource_id: string | null
          resource_type: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          module: string
          org_id: string
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          module?: string
          org_id?: string
          resource_id?: string | null
          resource_type?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      audit_schedules: {
        Row: {
          actual_hours: number | null
          assigned_auditor_id: string | null
          assigned_auditor_name: string | null
          audit_frequency: string | null
          audit_name: string
          audit_scope: string | null
          audit_type: string
          completion_percentage: number | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          estimated_hours: number | null
          id: string
          next_audit_date: string | null
          notes: string | null
          org_id: string
          priority: string
          regulatory_framework: string | null
          scheduled_end_date: string
          scheduled_start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_auditor_id?: string | null
          assigned_auditor_name?: string | null
          audit_frequency?: string | null
          audit_name: string
          audit_scope?: string | null
          audit_type?: string
          completion_percentage?: number | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          estimated_hours?: number | null
          id?: string
          next_audit_date?: string | null
          notes?: string | null
          org_id: string
          priority?: string
          regulatory_framework?: string | null
          scheduled_end_date: string
          scheduled_start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_auditor_id?: string | null
          assigned_auditor_name?: string | null
          audit_frequency?: string | null
          audit_name?: string
          audit_scope?: string | null
          audit_type?: string
          completion_percentage?: number | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          estimated_hours?: number | null
          id?: string
          next_audit_date?: string | null
          notes?: string | null
          org_id?: string
          priority?: string
          regulatory_framework?: string | null
          scheduled_end_date?: string
          scheduled_start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_schedules_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          completion_date: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          due_date: string
          finding_id: string | null
          id: string
          org_id: string
          priority: string
          progress_notes: string | null
          status: string
          task_description: string | null
          task_title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          due_date: string
          finding_id?: string | null
          id?: string
          org_id: string
          priority?: string
          progress_notes?: string | null
          status?: string
          task_description?: string | null
          task_title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          due_date?: string
          finding_id?: string | null
          id?: string
          org_id?: string
          priority?: string
          progress_notes?: string | null
          status?: string
          task_description?: string | null
          task_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_tasks_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "compliance_findings"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trails: {
        Row: {
          action_type: string
          changes_made: Json | null
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: string | null
          module_name: string
          org_id: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action_type: string
          changes_made?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          module_name: string
          org_id: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action_type?: string
          changes_made?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          module_name?: string
          org_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      audit_uploads: {
        Row: {
          audit_period: string | null
          audit_type: string
          created_at: string
          description: string | null
          document_name: string
          document_type: string
          file_path: string | null
          file_size: number | null
          id: string
          org_id: string
          status: string
          tags: string[] | null
          updated_at: string
          upload_date: string
          uploaded_by: string | null
          uploaded_by_name: string | null
        }
        Insert: {
          audit_period?: string | null
          audit_type: string
          created_at?: string
          description?: string | null
          document_name: string
          document_type: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          org_id: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Update: {
          audit_period?: string | null
          audit_type?: string
          created_at?: string
          description?: string | null
          document_name?: string
          document_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          org_id?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Relationships: []
      }
      auth_settings: {
        Row: {
          allowed_auth_methods: Json
          created_at: string
          created_by: string | null
          id: string
          ip_whitelist: Json | null
          mfa_enforced: boolean
          mfa_enforcement_date: string | null
          org_id: string
          password_policy: Json | null
          session_timeout_minutes: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allowed_auth_methods?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          ip_whitelist?: Json | null
          mfa_enforced?: boolean
          mfa_enforcement_date?: string | null
          org_id: string
          password_policy?: Json | null
          session_timeout_minutes?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allowed_auth_methods?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          ip_whitelist?: Json | null
          mfa_enforced?: boolean
          mfa_enforcement_date?: string | null
          org_id?: string
          password_policy?: Json | null
          session_timeout_minutes?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      authentication_sessions: {
        Row: {
          authentication_factors: Json
          created_at: string
          device_fingerprint_id: string
          expires_at: string
          id: string
          is_active: boolean
          last_activity_at: string
          location_data: Json | null
          org_id: string
          risk_score: number
          session_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          authentication_factors?: Json
          created_at?: string
          device_fingerprint_id: string
          expires_at: string
          id?: string
          is_active?: boolean
          last_activity_at?: string
          location_data?: Json | null
          org_id: string
          risk_score?: number
          session_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          authentication_factors?: Json
          created_at?: string
          device_fingerprint_id?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          last_activity_at?: string
          location_data?: Json | null
          org_id?: string
          risk_score?: number
          session_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "authentication_sessions_device_fingerprint_id_fkey"
            columns: ["device_fingerprint_id"]
            isOneToOne: false
            referencedRelation: "device_fingerprints"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          created_at: string
          execution_count: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          org_id: string
          rule_name: string
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          org_id: string
          rule_name: string
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          actions?: Json
          created_at?: string
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          org_id?: string
          rule_name?: string
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      behavioral_analytics: {
        Row: {
          activity_data: Json
          activity_type: string
          anomaly_score: number
          created_at: string
          detected_at: string
          id: string
          org_id: string
          risk_indicators: Json
          session_id: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json
          activity_type: string
          anomaly_score?: number
          created_at?: string
          detected_at?: string
          id?: string
          org_id: string
          risk_indicators?: Json
          session_id?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          anomaly_score?: number
          created_at?: string
          detected_at?: string
          id?: string
          org_id?: string
          risk_indicators?: Json
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "authentication_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      best_practice_guides: {
        Row: {
          case_studies: Json | null
          common_challenges: Json | null
          content_sections: Json
          created_at: string
          created_by: string | null
          created_by_name: string | null
          difficulty_level: string | null
          estimated_completion_time: number | null
          guide_title: string
          guide_type: string
          id: string
          is_published: boolean | null
          prerequisites: string[] | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          step_by_step_instructions: Json | null
          success_factors: Json | null
          target_audience: string[] | null
          template_id: string | null
          tools_required: string[] | null
          troubleshooting_tips: Json | null
          updated_at: string
        }
        Insert: {
          case_studies?: Json | null
          common_challenges?: Json | null
          content_sections?: Json
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          difficulty_level?: string | null
          estimated_completion_time?: number | null
          guide_title: string
          guide_type?: string
          id?: string
          is_published?: boolean | null
          prerequisites?: string[] | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          step_by_step_instructions?: Json | null
          success_factors?: Json | null
          target_audience?: string[] | null
          template_id?: string | null
          tools_required?: string[] | null
          troubleshooting_tips?: Json | null
          updated_at?: string
        }
        Update: {
          case_studies?: Json | null
          common_challenges?: Json | null
          content_sections?: Json
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          difficulty_level?: string | null
          estimated_completion_time?: number | null
          guide_title?: string
          guide_type?: string
          id?: string
          is_published?: boolean | null
          prerequisites?: string[] | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          step_by_step_instructions?: Json | null
          success_factors?: Json | null
          target_audience?: string[] | null
          template_id?: string | null
          tools_required?: string[] | null
          troubleshooting_tips?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "best_practice_guides_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_template_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      business_continuity_scenarios: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          impact_assessment: Json
          last_tested_date: string | null
          lessons_learned: string | null
          next_test_date: string | null
          org_id: string
          recovery_objectives: Json
          response_procedures: Json
          scenario_description: string
          scenario_name: string
          scenario_status: string | null
          scenario_type: string
          severity_level: string
          test_results: Json | null
          testing_frequency_days: number | null
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          impact_assessment?: Json
          last_tested_date?: string | null
          lessons_learned?: string | null
          next_test_date?: string | null
          org_id: string
          recovery_objectives?: Json
          response_procedures?: Json
          scenario_description: string
          scenario_name: string
          scenario_status?: string | null
          scenario_type: string
          severity_level: string
          test_results?: Json | null
          testing_frequency_days?: number | null
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          impact_assessment?: Json
          last_tested_date?: string | null
          lessons_learned?: string | null
          next_test_date?: string | null
          org_id?: string
          recovery_objectives?: Json
          response_procedures?: Json
          scenario_description?: string
          scenario_name?: string
          scenario_status?: string | null
          scenario_type?: string
          severity_level?: string
          test_results?: Json | null
          testing_frequency_days?: number | null
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: []
      }
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
      business_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          priority: number
          rule_type: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          priority?: number
          rule_type: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          priority?: number
          rule_type?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_rules_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_orchestrations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          document_id: string | null
          id: string
          is_resolved: boolean | null
          mentions: string[] | null
          org_id: string
          parent_comment_id: string | null
          reactions: Json | null
          resolved_at: string | null
          resolved_by: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          document_id?: string | null
          id?: string
          is_resolved?: boolean | null
          mentions?: string[] | null
          org_id: string
          parent_comment_id?: string | null
          reactions?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          document_id?: string | null
          id?: string
          is_resolved?: boolean | null
          mentions?: string[] | null
          org_id?: string
          parent_comment_id?: string | null
          reactions?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "collaboration_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_meetings: {
        Row: {
          agenda: string[] | null
          attendees: string[] | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          meeting_type: string | null
          org_id: string
          organizer_id: string | null
          organizer_name: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          agenda?: string[] | null
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          meeting_type?: string | null
          org_id: string
          organizer_id?: string | null
          organizer_name?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          agenda?: string[] | null
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          meeting_type?: string | null
          org_id?: string
          organizer_id?: string | null
          organizer_name?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      collaboration_notifications: {
        Row: {
          channels: string[]
          created_at: string
          delivered_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          org_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          title: string
          urgency: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          delivered_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          org_id: string
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          title: string
          urgency?: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          delivered_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          org_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          title?: string
          urgency?: string
        }
        Relationships: []
      }
      collaboration_sessions: {
        Row: {
          created_at: string
          created_by: string | null
          document_id: string | null
          id: string
          is_active: boolean
          org_id: string
          participants: Json
          session_data: Json
          session_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          id?: string
          is_active?: boolean
          org_id: string
          participants?: Json
          session_data?: Json
          session_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          participants?: Json
          session_data?: Json
          session_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_automation_rules: {
        Row: {
          alert_configuration: Json | null
          automation_actions: Json
          created_at: string
          created_by: string | null
          execution_frequency: string
          execution_results: Json | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          org_id: string
          regulation_reference: string
          rule_conditions: Json
          rule_name: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          alert_configuration?: Json | null
          automation_actions?: Json
          created_at?: string
          created_by?: string | null
          execution_frequency: string
          execution_results?: Json | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          org_id: string
          regulation_reference: string
          rule_conditions?: Json
          rule_name: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          alert_configuration?: Json | null
          automation_actions?: Json
          created_at?: string
          created_by?: string | null
          execution_frequency?: string
          execution_results?: Json | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          org_id?: string
          regulation_reference?: string
          rule_conditions?: Json
          rule_name?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_checks: {
        Row: {
          check_result: string
          checked_at: string
          compliance_score: number
          created_at: string
          id: string
          org_id: string
          policy_id: string
          remediated_at: string | null
          remediation_status: string
          violations_found: Json
        }
        Insert: {
          check_result: string
          checked_at?: string
          compliance_score?: number
          created_at?: string
          id?: string
          org_id: string
          policy_id: string
          remediated_at?: string | null
          remediation_status?: string
          violations_found?: Json
        }
        Update: {
          check_result?: string
          checked_at?: string
          compliance_score?: number
          created_at?: string
          id?: string
          org_id?: string
          policy_id?: string
          remediated_at?: string | null
          remediation_status?: string
          violations_found?: Json
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_findings: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          audit_upload_id: string | null
          corrective_actions: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          due_date: string | null
          finding_description: string
          finding_reference: string
          finding_title: string
          id: string
          internal_response: string | null
          module_affected: string
          org_id: string
          regulator_comments: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          audit_upload_id?: string | null
          corrective_actions?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          due_date?: string | null
          finding_description: string
          finding_reference: string
          finding_title: string
          id?: string
          internal_response?: string | null
          module_affected: string
          org_id: string
          regulator_comments?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          audit_upload_id?: string | null
          corrective_actions?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          due_date?: string | null
          finding_description?: string
          finding_reference?: string
          finding_title?: string
          id?: string
          internal_response?: string | null
          module_affected?: string
          org_id?: string
          regulator_comments?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_findings_audit_upload_id_fkey"
            columns: ["audit_upload_id"]
            isOneToOne: false
            referencedRelation: "audit_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_frameworks: {
        Row: {
          assessment_frequency: string
          controls: Json
          created_at: string
          created_by: string | null
          framework_name: string
          framework_version: string
          id: string
          is_active: boolean
          org_id: string
          requirements: Json
          updated_at: string
        }
        Insert: {
          assessment_frequency?: string
          controls?: Json
          created_at?: string
          created_by?: string | null
          framework_name: string
          framework_version: string
          id?: string
          is_active?: boolean
          org_id: string
          requirements?: Json
          updated_at?: string
        }
        Update: {
          assessment_frequency?: string
          controls?: Json
          created_at?: string
          created_by?: string | null
          framework_name?: string
          framework_version?: string
          id?: string
          is_active?: boolean
          org_id?: string
          requirements?: Json
          updated_at?: string
        }
        Relationships: []
      }
      compliance_monitoring_rules: {
        Row: {
          breach_thresholds: Json | null
          created_at: string
          execution_status: string | null
          id: string
          is_active: boolean
          last_executed_at: string | null
          monitoring_frequency: string
          notification_settings: Json | null
          org_id: string
          regulatory_intelligence_id: string | null
          rule_logic: Json
          rule_name: string
          rule_type: string
          updated_at: string
          validation_criteria: Json
        }
        Insert: {
          breach_thresholds?: Json | null
          created_at?: string
          execution_status?: string | null
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          monitoring_frequency?: string
          notification_settings?: Json | null
          org_id: string
          regulatory_intelligence_id?: string | null
          rule_logic?: Json
          rule_name: string
          rule_type?: string
          updated_at?: string
          validation_criteria?: Json
        }
        Update: {
          breach_thresholds?: Json | null
          created_at?: string
          execution_status?: string | null
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          monitoring_frequency?: string
          notification_settings?: Json | null
          org_id?: string
          regulatory_intelligence_id?: string | null
          rule_logic?: Json
          rule_name?: string
          rule_type?: string
          updated_at?: string
          validation_criteria?: Json
        }
        Relationships: [
          {
            foreignKeyName: "compliance_monitoring_rules_regulatory_intelligence_id_fkey"
            columns: ["regulatory_intelligence_id"]
            isOneToOne: false
            referencedRelation: "regulatory_intelligence"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_policies: {
        Row: {
          auto_remediation: boolean
          check_frequency: string
          created_at: string
          created_by: string | null
          framework: string
          id: string
          is_active: boolean
          org_id: string
          policy_name: string
          policy_rules: Json
          remediation_actions: Json
          severity: string
          updated_at: string
        }
        Insert: {
          auto_remediation?: boolean
          check_frequency?: string
          created_at?: string
          created_by?: string | null
          framework: string
          id?: string
          is_active?: boolean
          org_id: string
          policy_name: string
          policy_rules?: Json
          remediation_actions?: Json
          severity?: string
          updated_at?: string
        }
        Update: {
          auto_remediation?: boolean
          check_frequency?: string
          created_at?: string
          created_by?: string | null
          framework?: string
          id?: string
          is_active?: boolean
          org_id?: string
          policy_name?: string
          policy_rules?: Json
          remediation_actions?: Json
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_reports: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          compliance_data: Json
          created_at: string
          critical_findings: Json
          framework: string
          generated_by: string | null
          id: string
          org_id: string
          overall_score: number | null
          recommendations: Json
          report_period_end: string
          report_period_start: string
          report_type: string
          status: string
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          compliance_data?: Json
          created_at?: string
          critical_findings?: Json
          framework: string
          generated_by?: string | null
          id?: string
          org_id: string
          overall_score?: number | null
          recommendations?: Json
          report_period_end: string
          report_period_start: string
          report_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          compliance_data?: Json
          created_at?: string
          critical_findings?: Json
          framework?: string
          generated_by?: string | null
          id?: string
          org_id?: string
          overall_score?: number | null
          recommendations?: Json
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_violations: {
        Row: {
          affected_systems: Json | null
          assigned_to: string | null
          assigned_to_name: string | null
          business_impact: string | null
          created_at: string
          detected_at: string
          id: string
          monitoring_rule_id: string | null
          org_id: string
          regulatory_intelligence_id: string | null
          remediation_deadline: string | null
          remediation_plan: string | null
          remediation_status: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          updated_at: string
          violation_description: string
          violation_type: string
        }
        Insert: {
          affected_systems?: Json | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          business_impact?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          monitoring_rule_id?: string | null
          org_id: string
          regulatory_intelligence_id?: string | null
          remediation_deadline?: string | null
          remediation_plan?: string | null
          remediation_status?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          updated_at?: string
          violation_description: string
          violation_type: string
        }
        Update: {
          affected_systems?: Json | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          business_impact?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          monitoring_rule_id?: string | null
          org_id?: string
          regulatory_intelligence_id?: string | null
          remediation_deadline?: string | null
          remediation_plan?: string | null
          remediation_status?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          updated_at?: string
          violation_description?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_violations_monitoring_rule_id_fkey"
            columns: ["monitoring_rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_monitoring_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_regulatory_intelligence_id_fkey"
            columns: ["regulatory_intelligence_id"]
            isOneToOne: false
            referencedRelation: "regulatory_intelligence"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_plans: {
        Row: {
          business_function_id: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          fallback_steps: string
          file_size: number | null
          id: string
          last_tested_date: string | null
          mime_type: string | null
          next_test_date: string | null
          org_id: string
          plan_description: string | null
          plan_document_name: string | null
          plan_document_path: string | null
          plan_name: string
          rpo_hours: number | null
          rto_hours: number
          status: string
          updated_at: string
          updated_by: string | null
          updated_by_name: string | null
          version: number
        }
        Insert: {
          business_function_id: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          fallback_steps: string
          file_size?: number | null
          id?: string
          last_tested_date?: string | null
          mime_type?: string | null
          next_test_date?: string | null
          org_id: string
          plan_description?: string | null
          plan_document_name?: string | null
          plan_document_path?: string | null
          plan_name: string
          rpo_hours?: number | null
          rto_hours: number
          status?: string
          updated_at?: string
          updated_by?: string | null
          updated_by_name?: string | null
          version?: number
        }
        Update: {
          business_function_id?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          fallback_steps?: string
          file_size?: number | null
          id?: string
          last_tested_date?: string | null
          mime_type?: string | null
          next_test_date?: string | null
          org_id?: string
          plan_description?: string | null
          plan_document_name?: string | null
          plan_document_path?: string | null
          plan_name?: string
          rpo_hours?: number | null
          rto_hours?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
          updated_by_name?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_continuity_plans_business_function"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_tests: {
        Row: {
          actual_outcomes: string | null
          conducted_by: string | null
          conducted_by_name: string | null
          conducted_date: string | null
          continuity_plan_id: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          duration_minutes: number | null
          id: string
          improvements_identified: string | null
          issues_identified: string | null
          org_id: string
          overall_score: number | null
          participants: string[] | null
          rto_achieved_hours: number | null
          rto_target_met: boolean | null
          scheduled_date: string
          status: string
          success_criteria: string | null
          test_description: string | null
          test_name: string
          test_scenario: string | null
          test_scope: string | null
          test_type: string
          updated_at: string
        }
        Insert: {
          actual_outcomes?: string | null
          conducted_by?: string | null
          conducted_by_name?: string | null
          conducted_date?: string | null
          continuity_plan_id: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          duration_minutes?: number | null
          id?: string
          improvements_identified?: string | null
          issues_identified?: string | null
          org_id: string
          overall_score?: number | null
          participants?: string[] | null
          rto_achieved_hours?: number | null
          rto_target_met?: boolean | null
          scheduled_date: string
          status?: string
          success_criteria?: string | null
          test_description?: string | null
          test_name: string
          test_scenario?: string | null
          test_scope?: string | null
          test_type: string
          updated_at?: string
        }
        Update: {
          actual_outcomes?: string | null
          conducted_by?: string | null
          conducted_by_name?: string | null
          conducted_date?: string | null
          continuity_plan_id?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          duration_minutes?: number | null
          id?: string
          improvements_identified?: string | null
          issues_identified?: string | null
          org_id?: string
          overall_score?: number | null
          participants?: string[] | null
          rto_achieved_hours?: number | null
          rto_target_met?: boolean | null
          scheduled_date?: string
          status?: string
          success_criteria?: string | null
          test_description?: string | null
          test_name?: string
          test_scenario?: string | null
          test_scope?: string | null
          test_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_continuity_tests_plan"
            columns: ["continuity_plan_id"]
            isOneToOne: false
            referencedRelation: "continuity_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_renewal_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_date: string
          alert_type: string
          contract_id: string
          created_at: string | null
          days_until_expiry: number
          email_sent_at: string | null
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_date: string
          alert_type?: string
          contract_id: string
          created_at?: string | null
          days_until_expiry: number
          email_sent_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_date?: string
          alert_type?: string
          contract_id?: string
          created_at?: string | null
          days_until_expiry?: number
          email_sent_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_renewal_alerts_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "vendor_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      control_libraries: {
        Row: {
          control_description: string
          control_name: string
          control_type: string
          created_at: string
          effectiveness_rating: number | null
          id: string
          implementation_guidance: string | null
          regulatory_references: string[] | null
          risk_categories: string[]
          updated_at: string
        }
        Insert: {
          control_description: string
          control_name: string
          control_type: string
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          implementation_guidance?: string | null
          regulatory_references?: string[] | null
          risk_categories?: string[]
          updated_at?: string
        }
        Update: {
          control_description?: string
          control_name?: string
          control_type?: string
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          implementation_guidance?: string | null
          regulatory_references?: string[] | null
          risk_categories?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      control_tests: {
        Row: {
          control_id: string
          created_at: string
          effectiveness_rating: number | null
          findings: string | null
          id: string
          org_id: string
          recommendations: string | null
          remediation_deadline: string | null
          remediation_required: boolean | null
          remediation_status: string | null
          risk_reduction_impact: number | null
          test_date: string
          test_description: string | null
          test_method: string
          test_result: string
          test_type: string
          tested_by_id: string | null
          tested_by_name: string | null
          updated_at: string
        }
        Insert: {
          control_id: string
          created_at?: string
          effectiveness_rating?: number | null
          findings?: string | null
          id?: string
          org_id: string
          recommendations?: string | null
          remediation_deadline?: string | null
          remediation_required?: boolean | null
          remediation_status?: string | null
          risk_reduction_impact?: number | null
          test_date?: string
          test_description?: string | null
          test_method?: string
          test_result: string
          test_type?: string
          tested_by_id?: string | null
          tested_by_name?: string | null
          updated_at?: string
        }
        Update: {
          control_id?: string
          created_at?: string
          effectiveness_rating?: number | null
          findings?: string | null
          id?: string
          org_id?: string
          recommendations?: string | null
          remediation_deadline?: string | null
          remediation_required?: boolean | null
          remediation_status?: string | null
          risk_reduction_impact?: number | null
          test_date?: string
          test_description?: string | null
          test_method?: string
          test_result?: string
          test_type?: string
          tested_by_id?: string | null
          tested_by_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "control_tests_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
        ]
      }
      controls: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          effectiveness_score: number | null
          frequency: string
          id: string
          last_test_date: string | null
          next_test_due_date: string | null
          org_id: string
          owner: string
          risk_reduction_score: number | null
          scope: string
          status: string
          test_frequency_days: number | null
          test_method: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          effectiveness_score?: number | null
          frequency: string
          id?: string
          last_test_date?: string | null
          next_test_due_date?: string | null
          org_id: string
          owner: string
          risk_reduction_score?: number | null
          scope: string
          status?: string
          test_frequency_days?: number | null
          test_method?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          effectiveness_score?: number | null
          frequency?: string
          id?: string
          last_test_date?: string | null
          next_test_due_date?: string | null
          org_id?: string
          owner?: string
          risk_reduction_score?: number | null
          scope?: string
          status?: string
          test_frequency_days?: number | null
          test_method?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      custom_dashboards: {
        Row: {
          created_at: string
          created_by: string | null
          dashboard_name: string
          dashboard_type: string
          description: string | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          layout_config: Json
          name: string | null
          org_id: string
          shared_with: string[] | null
          updated_at: string
          user_id: string | null
          widget_config: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dashboard_name: string
          dashboard_type?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout_config?: Json
          name?: string | null
          org_id: string
          shared_with?: string[] | null
          updated_at?: string
          user_id?: string | null
          widget_config?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dashboard_name?: string
          dashboard_type?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout_config?: Json
          name?: string | null
          org_id?: string
          shared_with?: string[] | null
          updated_at?: string
          user_id?: string | null
          widget_config?: Json
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          created_at: string
          dashboard_id: string
          filters: Json | null
          id: string
          is_active: boolean | null
          position: number | null
          position_config: Json
          updated_at: string
          widget_config: Json
          widget_type: string
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          position_config?: Json
          updated_at?: string
          widget_config?: Json
          widget_type: string
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          position_config?: Json
          updated_at?: string
          widget_config?: Json
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      data_access_logs: {
        Row: {
          access_granted: boolean
          access_type: string
          accessed_at: string
          created_at: string
          data_classification: string | null
          denial_reason: string | null
          id: string
          ip_address: unknown | null
          org_id: string
          resource_id: string
          resource_type: string
          risk_score: number
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_granted?: boolean
          access_type: string
          accessed_at?: string
          created_at?: string
          data_classification?: string | null
          denial_reason?: string | null
          id?: string
          ip_address?: unknown | null
          org_id: string
          resource_id: string
          resource_type: string
          risk_score?: number
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_granted?: boolean
          access_type?: string
          accessed_at?: string
          created_at?: string
          data_classification?: string | null
          denial_reason?: string | null
          id?: string
          ip_address?: unknown | null
          org_id?: string
          resource_id?: string
          resource_type?: string
          risk_score?: number
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_classifications: {
        Row: {
          classification_level: string
          classification_name: string
          created_at: string
          created_by: string | null
          data_patterns: Json
          id: string
          org_id: string
          protection_rules: Json
          updated_at: string
        }
        Insert: {
          classification_level: string
          classification_name: string
          created_at?: string
          created_by?: string | null
          data_patterns?: Json
          id?: string
          org_id: string
          protection_rules?: Json
          updated_at?: string
        }
        Update: {
          classification_level?: string
          classification_name?: string
          created_at?: string
          created_by?: string | null
          data_patterns?: Json
          id?: string
          org_id?: string
          protection_rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      data_lineage: {
        Row: {
          conflict_data: Json | null
          created_at: string
          created_by: string | null
          field_changes: Json | null
          id: string
          operation_type: string
          org_id: string
          resolved_at: string | null
          resolved_by: string | null
          source_id: string
          source_table: string
          sync_status: string
          target_id: string
          target_table: string
          transformation_rules: Json | null
          updated_at: string
        }
        Insert: {
          conflict_data?: Json | null
          created_at?: string
          created_by?: string | null
          field_changes?: Json | null
          id?: string
          operation_type: string
          org_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          source_id: string
          source_table: string
          sync_status?: string
          target_id: string
          target_table: string
          transformation_rules?: Json | null
          updated_at?: string
        }
        Update: {
          conflict_data?: Json | null
          created_at?: string
          created_by?: string | null
          field_changes?: Json | null
          id?: string
          operation_type?: string
          org_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          source_id?: string
          source_table?: string
          sync_status?: string
          target_id?: string
          target_table?: string
          transformation_rules?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      data_quality_checks: {
        Row: {
          check_name: string
          check_result: Json | null
          check_status: string
          check_type: string
          checked_at: string | null
          created_at: string | null
          data_source: string
          error_details: string | null
          id: string
          org_id: string
          report_instance_id: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          check_name: string
          check_result?: Json | null
          check_status?: string
          check_type: string
          checked_at?: string | null
          created_at?: string | null
          data_source: string
          error_details?: string | null
          id?: string
          org_id: string
          report_instance_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          check_name?: string
          check_result?: Json | null
          check_status?: string
          check_type?: string
          checked_at?: string | null
          created_at?: string | null
          data_source?: string
          error_details?: string | null
          id?: string
          org_id?: string
          report_instance_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }
      data_quality_metrics: {
        Row: {
          accuracy_score: number | null
          completeness_score: number | null
          consistency_score: number | null
          created_at: string
          id: string
          last_validated_at: string
          org_id: string
          quality_issues: Json | null
          quality_score: number
          record_id: string
          table_name: string
          updated_at: string
          validation_rules: Json | null
          validity_score: number | null
        }
        Insert: {
          accuracy_score?: number | null
          completeness_score?: number | null
          consistency_score?: number | null
          created_at?: string
          id?: string
          last_validated_at?: string
          org_id: string
          quality_issues?: Json | null
          quality_score?: number
          record_id: string
          table_name: string
          updated_at?: string
          validation_rules?: Json | null
          validity_score?: number | null
        }
        Update: {
          accuracy_score?: number | null
          completeness_score?: number | null
          consistency_score?: number | null
          created_at?: string
          id?: string
          last_validated_at?: string
          org_id?: string
          quality_issues?: Json | null
          quality_score?: number
          record_id?: string
          table_name?: string
          updated_at?: string
          validation_rules?: Json | null
          validity_score?: number | null
        }
        Relationships: []
      }
      data_retention_policies: {
        Row: {
          auto_delete: boolean
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          org_id: string
          retention_period_days: number
          table_name: string
          updated_at: string
        }
        Insert: {
          auto_delete?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id: string
          retention_period_days: number
          table_name: string
          updated_at?: string
        }
        Update: {
          auto_delete?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id?: string
          retention_period_days?: number
          table_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_retention_policies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_validation_rules: {
        Row: {
          created_at: string
          created_by: string | null
          error_message: string
          id: string
          is_active: boolean
          org_id: string
          rule_name: string
          rule_type: string
          severity: string
          target_fields: string[]
          target_tables: string[]
          updated_at: string
          validation_logic: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_message: string
          id?: string
          is_active?: boolean
          org_id: string
          rule_name: string
          rule_type: string
          severity?: string
          target_fields?: string[]
          target_tables?: string[]
          updated_at?: string
          validation_logic?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_message?: string
          id?: string
          is_active?: boolean
          org_id?: string
          rule_name?: string
          rule_type?: string
          severity?: string
          target_fields?: string[]
          target_tables?: string[]
          updated_at?: string
          validation_logic?: Json
        }
        Relationships: []
      }
      dependencies: {
        Row: {
          business_function_id: string
          created_at: string
          criticality: string
          dependency_id: string | null
          dependency_name: string
          dependency_type: string
          description: string | null
          escalation_contacts: Json | null
          geographic_location: string | null
          id: string
          maximum_tolerable_downtime_hours: number | null
          monitoring_status: string | null
          org_id: string
          recovery_time_objective_hours: number | null
          redundancy_level: string | null
          sla_requirements: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_function_id: string
          created_at?: string
          criticality?: string
          dependency_id?: string | null
          dependency_name: string
          dependency_type: string
          description?: string | null
          escalation_contacts?: Json | null
          geographic_location?: string | null
          id?: string
          maximum_tolerable_downtime_hours?: number | null
          monitoring_status?: string | null
          org_id: string
          recovery_time_objective_hours?: number | null
          redundancy_level?: string | null
          sla_requirements?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_function_id?: string
          created_at?: string
          criticality?: string
          dependency_id?: string | null
          dependency_name?: string
          dependency_type?: string
          description?: string | null
          escalation_contacts?: Json | null
          geographic_location?: string | null
          id?: string
          maximum_tolerable_downtime_hours?: number | null
          monitoring_status?: string | null
          org_id?: string
          recovery_time_objective_hours?: number | null
          redundancy_level?: string | null
          sla_requirements?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependencies_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      dependency_logs: {
        Row: {
          alert_sent: boolean | null
          breach_duration_minutes: number | null
          business_function_id: string
          created_at: string
          dependency_id: string
          detected_at: string
          event_type: string
          id: string
          impact_level: string | null
          new_status: string
          notes: string | null
          org_id: string
          previous_status: string | null
          tolerance_breached: boolean | null
        }
        Insert: {
          alert_sent?: boolean | null
          breach_duration_minutes?: number | null
          business_function_id: string
          created_at?: string
          dependency_id: string
          detected_at?: string
          event_type: string
          id?: string
          impact_level?: string | null
          new_status: string
          notes?: string | null
          org_id: string
          previous_status?: string | null
          tolerance_breached?: boolean | null
        }
        Update: {
          alert_sent?: boolean | null
          breach_duration_minutes?: number | null
          business_function_id?: string
          created_at?: string
          dependency_id?: string
          detected_at?: string
          event_type?: string
          id?: string
          impact_level?: string | null
          new_status?: string
          notes?: string | null
          org_id?: string
          previous_status?: string | null
          tolerance_breached?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "dependency_logs_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dependency_logs_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dependency_maps: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_name: string | null
          description: string | null
          failure_propagation_likelihood: number | null
          id: string
          org_id: string
          propagation_delay_minutes: number | null
          relationship_strength: string
          relationship_type: string
          source_dependency_id: string
          target_dependency_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          failure_propagation_likelihood?: number | null
          id?: string
          org_id: string
          propagation_delay_minutes?: number | null
          relationship_strength?: string
          relationship_type: string
          source_dependency_id: string
          target_dependency_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          failure_propagation_likelihood?: number | null
          id?: string
          org_id?: string
          propagation_delay_minutes?: number | null
          relationship_strength?: string
          relationship_type?: string
          source_dependency_id?: string
          target_dependency_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependency_maps_source_dependency_id_fkey"
            columns: ["source_dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dependency_maps_target_dependency_id_fkey"
            columns: ["target_dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dependency_risks: {
        Row: {
          assessor_id: string | null
          assessor_name: string | null
          contingency_plan: string | null
          created_at: string
          dependency_id: string
          id: string
          impact_score: number
          last_assessment_date: string
          likelihood_score: number
          mitigation_strategy: string | null
          next_assessment_date: string | null
          org_id: string
          risk_category: string
          risk_rating: string | null
          updated_at: string
        }
        Insert: {
          assessor_id?: string | null
          assessor_name?: string | null
          contingency_plan?: string | null
          created_at?: string
          dependency_id: string
          id?: string
          impact_score: number
          last_assessment_date?: string
          likelihood_score: number
          mitigation_strategy?: string | null
          next_assessment_date?: string | null
          org_id: string
          risk_category: string
          risk_rating?: string | null
          updated_at?: string
        }
        Update: {
          assessor_id?: string | null
          assessor_name?: string | null
          contingency_plan?: string | null
          created_at?: string
          dependency_id?: string
          id?: string
          impact_score?: number
          last_assessment_date?: string
          likelihood_score?: number
          mitigation_strategy?: string | null
          next_assessment_date?: string | null
          org_id?: string
          risk_category?: string
          risk_rating?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependency_risks_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
      dependency_status: {
        Row: {
          availability_percentage: number | null
          created_at: string
          dependency_id: string
          error_rate_percentage: number | null
          failure_reason: string | null
          health_score: number
          id: string
          last_successful_check: string | null
          monitoring_source: string | null
          org_id: string
          response_time_ms: number | null
          status_timestamp: string
        }
        Insert: {
          availability_percentage?: number | null
          created_at?: string
          dependency_id: string
          error_rate_percentage?: number | null
          failure_reason?: string | null
          health_score?: number
          id?: string
          last_successful_check?: string | null
          monitoring_source?: string | null
          org_id: string
          response_time_ms?: number | null
          status_timestamp?: string
        }
        Update: {
          availability_percentage?: number | null
          created_at?: string
          dependency_id?: string
          error_rate_percentage?: number | null
          failure_reason?: string | null
          health_score?: number
          id?: string
          last_successful_check?: string | null
          monitoring_source?: string | null
          org_id?: string
          response_time_ms?: number | null
          status_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependency_status_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_history: {
        Row: {
          artifacts: Json
          completed_at: string | null
          created_at: string
          deployed_by: string | null
          deployed_by_name: string | null
          deployment_config: Json
          deployment_logs: Json
          deployment_strategy: string
          deployment_version: string
          duration_seconds: number | null
          environment: string
          health_check_status: string | null
          id: string
          org_id: string
          rollback_reason: string | null
          rollback_target_version: string | null
          service_name: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          artifacts?: Json
          completed_at?: string | null
          created_at?: string
          deployed_by?: string | null
          deployed_by_name?: string | null
          deployment_config?: Json
          deployment_logs?: Json
          deployment_strategy?: string
          deployment_version: string
          duration_seconds?: number | null
          environment?: string
          health_check_status?: string | null
          id?: string
          org_id: string
          rollback_reason?: string | null
          rollback_target_version?: string | null
          service_name: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          artifacts?: Json
          completed_at?: string | null
          created_at?: string
          deployed_by?: string | null
          deployed_by_name?: string | null
          deployment_config?: Json
          deployment_logs?: Json
          deployment_strategy?: string
          deployment_version?: string
          duration_seconds?: number | null
          environment?: string
          health_check_status?: string | null
          id?: string
          org_id?: string
          rollback_reason?: string | null
          rollback_target_version?: string | null
          service_name?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_fingerprints: {
        Row: {
          created_at: string
          device_id: string
          device_info: Json
          fingerprint_hash: string
          id: string
          is_trusted: boolean
          last_seen_at: string
          org_id: string
          risk_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          device_info?: Json
          fingerprint_hash: string
          id?: string
          is_trusted?: boolean
          last_seen_at?: string
          org_id: string
          risk_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          device_info?: Json
          fingerprint_hash?: string
          id?: string
          is_trusted?: boolean
          last_seen_at?: string
          org_id?: string
          risk_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dlp_patterns: {
        Row: {
          action_on_match: string
          classification_level: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          org_id: string
          pattern_name: string
          pattern_regex: string
          pattern_type: string
          risk_score: number
          updated_at: string
        }
        Insert: {
          action_on_match?: string
          classification_level: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          org_id: string
          pattern_name: string
          pattern_regex: string
          pattern_type: string
          risk_score?: number
          updated_at?: string
        }
        Update: {
          action_on_match?: string
          classification_level?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          pattern_name?: string
          pattern_regex?: string
          pattern_type?: string
          risk_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      dlp_violations: {
        Row: {
          action_taken: string
          context_data: Json | null
          created_at: string
          detected_at: string
          detected_data: Json
          id: string
          investigation_status: string
          org_id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          updated_at: string
          user_id: string
          violation_type: string
        }
        Insert: {
          action_taken: string
          context_data?: Json | null
          created_at?: string
          detected_at?: string
          detected_data: Json
          id?: string
          investigation_status?: string
          org_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          updated_at?: string
          user_id: string
          violation_type: string
        }
        Update: {
          action_taken?: string
          context_data?: Json | null
          created_at?: string
          detected_at?: string
          detected_data?: Json
          id?: string
          investigation_status?: string
          org_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          updated_at?: string
          user_id?: string
          violation_type?: string
        }
        Relationships: []
      }
      document_access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          document_id: string
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          org_id: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          document_id: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          org_id: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          document_id?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          org_id?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis_logs: {
        Row: {
          analysis_content: string
          analysis_type: string
          created_at: string
          framework: string | null
          id: string
          user_id: string
        }
        Insert: {
          analysis_content: string
          analysis_type: string
          created_at?: string
          framework?: string | null
          id?: string
          user_id: string
        }
        Update: {
          analysis_content?: string
          analysis_type?: string
          created_at?: string
          framework?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      document_approvals: {
        Row: {
          approval_date: string | null
          approval_level: number | null
          approval_status: string
          approver_id: string
          approver_name: string
          created_at: string
          digital_signature: string | null
          document_id: string
          id: string
          is_final_approval: boolean | null
          org_id: string
          rejection_reason: string | null
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          approval_level?: number | null
          approval_status: string
          approver_id: string
          approver_name: string
          created_at?: string
          digital_signature?: string | null
          document_id: string
          id?: string
          is_final_approval?: boolean | null
          org_id: string
          rejection_reason?: string | null
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          approval_level?: number | null
          approval_status?: string
          approver_id?: string
          approver_name?: string
          created_at?: string
          digital_signature?: string | null
          document_id?: string
          id?: string
          is_final_approval?: boolean | null
          org_id?: string
          rejection_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          comment_text: string
          comment_type: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          document_id: string
          id: string
          is_resolved: boolean | null
          org_id: string
          parent_comment_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolved_by_name: string | null
          updated_at: string
        }
        Insert: {
          comment_text: string
          comment_type?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          document_id: string
          id?: string
          is_resolved?: boolean | null
          org_id: string
          parent_comment_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_by_name?: string | null
          updated_at?: string
        }
        Update: {
          comment_text?: string
          comment_type?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          document_id?: string
          id?: string
          is_resolved?: boolean | null
          org_id?: string
          parent_comment_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_by_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_relationships: {
        Row: {
          auto_detected: boolean | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          id: string
          org_id: string
          relationship_strength: number | null
          relationship_type: string
          source_document_id: string
          target_document_id: string
        }
        Insert: {
          auto_detected?: boolean | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          org_id: string
          relationship_strength?: number | null
          relationship_type: string
          source_document_id: string
          target_document_id: string
        }
        Update: {
          auto_detected?: boolean | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          org_id?: string
          relationship_strength?: number | null
          relationship_type?: string
          source_document_id?: string
          target_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_relationships_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_relationships_target_document_id_fkey"
            columns: ["target_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_repositories: {
        Row: {
          access_level: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          description: string | null
          document_type: string
          id: string
          name: string
          org_id: string
          retention_years: number | null
          updated_at: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          document_type: string
          id?: string
          name: string
          org_id: string
          retention_years?: number | null
          updated_at?: string
        }
        Update: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          document_type?: string
          id?: string
          name?: string
          org_id?: string
          retention_years?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      document_shares: {
        Row: {
          access_count: number | null
          access_level: string | null
          access_token: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          document_id: string
          download_allowed: boolean | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          org_id: string
          password_hash: string | null
          password_protected: boolean | null
          shared_with_email: string | null
          shared_with_organization: string | null
          updated_at: string
        }
        Insert: {
          access_count?: number | null
          access_level?: string | null
          access_token?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          document_id: string
          download_allowed?: boolean | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          org_id: string
          password_hash?: string | null
          password_protected?: boolean | null
          shared_with_email?: string | null
          shared_with_organization?: string | null
          updated_at?: string
        }
        Update: {
          access_count?: number | null
          access_level?: string | null
          access_token?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          document_id?: string
          download_allowed?: boolean | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          org_id?: string
          password_hash?: string | null
          password_protected?: boolean | null
          shared_with_email?: string | null
          shared_with_organization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          ai_analysis_status: string | null
          ai_summary: string | null
          checksum: string | null
          created_at: string
          description: string | null
          document_id: string
          file_path: string | null
          file_size: number | null
          id: string
          is_current_version: boolean
          mime_type: string | null
          org_id: string
          status: string | null
          updated_at: string
          uploaded_by: string | null
          uploaded_by_name: string | null
          version_number: number
        }
        Insert: {
          ai_analysis_status?: string | null
          ai_summary?: string | null
          checksum?: string | null
          created_at?: string
          description?: string | null
          document_id: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_current_version?: boolean
          mime_type?: string | null
          org_id: string
          status?: string | null
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          version_number?: number
        }
        Update: {
          ai_analysis_status?: string | null
          ai_summary?: string | null
          checksum?: string | null
          created_at?: string
          description?: string | null
          document_id?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_current_version?: boolean
          mime_type?: string | null
          org_id?: string
          status?: string | null
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          access_count: number | null
          ai_analysis_status: string | null
          ai_confidence_score: number | null
          ai_summary: string | null
          checksum: string | null
          compliance_gaps: Json | null
          created_at: string
          description: string | null
          document_classification: Json | null
          expiry_date: string | null
          extracted_text: string | null
          extraction_status: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_archived: boolean | null
          is_current_version: boolean | null
          key_risk_indicators: Json | null
          last_accessed_at: string | null
          metadata: Json | null
          mime_type: string | null
          org_id: string
          parent_document_id: string | null
          repository_id: string | null
          review_due_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          uploaded_by: string | null
          uploaded_by_name: string | null
          version_number: number | null
        }
        Insert: {
          access_count?: number | null
          ai_analysis_status?: string | null
          ai_confidence_score?: number | null
          ai_summary?: string | null
          checksum?: string | null
          compliance_gaps?: Json | null
          created_at?: string
          description?: string | null
          document_classification?: Json | null
          expiry_date?: string | null
          extracted_text?: string | null
          extraction_status?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_archived?: boolean | null
          is_current_version?: boolean | null
          key_risk_indicators?: Json | null
          last_accessed_at?: string | null
          metadata?: Json | null
          mime_type?: string | null
          org_id: string
          parent_document_id?: string | null
          repository_id?: string | null
          review_due_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          version_number?: number | null
        }
        Update: {
          access_count?: number | null
          ai_analysis_status?: string | null
          ai_confidence_score?: number | null
          ai_summary?: string | null
          checksum?: string | null
          compliance_gaps?: Json | null
          created_at?: string
          description?: string | null
          document_classification?: Json | null
          expiry_date?: string | null
          extracted_text?: string | null
          extraction_status?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_archived?: boolean | null
          is_current_version?: boolean | null
          key_risk_indicators?: Json | null
          last_accessed_at?: string | null
          metadata?: Json | null
          mime_type?: string | null
          org_id?: string
          parent_document_id?: string | null
          repository_id?: string | null
          review_due_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "document_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      emerging_risk_scenarios: {
        Row: {
          ai_generated: boolean
          confidence_score: number | null
          created_at: string
          emergence_indicators: Json
          id: string
          last_reviewed_at: string | null
          monitoring_metrics: Json | null
          org_id: string
          potential_impact_assessment: Json | null
          recommended_responses: Json | null
          review_frequency: string
          risk_category: string
          scenario_description: string
          scenario_name: string
          scenario_parameters: Json
          status: string
          trigger_conditions: Json | null
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          confidence_score?: number | null
          created_at?: string
          emergence_indicators?: Json
          id?: string
          last_reviewed_at?: string | null
          monitoring_metrics?: Json | null
          org_id: string
          potential_impact_assessment?: Json | null
          recommended_responses?: Json | null
          review_frequency?: string
          risk_category: string
          scenario_description: string
          scenario_name: string
          scenario_parameters?: Json
          status?: string
          trigger_conditions?: Json | null
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          confidence_score?: number | null
          created_at?: string
          emergence_indicators?: Json
          id?: string
          last_reviewed_at?: string | null
          monitoring_metrics?: Json | null
          org_id?: string
          potential_impact_assessment?: Json | null
          recommended_responses?: Json | null
          review_frequency?: string
          risk_category?: string
          scenario_description?: string
          scenario_name?: string
          scenario_parameters?: Json
          status?: string
          trigger_conditions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      encrypted_data_fields: {
        Row: {
          created_at: string
          encrypted_value: string
          encryption_key_id: string
          field_name: string
          id: string
          org_id: string
          record_id: string
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          encrypted_value: string
          encryption_key_id: string
          field_name: string
          id?: string
          org_id: string
          record_id: string
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          encrypted_value?: string
          encryption_key_id?: string
          field_name?: string
          id?: string
          org_id?: string
          record_id?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_data_fields_encryption_key_id_fkey"
            columns: ["encryption_key_id"]
            isOneToOne: false
            referencedRelation: "encryption_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          created_at: string
          encrypted_key: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_name: string
          key_purpose: string
          key_version: number
          org_id: string
          rotated_at: string | null
        }
        Insert: {
          created_at?: string
          encrypted_key: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          key_purpose: string
          key_version?: number
          org_id: string
          rotated_at?: string | null
        }
        Update: {
          created_at?: string
          encrypted_key?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          key_purpose?: string
          key_version?: number
          org_id?: string
          rotated_at?: string | null
        }
        Relationships: []
      }
      enhanced_auth_sessions: {
        Row: {
          authentication_factors: Json
          auto_logout_at: string | null
          behavioral_score: number | null
          created_at: string
          device_fingerprint_id: string | null
          id: string
          is_active: boolean
          is_privileged: boolean | null
          last_activity_at: string
          location_data: Json | null
          org_id: string
          privileged_expires_at: string | null
          risk_score: number
          session_token: string
          trust_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          authentication_factors?: Json
          auto_logout_at?: string | null
          behavioral_score?: number | null
          created_at?: string
          device_fingerprint_id?: string | null
          id?: string
          is_active?: boolean
          is_privileged?: boolean | null
          last_activity_at?: string
          location_data?: Json | null
          org_id: string
          privileged_expires_at?: string | null
          risk_score?: number
          session_token: string
          trust_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          authentication_factors?: Json
          auto_logout_at?: string | null
          behavioral_score?: number | null
          created_at?: string
          device_fingerprint_id?: string | null
          id?: string
          is_active?: boolean
          is_privileged?: boolean | null
          last_activity_at?: string
          location_data?: Json | null
          org_id?: string
          privileged_expires_at?: string | null
          risk_score?: number
          session_token?: string
          trust_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_auth_sessions_device_fingerprint_id_fkey"
            columns: ["device_fingerprint_id"]
            isOneToOne: false
            referencedRelation: "device_fingerprints"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          component_name: string | null
          created_at: string
          error_boundary_id: string | null
          error_message: string
          error_stack: string | null
          id: string
          metadata: Json | null
          module_name: string | null
          org_id: string
          resolved: boolean | null
          resolved_at: string | null
          route: string
          session_id: string | null
          severity: string
          timestamp: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_name?: string | null
          created_at?: string
          error_boundary_id?: string | null
          error_message: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          module_name?: string | null
          org_id: string
          resolved?: boolean | null
          resolved_at?: string | null
          route: string
          session_id?: string | null
          severity?: string
          timestamp?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_name?: string | null
          created_at?: string
          error_boundary_id?: string | null
          error_message?: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          module_name?: string | null
          org_id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          route?: string
          session_id?: string | null
          severity?: string
          timestamp?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      external_data_sources: {
        Row: {
          authentication_config: Json
          created_at: string
          data_quality_score: number
          endpoint_url: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          org_id: string
          source_name: string
          source_type: string
          sync_frequency_hours: number
          updated_at: string
        }
        Insert: {
          authentication_config?: Json
          created_at?: string
          data_quality_score?: number
          endpoint_url: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          org_id: string
          source_name: string
          source_type: string
          sync_frequency_hours?: number
          updated_at?: string
        }
        Update: {
          authentication_config?: Json
          created_at?: string
          data_quality_score?: number
          endpoint_url?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          org_id?: string
          source_name?: string
          source_type?: string
          sync_frequency_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      external_stakeholders: {
        Row: {
          access_expires_at: string | null
          access_level: string
          created_at: string
          email: string
          id: string
          invited_by: string | null
          is_active: boolean | null
          last_login_at: string | null
          name: string
          org_id: string
          organization: string
          permitted_modules: string[] | null
          role: string | null
          updated_at: string
        }
        Insert: {
          access_expires_at?: string | null
          access_level?: string
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          org_id: string
          organization: string
          permitted_modules?: string[] | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          access_expires_at?: string | null
          access_level?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          org_id?: string
          organization?: string
          permitted_modules?: string[] | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      failure_scenarios: {
        Row: {
          affected_functions: Json | null
          business_impact_description: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          estimated_duration_hours: number | null
          id: string
          last_simulated_at: string | null
          mitigation_effectiveness: number | null
          org_id: string
          scenario_description: string | null
          scenario_name: string
          scenario_type: string
          severity_level: string
          simulation_results: Json | null
          trigger_dependency_id: string
          updated_at: string
        }
        Insert: {
          affected_functions?: Json | null
          business_impact_description?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          estimated_duration_hours?: number | null
          id?: string
          last_simulated_at?: string | null
          mitigation_effectiveness?: number | null
          org_id: string
          scenario_description?: string | null
          scenario_name: string
          scenario_type?: string
          severity_level?: string
          simulation_results?: Json | null
          trigger_dependency_id: string
          updated_at?: string
        }
        Update: {
          affected_functions?: Json | null
          business_impact_description?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          estimated_duration_hours?: number | null
          id?: string
          last_simulated_at?: string | null
          mitigation_effectiveness?: number | null
          org_id?: string
          scenario_description?: string | null
          scenario_name?: string
          scenario_type?: string
          severity_level?: string
          simulation_results?: Json | null
          trigger_dependency_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "failure_scenarios_trigger_dependency_id_fkey"
            columns: ["trigger_dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasting_inputs: {
        Row: {
          accuracy_score: number | null
          created_at: string | null
          id: string
          input_data: Json
          last_updated_at: string | null
          metric_name: string
          model_type: string
          org_id: string
          time_period: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string | null
          id?: string
          input_data?: Json
          last_updated_at?: string | null
          metric_name: string
          model_type?: string
          org_id: string
          time_period: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string | null
          id?: string
          input_data?: Json
          last_updated_at?: string | null
          metric_name?: string
          model_type?: string
          org_id?: string
          time_period?: string
        }
        Relationships: []
      }
      forensic_evidence: {
        Row: {
          chain_of_custody: Json
          collected_at: string
          collected_by: string
          collection_method: string
          created_at: string
          evidence_data: Json
          evidence_type: string
          id: string
          incident_id: string
          integrity_hash: string
          org_id: string
          preservation_status: string
          updated_at: string
        }
        Insert: {
          chain_of_custody?: Json
          collected_at?: string
          collected_by: string
          collection_method: string
          created_at?: string
          evidence_data?: Json
          evidence_type: string
          id?: string
          incident_id: string
          integrity_hash: string
          org_id: string
          preservation_status?: string
          updated_at?: string
        }
        Update: {
          chain_of_custody?: Json
          collected_at?: string
          collected_by?: string
          collection_method?: string
          created_at?: string
          evidence_data?: Json
          evidence_type?: string
          id?: string
          incident_id?: string
          integrity_hash?: string
          org_id?: string
          preservation_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forensic_evidence_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "security_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_components: {
        Row: {
          component_data: Json
          component_description: string | null
          component_name: string
          component_type: string
          created_at: string
          dependencies: string[] | null
          estimated_effort_hours: number | null
          framework_id: string
          id: string
          implementation_priority: number | null
        }
        Insert: {
          component_data?: Json
          component_description?: string | null
          component_name: string
          component_type: string
          created_at?: string
          dependencies?: string[] | null
          estimated_effort_hours?: number | null
          framework_id: string
          id?: string
          implementation_priority?: number | null
        }
        Update: {
          component_data?: Json
          component_description?: string | null
          component_name?: string
          component_type?: string
          created_at?: string
          dependencies?: string[] | null
          estimated_effort_hours?: number | null
          framework_id?: string
          id?: string
          implementation_priority?: number | null
        }
        Relationships: []
      }
      framework_dependencies: {
        Row: {
          created_at: string
          dependency_description: string | null
          dependency_strength: string
          dependency_type: string
          dependent_framework_id: string
          dependent_framework_type: string
          id: string
          impact_analysis: Json | null
          is_active: boolean
          org_id: string
          source_framework_id: string
          source_framework_type: string
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          dependency_description?: string | null
          dependency_strength?: string
          dependency_type?: string
          dependent_framework_id: string
          dependent_framework_type: string
          id?: string
          impact_analysis?: Json | null
          is_active?: boolean
          org_id: string
          source_framework_id: string
          source_framework_type: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          dependency_description?: string | null
          dependency_strength?: string
          dependency_type?: string
          dependent_framework_id?: string
          dependent_framework_type?: string
          id?: string
          impact_analysis?: Json | null
          is_active?: boolean
          org_id?: string
          source_framework_id?: string
          source_framework_type?: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      framework_effectiveness_metrics: {
        Row: {
          created_at: string
          data_sources: Json | null
          framework_id: string
          framework_type: string
          id: string
          measurement_date: string
          measurement_method: string | null
          metric_category: string
          metric_name: string
          metric_value: number
          notes: string | null
          org_id: string
          quality_score: number | null
          target_value: number | null
          trend_direction: string | null
          variance_percentage: number | null
        }
        Insert: {
          created_at?: string
          data_sources?: Json | null
          framework_id: string
          framework_type: string
          id?: string
          measurement_date?: string
          measurement_method?: string | null
          metric_category: string
          metric_name: string
          metric_value: number
          notes?: string | null
          org_id: string
          quality_score?: number | null
          target_value?: number | null
          trend_direction?: string | null
          variance_percentage?: number | null
        }
        Update: {
          created_at?: string
          data_sources?: Json | null
          framework_id?: string
          framework_type?: string
          id?: string
          measurement_date?: string
          measurement_method?: string | null
          metric_category?: string
          metric_name?: string
          metric_value?: number
          notes?: string | null
          org_id?: string
          quality_score?: number | null
          target_value?: number | null
          trend_direction?: string | null
          variance_percentage?: number | null
        }
        Relationships: []
      }
      framework_generation_rules: {
        Row: {
          created_at: string
          framework_type: string
          id: string
          is_active: boolean | null
          org_criteria: Json
          priority: number | null
          rule_definition: Json
          rule_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          framework_type: string
          id?: string
          is_active?: boolean | null
          org_criteria?: Json
          priority?: number | null
          rule_definition?: Json
          rule_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          framework_type?: string
          id?: string
          is_active?: boolean | null
          org_criteria?: Json
          priority?: number | null
          rule_definition?: Json
          rule_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      framework_generation_status: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: string | null
          error_details: string | null
          id: string
          organization_id: string
          profile_id: string
          progress: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          error_details?: string | null
          id?: string
          organization_id: string
          profile_id: string
          progress?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          error_details?: string | null
          id?: string
          organization_id?: string
          profile_id?: string
          progress?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      framework_versions: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          approved_by_name: string | null
          change_summary: Json | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          deployed_at: string | null
          deployment_status: string
          framework_data: Json
          framework_id: string
          framework_type: string
          id: string
          is_current_version: boolean
          org_id: string
          rollback_data: Json | null
          updated_at: string
          version_description: string | null
          version_number: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          change_summary?: Json | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          deployed_at?: string | null
          deployment_status?: string
          framework_data?: Json
          framework_id: string
          framework_type: string
          id?: string
          is_current_version?: boolean
          org_id: string
          rollback_data?: Json | null
          updated_at?: string
          version_description?: string | null
          version_number: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          change_summary?: Json | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          deployed_at?: string | null
          deployment_status?: string
          framework_data?: Json
          framework_id?: string
          framework_type?: string
          id?: string
          is_current_version?: boolean
          org_id?: string
          rollback_data?: Json | null
          updated_at?: string
          version_description?: string | null
          version_number?: string
        }
        Relationships: []
      }
      generated_frameworks: {
        Row: {
          created_at: string
          customizations: Json
          effectiveness_score: number | null
          framework_data: Json
          id: string
          implementation_status: string | null
          last_updated_at: string | null
          organization_id: string
          profile_id: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customizations?: Json
          effectiveness_score?: number | null
          framework_data?: Json
          id?: string
          implementation_status?: string | null
          last_updated_at?: string | null
          organization_id: string
          profile_id: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customizations?: Json
          effectiveness_score?: number | null
          framework_data?: Json
          id?: string
          implementation_status?: string | null
          last_updated_at?: string | null
          organization_id?: string
          profile_id?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_frameworks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_frameworks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "organizational_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_frameworks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "risk_framework_templates"
            referencedColumns: ["id"]
          },
        ]
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
          approved_at: string | null
          assigned_reviewer_id: string | null
          assigned_reviewer_name: string | null
          created_at: string
          description: string | null
          file_path: string | null
          file_type: string | null
          framework_id: string | null
          id: string
          rejected_at: string | null
          review_due_date: string | null
          status: string
          submitted_for_review_at: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          assigned_reviewer_id?: string | null
          assigned_reviewer_name?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_type?: string | null
          framework_id?: string | null
          id?: string
          rejected_at?: string | null
          review_due_date?: string | null
          status?: string
          submitted_for_review_at?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          assigned_reviewer_id?: string | null
          assigned_reviewer_name?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_type?: string | null
          framework_id?: string | null
          id?: string
          rejected_at?: string | null
          review_due_date?: string | null
          status?: string
          submitted_for_review_at?: string | null
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
      implementation_feedback: {
        Row: {
          created_at: string
          feedback_category: string
          feedback_content: string
          feedback_rating: number | null
          feedback_type: string
          follow_up_notes: string | null
          follow_up_required: boolean
          framework_id: string
          framework_type: string
          id: string
          implementation_date: string | null
          implementation_phase: string | null
          improvement_suggestions: Json | null
          lessons_learned: Json | null
          org_id: string
          status: string
          submitted_by: string | null
          submitted_by_name: string | null
          updated_at: string
          user_role: string | null
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string
          feedback_category?: string
          feedback_content: string
          feedback_rating?: number | null
          feedback_type: string
          follow_up_notes?: string | null
          follow_up_required?: boolean
          framework_id: string
          framework_type: string
          id?: string
          implementation_date?: string | null
          implementation_phase?: string | null
          improvement_suggestions?: Json | null
          lessons_learned?: Json | null
          org_id: string
          status?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
          updated_at?: string
          user_role?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string
          feedback_category?: string
          feedback_content?: string
          feedback_rating?: number | null
          feedback_type?: string
          follow_up_notes?: string | null
          follow_up_required?: boolean
          framework_id?: string
          framework_type?: string
          id?: string
          implementation_date?: string | null
          implementation_phase?: string | null
          improvement_suggestions?: Json | null
          lessons_learned?: Json | null
          org_id?: string
          status?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
          updated_at?: string
          user_role?: string | null
          would_recommend?: boolean | null
        }
        Relationships: []
      }
      incident_escalations: {
        Row: {
          acknowledged_at: string | null
          created_at: string
          escalated_from_name: string | null
          escalated_from_user: string | null
          escalated_to_name: string | null
          escalated_to_user: string | null
          escalation_level: number
          escalation_reason: string
          escalation_type: string
          id: string
          incident_id: string
          resolved_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string
          escalated_from_name?: string | null
          escalated_from_user?: string | null
          escalated_to_name?: string | null
          escalated_to_user?: string | null
          escalation_level: number
          escalation_reason: string
          escalation_type?: string
          id?: string
          incident_id: string
          resolved_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string
          escalated_from_name?: string | null
          escalated_from_user?: string | null
          escalated_to_name?: string | null
          escalated_to_user?: string | null
          escalation_level?: number
          escalation_reason?: string
          escalation_type?: string
          id?: string
          incident_id?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_escalations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incident_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_logs: {
        Row: {
          assigned_level: string | null
          assigned_to: string | null
          business_function_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          escalated_at: string | null
          escalation_level: number | null
          first_response_at: string | null
          id: string
          impact_rating: number | null
          max_resolution_time_hours: number | null
          max_response_time_hours: number | null
          org_id: string
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_level?: string | null
          assigned_to?: string | null
          business_function_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          first_response_at?: string | null
          id?: string
          impact_rating?: number | null
          max_resolution_time_hours?: number | null
          max_response_time_hours?: number | null
          org_id: string
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_level?: string | null
          assigned_to?: string | null
          business_function_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          first_response_at?: string | null
          id?: string
          impact_rating?: number | null
          max_resolution_time_hours?: number | null
          max_response_time_hours?: number | null
          org_id?: string
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
      incident_playbooks: {
        Row: {
          communication_templates: Json
          created_at: string
          created_by: string | null
          escalation_matrix: Json
          id: string
          incident_type: string
          is_active: boolean
          org_id: string
          playbook_name: string
          response_steps: Json
          severity_levels: Json
          updated_at: string
        }
        Insert: {
          communication_templates?: Json
          created_at?: string
          created_by?: string | null
          escalation_matrix?: Json
          id?: string
          incident_type: string
          is_active?: boolean
          org_id: string
          playbook_name: string
          response_steps?: Json
          severity_levels?: Json
          updated_at?: string
        }
        Update: {
          communication_templates?: Json
          created_at?: string
          created_by?: string | null
          escalation_matrix?: Json
          id?: string
          incident_type?: string
          is_active?: boolean
          org_id?: string
          playbook_name?: string
          response_steps?: Json
          severity_levels?: Json
          updated_at?: string
        }
        Relationships: []
      }
      incident_responses: {
        Row: {
          alert_sent_to: string | null
          created_at: string
          id: string
          incident_id: string
          new_assignee: string | null
          new_status: string | null
          previous_assignee: string | null
          previous_status: string | null
          response_by: string | null
          response_by_name: string | null
          response_content: string
          response_type: string
          updated_at: string
        }
        Insert: {
          alert_sent_to?: string | null
          created_at?: string
          id?: string
          incident_id: string
          new_assignee?: string | null
          new_status?: string | null
          previous_assignee?: string | null
          previous_status?: string | null
          response_by?: string | null
          response_by_name?: string | null
          response_content: string
          response_type: string
          updated_at?: string
        }
        Update: {
          alert_sent_to?: string | null
          created_at?: string
          id?: string
          incident_id?: string
          new_assignee?: string | null
          new_status?: string | null
          previous_assignee?: string | null
          previous_status?: string | null
          response_by?: string | null
          response_by_name?: string | null
          response_content?: string
          response_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_responses_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incident_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_scenarios: {
        Row: {
          created_at: string
          expected_outcomes: Json | null
          frequency: string
          id: string
          is_active: boolean
          last_executed_at: string | null
          next_execution_date: string | null
          org_id: string
          regulatory_basis: string | null
          scenario_description: string
          scenario_name: string
          scenario_parameters: Json
          scenario_type: string
          sector: string
          severity_level: string
          success_criteria: Json | null
          testing_procedures: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_outcomes?: Json | null
          frequency?: string
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          next_execution_date?: string | null
          org_id: string
          regulatory_basis?: string | null
          scenario_description: string
          scenario_name: string
          scenario_parameters?: Json
          scenario_type?: string
          sector: string
          severity_level?: string
          success_criteria?: Json | null
          testing_procedures?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_outcomes?: Json | null
          frequency?: string
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          next_execution_date?: string | null
          org_id?: string
          regulatory_basis?: string | null
          scenario_description?: string
          scenario_name?: string
          scenario_parameters?: Json
          scenario_type?: string
          sector?: string
          severity_level?: string
          success_criteria?: Json | null
          testing_procedures?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      industry_template_libraries: {
        Row: {
          complexity_level: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          customization_rules: Json | null
          effectiveness_score: number | null
          id: string
          implementation_steps: Json | null
          industry_sector: string
          is_active: boolean
          is_featured: boolean | null
          last_updated_date: string | null
          org_id: string
          regulatory_basis: string[] | null
          sub_sector: string | null
          success_metrics: Json | null
          template_data: Json
          template_description: string | null
          template_name: string
          template_type: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          complexity_level?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          customization_rules?: Json | null
          effectiveness_score?: number | null
          id?: string
          implementation_steps?: Json | null
          industry_sector: string
          is_active?: boolean
          is_featured?: boolean | null
          last_updated_date?: string | null
          org_id: string
          regulatory_basis?: string[] | null
          sub_sector?: string | null
          success_metrics?: Json | null
          template_data?: Json
          template_description?: string | null
          template_name: string
          template_type?: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          complexity_level?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          customization_rules?: Json | null
          effectiveness_score?: number | null
          id?: string
          implementation_steps?: Json | null
          industry_sector?: string
          is_active?: boolean
          is_featured?: boolean | null
          last_updated_date?: string | null
          org_id?: string
          regulatory_basis?: string[] | null
          sub_sector?: string | null
          success_metrics?: Json | null
          template_data?: Json
          template_description?: string | null
          template_name?: string
          template_type?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_data: Json | null
          event_type: string
          id: string
          integration_id: string | null
          org_id: string
          response_time_ms: number | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          integration_id?: string | null
          org_id: string
          response_time_ms?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          integration_id?: string | null
          org_id?: string
          response_time_ms?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          configuration: Json
          created_at: string
          created_by: string | null
          created_by_name: string | null
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean
          last_sync_at: string | null
          org_id: string
          provider: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean
          last_sync_at?: string | null
          org_id: string
          provider: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean
          last_sync_at?: string | null
          org_id?: string
          provider?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      knowledge_articles: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string
          content: string
          created_at: string
          id: string
          org_id: string
          rating: number | null
          rating_count: number | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category: string
          content: string
          created_at?: string
          id?: string
          org_id: string
          rating?: number | null
          rating_count?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          org_id?: string
          rating?: number | null
          rating_count?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          embedding: string | null
          id: string
          org_id: string
          search_vector: unknown | null
          tags: string[] | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          org_id: string
          search_vector?: unknown | null
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          org_id?: string
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      knowledge_base_articles: {
        Row: {
          article_title: string
          article_type: string
          attachments: Json | null
          content_body: string
          content_format: string | null
          content_freshness_score: number | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          external_references: Json | null
          helpful_votes: number | null
          id: string
          industry_relevance: string[] | null
          keywords: string[] | null
          last_reviewed_date: string | null
          publication_status: string | null
          published_at: string | null
          related_regulations: string[] | null
          related_templates: string[] | null
          reviewed_by: string | null
          reviewed_by_name: string | null
          search_vector: unknown | null
          summary: string | null
          target_roles: string[] | null
          unhelpful_votes: number | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          article_title: string
          article_type?: string
          attachments?: Json | null
          content_body: string
          content_format?: string | null
          content_freshness_score?: number | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          external_references?: Json | null
          helpful_votes?: number | null
          id?: string
          industry_relevance?: string[] | null
          keywords?: string[] | null
          last_reviewed_date?: string | null
          publication_status?: string | null
          published_at?: string | null
          related_regulations?: string[] | null
          related_templates?: string[] | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          search_vector?: unknown | null
          summary?: string | null
          target_roles?: string[] | null
          unhelpful_votes?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          article_title?: string
          article_type?: string
          attachments?: Json | null
          content_body?: string
          content_format?: string | null
          content_freshness_score?: number | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          external_references?: Json | null
          helpful_votes?: number | null
          id?: string
          industry_relevance?: string[] | null
          keywords?: string[] | null
          last_reviewed_date?: string | null
          publication_status?: string | null
          published_at?: string | null
          related_regulations?: string[] | null
          related_templates?: string[] | null
          reviewed_by?: string | null
          reviewed_by_name?: string | null
          search_vector?: unknown | null
          summary?: string | null
          target_roles?: string[] | null
          unhelpful_votes?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      kri_appetite_variance: {
        Row: {
          actual_value: number
          appetite_threshold: number | null
          created_at: string
          id: string
          kri_id: string
          measurement_date: string
          updated_at: string
          variance_percentage: number | null
          variance_status: string
        }
        Insert: {
          actual_value: number
          appetite_threshold?: number | null
          created_at?: string
          id?: string
          kri_id: string
          measurement_date: string
          updated_at?: string
          variance_percentage?: number | null
          variance_status: string
        }
        Update: {
          actual_value?: number
          appetite_threshold?: number | null
          created_at?: string
          id?: string
          kri_id?: string
          measurement_date?: string
          updated_at?: string
          variance_percentage?: number | null
          variance_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "kri_appetite_variance_kri_id_fkey"
            columns: ["kri_id"]
            isOneToOne: false
            referencedRelation: "kri_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      kri_definitions: {
        Row: {
          control_id: string | null
          created_at: string
          critical_threshold: string | null
          description: string | null
          id: string
          measurement_frequency: string | null
          name: string
          org_id: string
          risk_appetite_statement_id: string | null
          status: string
          target_value: string | null
          threshold_id: string
          updated_at: string
          warning_threshold: string | null
        }
        Insert: {
          control_id?: string | null
          created_at?: string
          critical_threshold?: string | null
          description?: string | null
          id?: string
          measurement_frequency?: string | null
          name: string
          org_id?: string
          risk_appetite_statement_id?: string | null
          status?: string
          target_value?: string | null
          threshold_id: string
          updated_at?: string
          warning_threshold?: string | null
        }
        Update: {
          control_id?: string | null
          created_at?: string
          critical_threshold?: string | null
          description?: string | null
          id?: string
          measurement_frequency?: string | null
          name?: string
          org_id?: string
          risk_appetite_statement_id?: string | null
          status?: string
          target_value?: string | null
          threshold_id?: string
          updated_at?: string
          warning_threshold?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kri_definitions_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kri_definitions_risk_appetite_statement_id_fkey"
            columns: ["risk_appetite_statement_id"]
            isOneToOne: false
            referencedRelation: "risk_appetite_statements"
            referencedColumns: ["id"]
          },
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
      mfa_backup_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mfa_verification_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          attempt_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          attempt_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      microservices: {
        Row: {
          circuit_breaker_config: Json
          created_at: string
          created_by: string | null
          endpoints: Json
          environment: string
          health_check_url: string
          id: string
          instances: Json
          last_health_check: string | null
          org_id: string
          region: string
          scaling_config: Json
          service_name: string
          service_version: string
          status: string
          updated_at: string
        }
        Insert: {
          circuit_breaker_config?: Json
          created_at?: string
          created_by?: string | null
          endpoints?: Json
          environment?: string
          health_check_url: string
          id?: string
          instances?: Json
          last_health_check?: string | null
          org_id: string
          region?: string
          scaling_config?: Json
          service_name: string
          service_version?: string
          status?: string
          updated_at?: string
        }
        Update: {
          circuit_breaker_config?: Json
          created_at?: string
          created_by?: string | null
          endpoints?: Json
          environment?: string
          health_check_url?: string
          id?: string
          instances?: Json
          last_health_check?: string | null
          org_id?: string
          region?: string
          scaling_config?: Json
          service_name?: string
          service_version?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string
          id: string
          recipient: string
          sent_at: string
          status: string
          subject: string
          type: string
          urgency: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient: string
          sent_at?: string
          status?: string
          subject: string
          type: string
          urgency: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient?: string
          sent_at?: string
          status?: string
          subject?: string
          type?: string
          urgency?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channels: string[]
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          org_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          title: string
          urgency: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          org_id: string
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          title: string
          urgency?: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          org_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          title?: string
          urgency?: string
        }
        Relationships: []
      }
      offline_sync_queue: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          last_retry_at: string | null
          org_id: string
          retry_count: number | null
          sync_status: string
          synced_at: string | null
          user_id: string
        }
        Insert: {
          action_data?: Json
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          last_retry_at?: string | null
          org_id: string
          retry_count?: number | null
          sync_status?: string
          synced_at?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          last_retry_at?: string | null
          org_id?: string
          retry_count?: number | null
          sync_status?: string
          synced_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_sessions: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          current_step: string | null
          data: Json | null
          id: string
          session_end: string | null
          session_start: string | null
          status: string | null
          total_steps: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          current_step?: string | null
          data?: Json | null
          id?: string
          session_end?: string | null
          session_start?: string | null
          status?: string | null
          total_steps?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          current_step?: string | null
          data?: Json | null
          id?: string
          session_end?: string | null
          session_start?: string | null
          status?: string | null
          total_steps?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_policies: {
        Row: {
          created_at: string | null
          file_path: string | null
          file_type: string | null
          id: string
          name: string
          organization_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          name: string
          organization_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          name?: string
          organization_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizational_profiles: {
        Row: {
          applicable_frameworks: string[] | null
          asset_size: number | null
          auto_generate_frameworks: boolean | null
          banking_license_type: string | null
          banking_schedule: string | null
          business_lines: string[] | null
          capital_tier: string | null
          competitive_strategy: string | null
          completeness_percentage: number | null
          compliance_maturity: string | null
          created_at: string
          customer_base: string | null
          deposit_insurance_coverage: boolean | null
          digital_strategy: string | null
          digital_transformation: string | null
          employee_count: number | null
          framework_preferences: Json | null
          geographic_locations: number | null
          geographic_scope: string | null
          growth_strategy: string | null
          id: string
          implementation_readiness: string | null
          international_exposure: boolean | null
          last_assessment_date: string | null
          market_position: string | null
          next_assessment_date: string | null
          organization_id: string
          osfi_rating: string | null
          preferred_framework_types: string[] | null
          previous_incidents: number | null
          primary_regulators: string[] | null
          profile_score: number | null
          regulatory_history: string | null
          risk_culture: string | null
          risk_maturity: string | null
          sub_sector: string | null
          technology_maturity: string | null
          third_party_dependencies: number | null
          upcoming_regulations: string[] | null
          updated_at: string
        }
        Insert: {
          applicable_frameworks?: string[] | null
          asset_size?: number | null
          auto_generate_frameworks?: boolean | null
          banking_license_type?: string | null
          banking_schedule?: string | null
          business_lines?: string[] | null
          capital_tier?: string | null
          competitive_strategy?: string | null
          completeness_percentage?: number | null
          compliance_maturity?: string | null
          created_at?: string
          customer_base?: string | null
          deposit_insurance_coverage?: boolean | null
          digital_strategy?: string | null
          digital_transformation?: string | null
          employee_count?: number | null
          framework_preferences?: Json | null
          geographic_locations?: number | null
          geographic_scope?: string | null
          growth_strategy?: string | null
          id?: string
          implementation_readiness?: string | null
          international_exposure?: boolean | null
          last_assessment_date?: string | null
          market_position?: string | null
          next_assessment_date?: string | null
          organization_id: string
          osfi_rating?: string | null
          preferred_framework_types?: string[] | null
          previous_incidents?: number | null
          primary_regulators?: string[] | null
          profile_score?: number | null
          regulatory_history?: string | null
          risk_culture?: string | null
          risk_maturity?: string | null
          sub_sector?: string | null
          technology_maturity?: string | null
          third_party_dependencies?: number | null
          upcoming_regulations?: string[] | null
          updated_at?: string
        }
        Update: {
          applicable_frameworks?: string[] | null
          asset_size?: number | null
          auto_generate_frameworks?: boolean | null
          banking_license_type?: string | null
          banking_schedule?: string | null
          business_lines?: string[] | null
          capital_tier?: string | null
          competitive_strategy?: string | null
          completeness_percentage?: number | null
          compliance_maturity?: string | null
          created_at?: string
          customer_base?: string | null
          deposit_insurance_coverage?: boolean | null
          digital_strategy?: string | null
          digital_transformation?: string | null
          employee_count?: number | null
          framework_preferences?: Json | null
          geographic_locations?: number | null
          geographic_scope?: string | null
          growth_strategy?: string | null
          id?: string
          implementation_readiness?: string | null
          international_exposure?: boolean | null
          last_assessment_date?: string | null
          market_position?: string | null
          next_assessment_date?: string | null
          organization_id?: string
          osfi_rating?: string | null
          preferred_framework_types?: string[] | null
          previous_incidents?: number | null
          primary_regulators?: string[] | null
          profile_score?: number | null
          regulatory_history?: string | null
          risk_culture?: string | null
          risk_maturity?: string | null
          sub_sector?: string | null
          technology_maturity?: string | null
          third_party_dependencies?: number | null
          upcoming_regulations?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organizational_profiles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizational_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          asset_size: number | null
          capital_tier: string | null
          created_at: string | null
          employee_count: number | null
          geographic_scope: string | null
          id: string
          name: string
          onboarding_completed_at: string | null
          onboarding_status: string | null
          org_type: string | null
          regulatory_classification: string[] | null
          regulatory_guidelines: string[] | null
          sector: string | null
          size: string | null
          sub_sector: string | null
          updated_at: string | null
        }
        Insert: {
          asset_size?: number | null
          capital_tier?: string | null
          created_at?: string | null
          employee_count?: number | null
          geographic_scope?: string | null
          id?: string
          name: string
          onboarding_completed_at?: string | null
          onboarding_status?: string | null
          org_type?: string | null
          regulatory_classification?: string[] | null
          regulatory_guidelines?: string[] | null
          sector?: string | null
          size?: string | null
          sub_sector?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_size?: number | null
          capital_tier?: string | null
          created_at?: string | null
          employee_count?: number | null
          geographic_scope?: string | null
          id?: string
          name?: string
          onboarding_completed_at?: string | null
          onboarding_status?: string | null
          org_type?: string | null
          regulatory_classification?: string[] | null
          regulatory_guidelines?: string[] | null
          sector?: string | null
          size?: string | null
          sub_sector?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      osfi_e21_scenarios: {
        Row: {
          action_items: Json | null
          compliance_level: string
          compliance_status: string
          created_at: string
          execution_frequency: string
          execution_results: Json | null
          id: string
          is_active: boolean
          last_execution_date: string | null
          next_due_date: string | null
          org_id: string
          osfi_category: string
          regulatory_feedback: string | null
          reporting_requirements: Json | null
          scenario_code: string
          scenario_description: string
          scenario_name: string
          testing_requirements: Json
          updated_at: string
        }
        Insert: {
          action_items?: Json | null
          compliance_level?: string
          compliance_status?: string
          created_at?: string
          execution_frequency?: string
          execution_results?: Json | null
          id?: string
          is_active?: boolean
          last_execution_date?: string | null
          next_due_date?: string | null
          org_id: string
          osfi_category: string
          regulatory_feedback?: string | null
          reporting_requirements?: Json | null
          scenario_code: string
          scenario_description: string
          scenario_name: string
          testing_requirements?: Json
          updated_at?: string
        }
        Update: {
          action_items?: Json | null
          compliance_level?: string
          compliance_status?: string
          created_at?: string
          execution_frequency?: string
          execution_results?: Json | null
          id?: string
          is_active?: boolean
          last_execution_date?: string | null
          next_due_date?: string | null
          org_id?: string
          osfi_category?: string
          regulatory_feedback?: string | null
          reporting_requirements?: Json | null
          scenario_code?: string
          scenario_description?: string
          scenario_name?: string
          testing_requirements?: Json
          updated_at?: string
        }
        Relationships: []
      }
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      password_policies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          lockout_duration_minutes: number
          max_failed_attempts: number
          min_length: number
          org_id: string
          password_expiry_days: number
          policy_name: string
          prevent_password_reuse: number
          require_lowercase: boolean
          require_numbers: boolean
          require_symbols: boolean
          require_uppercase: boolean
          updated_at: string
          warning_days_before_expiry: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          lockout_duration_minutes?: number
          max_failed_attempts?: number
          min_length?: number
          org_id: string
          password_expiry_days?: number
          policy_name: string
          prevent_password_reuse?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_symbols?: boolean
          require_uppercase?: boolean
          updated_at?: string
          warning_days_before_expiry?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          lockout_duration_minutes?: number
          max_failed_attempts?: number
          min_length?: number
          org_id?: string
          password_expiry_days?: number
          policy_name?: string
          prevent_password_reuse?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_symbols?: boolean
          require_uppercase?: boolean
          updated_at?: string
          warning_days_before_expiry?: number
        }
        Relationships: []
      }
      performance_analytics: {
        Row: {
          additional_metadata: Json | null
          created_at: string
          id: string
          measurement_timestamp: string
          metric_category: string
          metric_type: string
          metric_unit: string | null
          metric_value: number
          org_id: string
        }
        Insert: {
          additional_metadata?: Json | null
          created_at?: string
          id?: string
          measurement_timestamp?: string
          metric_category: string
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          org_id: string
        }
        Update: {
          additional_metadata?: Json | null
          created_at?: string
          id?: string
          measurement_timestamp?: string
          metric_category?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          org_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          cache_hit_rate: number
          cpu_usage: number
          created_at: string
          custom_metrics: Json
          database_connections: number
          disk_usage: number
          error_rate: number
          id: string
          memory_usage: number
          metric_timestamp: string
          network_latency_ms: number
          org_id: string
          queue_depth: number
          region: string
          response_time_ms: number
          service_name: string
          system_metrics: Json
          throughput_rps: number
          user_experience_metrics: Json
        }
        Insert: {
          cache_hit_rate?: number
          cpu_usage?: number
          created_at?: string
          custom_metrics?: Json
          database_connections?: number
          disk_usage?: number
          error_rate?: number
          id?: string
          memory_usage?: number
          metric_timestamp?: string
          network_latency_ms?: number
          org_id: string
          queue_depth?: number
          region?: string
          response_time_ms?: number
          service_name: string
          system_metrics?: Json
          throughput_rps?: number
          user_experience_metrics?: Json
        }
        Update: {
          cache_hit_rate?: number
          cpu_usage?: number
          created_at?: string
          custom_metrics?: Json
          database_connections?: number
          disk_usage?: number
          error_rate?: number
          id?: string
          memory_usage?: number
          metric_timestamp?: string
          network_latency_ms?: number
          org_id?: string
          queue_depth?: number
          region?: string
          response_time_ms?: number
          service_name?: string
          system_metrics?: Json
          throughput_rps?: number
          user_experience_metrics?: Json
        }
        Relationships: []
      }
      predictive_models: {
        Row: {
          created_at: string
          created_by: string | null
          feature_variables: Json
          id: string
          last_trained_at: string | null
          model_accuracy: number | null
          model_name: string
          model_parameters: Json
          model_status: string
          model_type: string
          org_id: string
          target_variable: string
          training_data_period: unknown | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          feature_variables?: Json
          id?: string
          last_trained_at?: string | null
          model_accuracy?: number | null
          model_name: string
          model_parameters?: Json
          model_status?: string
          model_type: string
          org_id: string
          target_variable: string
          training_data_period?: unknown | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          feature_variables?: Json
          id?: string
          last_trained_at?: string | null
          model_accuracy?: number | null
          model_name?: string
          model_parameters?: Json
          model_status?: string
          model_type?: string
          org_id?: string
          target_variable?: string
          training_data_period?: unknown | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed_at: string | null
          onboarding_data: Json | null
          onboarding_status: string | null
          organization_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          onboarding_completed_at?: string | null
          onboarding_data?: Json | null
          onboarding_status?: string | null
          organization_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_data?: Json | null
          onboarding_status?: string | null
          organization_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      propagation_chains: {
        Row: {
          business_function_id: string | null
          business_impact_description: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          failure_probability: number
          id: string
          impact_multiplier: number
          last_simulated: string | null
          mitigation_actions: string | null
          org_id: string
          propagation_delay_minutes: number
          propagation_type: string
          simulation_results: Json | null
          source_dependency_id: string
          target_dependency_id: string
          updated_at: string
        }
        Insert: {
          business_function_id?: string | null
          business_impact_description?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          failure_probability?: number
          id?: string
          impact_multiplier?: number
          last_simulated?: string | null
          mitigation_actions?: string | null
          org_id: string
          propagation_delay_minutes?: number
          propagation_type?: string
          simulation_results?: Json | null
          source_dependency_id: string
          target_dependency_id: string
          updated_at?: string
        }
        Update: {
          business_function_id?: string | null
          business_impact_description?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          failure_probability?: number
          id?: string
          impact_multiplier?: number
          last_simulated?: string | null
          mitigation_actions?: string | null
          org_id?: string
          propagation_delay_minutes?: number
          propagation_type?: string
          simulation_results?: Json | null
          source_dependency_id?: string
          target_dependency_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "propagation_chains_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propagation_chains_source_dependency_id_fkey"
            columns: ["source_dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propagation_chains_target_dependency_id_fkey"
            columns: ["target_dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          is_active: boolean | null
          notification_preferences: Json | null
          org_id: string
          subscription_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          notification_preferences?: Json | null
          org_id: string
          subscription_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          notification_preferences?: Json | null
          org_id?: string
          subscription_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          current_section: string | null
          id: string
          organization_id: string
          responses: Json
          started_at: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_section?: string | null
          id?: string
          organization_id: string
          responses?: Json
          started_at?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          current_section?: string | null
          id?: string
          organization_id?: string
          responses?: Json
          started_at?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_responses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_templates: {
        Row: {
          branching_logic: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          questions: Json
          target_sector: string | null
          target_size: string | null
          updated_at: string
          version: string
        }
        Insert: {
          branching_logic?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          questions?: Json
          target_sector?: string | null
          target_size?: string | null
          updated_at?: string
          version?: string
        }
        Update: {
          branching_logic?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          questions?: Json
          target_sector?: string | null
          target_size?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      recovery_contacts: {
        Row: {
          availability: string | null
          contact_name: string
          contact_role: string
          contact_type: string
          contact_verified_date: string | null
          continuity_plan_id: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          department: string | null
          email: string | null
          escalation_order: number | null
          id: string
          last_contacted_date: string | null
          notes: string | null
          org_id: string
          organization: string | null
          primary_phone: string | null
          secondary_phone: string | null
          updated_at: string
        }
        Insert: {
          availability?: string | null
          contact_name: string
          contact_role: string
          contact_type: string
          contact_verified_date?: string | null
          continuity_plan_id: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          department?: string | null
          email?: string | null
          escalation_order?: number | null
          id?: string
          last_contacted_date?: string | null
          notes?: string | null
          org_id: string
          organization?: string | null
          primary_phone?: string | null
          secondary_phone?: string | null
          updated_at?: string
        }
        Update: {
          availability?: string | null
          contact_name?: string
          contact_role?: string
          contact_type?: string
          contact_verified_date?: string | null
          continuity_plan_id?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          department?: string | null
          email?: string | null
          escalation_order?: number | null
          id?: string
          last_contacted_date?: string | null
          notes?: string | null
          org_id?: string
          organization?: string | null
          primary_phone?: string | null
          secondary_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recovery_contacts_plan"
            columns: ["continuity_plan_id"]
            isOneToOne: false
            referencedRelation: "continuity_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_calendar: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string
          filing_frequency: string
          id: string
          org_id: string
          regulation_name: string
          regulatory_body: string
          reminder_days_before: number | null
          report_type: string
          status: string
          submitted_by: string | null
          submitted_by_name: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date: string
          filing_frequency: string
          id?: string
          org_id: string
          regulation_name: string
          regulatory_body: string
          reminder_days_before?: number | null
          report_type: string
          status?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string
          filing_frequency?: string
          id?: string
          org_id?: string
          regulation_name?: string
          regulatory_body?: string
          reminder_days_before?: number | null
          report_type?: string
          status?: string
          submitted_by?: string | null
          submitted_by_name?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      regulatory_changes: {
        Row: {
          action_required: boolean
          assigned_to: string | null
          assigned_to_name: string | null
          change_description: string
          change_type: string
          created_at: string
          detected_at: string
          effective_date: string | null
          id: string
          impact_assessment: string | null
          implementation_deadline: string | null
          notes: string | null
          org_id: string
          regulatory_intelligence_id: string | null
          review_status: string
          updated_at: string
        }
        Insert: {
          action_required?: boolean
          assigned_to?: string | null
          assigned_to_name?: string | null
          change_description: string
          change_type: string
          created_at?: string
          detected_at?: string
          effective_date?: string | null
          id?: string
          impact_assessment?: string | null
          implementation_deadline?: string | null
          notes?: string | null
          org_id: string
          regulatory_intelligence_id?: string | null
          review_status?: string
          updated_at?: string
        }
        Update: {
          action_required?: boolean
          assigned_to?: string | null
          assigned_to_name?: string | null
          change_description?: string
          change_type?: string
          created_at?: string
          detected_at?: string
          effective_date?: string | null
          id?: string
          impact_assessment?: string | null
          implementation_deadline?: string | null
          notes?: string | null
          org_id?: string
          regulatory_intelligence_id?: string | null
          review_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_changes_regulatory_intelligence_id_fkey"
            columns: ["regulatory_intelligence_id"]
            isOneToOne: false
            referencedRelation: "regulatory_intelligence"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_intelligence: {
        Row: {
          applicable_sectors: string[]
          auto_identified: boolean
          confidence_score: number | null
          created_at: string
          description: string | null
          effective_date: string | null
          id: string
          is_active: boolean
          jurisdiction: string
          key_requirements: Json | null
          last_updated: string
          monitoring_rules: Json | null
          org_id: string
          regulation_name: string
          regulation_type: string
          regulatory_body: string | null
          updated_at: string
        }
        Insert: {
          applicable_sectors?: string[]
          auto_identified?: boolean
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean
          jurisdiction: string
          key_requirements?: Json | null
          last_updated?: string
          monitoring_rules?: Json | null
          org_id: string
          regulation_name: string
          regulation_type?: string
          regulatory_body?: string | null
          updated_at?: string
        }
        Update: {
          applicable_sectors?: string[]
          auto_identified?: boolean
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean
          jurisdiction?: string
          key_requirements?: Json | null
          last_updated?: string
          monitoring_rules?: Json | null
          org_id?: string
          regulation_name?: string
          regulation_type?: string
          regulatory_body?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regulatory_mapping: {
        Row: {
          audit_upload_id: string | null
          compliance_status: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          finding_id: string | null
          gap_severity: string
          id: string
          last_assessment_date: string | null
          next_review_date: string | null
          org_id: string
          regulatory_framework: string
          remediation_priority: string
          requirement_description: string | null
          requirement_section: string
          requirement_title: string
          responsible_party: string | null
          target_completion_date: string | null
          updated_at: string
          validation_evidence: string | null
        }
        Insert: {
          audit_upload_id?: string | null
          compliance_status?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          finding_id?: string | null
          gap_severity?: string
          id?: string
          last_assessment_date?: string | null
          next_review_date?: string | null
          org_id: string
          regulatory_framework: string
          remediation_priority?: string
          requirement_description?: string | null
          requirement_section: string
          requirement_title: string
          responsible_party?: string | null
          target_completion_date?: string | null
          updated_at?: string
          validation_evidence?: string | null
        }
        Update: {
          audit_upload_id?: string | null
          compliance_status?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          finding_id?: string | null
          gap_severity?: string
          id?: string
          last_assessment_date?: string | null
          next_review_date?: string | null
          org_id?: string
          regulatory_framework?: string
          remediation_priority?: string
          requirement_description?: string | null
          requirement_section?: string
          requirement_title?: string
          responsible_party?: string | null
          target_completion_date?: string | null
          updated_at?: string
          validation_evidence?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_regulatory_mapping_finding"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "compliance_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_regulatory_mapping_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_regulatory_mapping_upload"
            columns: ["audit_upload_id"]
            isOneToOne: false
            referencedRelation: "audit_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_reports: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          org_id: string
          report_data: Json
          report_status: string
          report_type: string
          reporting_period: string
          reviewed_by: string | null
          reviewer_notes: string | null
          submission_date: string | null
          submission_reference: string | null
          updated_at: string
          validation_results: Json | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          org_id: string
          report_data?: Json
          report_status?: string
          report_type: string
          reporting_period: string
          reviewed_by?: string | null
          reviewer_notes?: string | null
          submission_date?: string | null
          submission_reference?: string | null
          updated_at?: string
          validation_results?: Json | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          org_id?: string
          report_data?: Json
          report_status?: string
          report_type?: string
          reporting_period?: string
          reviewed_by?: string | null
          reviewer_notes?: string | null
          submission_date?: string | null
          submission_reference?: string | null
          updated_at?: string
          validation_results?: Json | null
        }
        Relationships: []
      }
      regulatory_template_mappings: {
        Row: {
          compliance_level: string
          created_at: string
          id: string
          implementation_guidance: string | null
          is_current: boolean
          jurisdiction: string
          last_reviewed_date: string | null
          mapping_confidence: number | null
          regulation_name: string
          regulatory_section: string | null
          template_id: string
          updated_at: string
          validation_criteria: Json | null
        }
        Insert: {
          compliance_level?: string
          created_at?: string
          id?: string
          implementation_guidance?: string | null
          is_current?: boolean
          jurisdiction: string
          last_reviewed_date?: string | null
          mapping_confidence?: number | null
          regulation_name: string
          regulatory_section?: string | null
          template_id: string
          updated_at?: string
          validation_criteria?: Json | null
        }
        Update: {
          compliance_level?: string
          created_at?: string
          id?: string
          implementation_guidance?: string | null
          is_current?: boolean
          jurisdiction?: string
          last_reviewed_date?: string | null
          mapping_confidence?: number | null
          regulation_name?: string
          regulatory_section?: string | null
          template_id?: string
          updated_at?: string
          validation_criteria?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_template_mappings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_template_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      report_instances: {
        Row: {
          created_at: string
          email_recipients: Json | null
          file_path: string | null
          file_size: number | null
          generated_by: string | null
          generated_by_name: string | null
          generation_date: string
          id: string
          instance_name: string
          org_id: string
          report_data: Json
          report_period_end: string | null
          report_period_start: string | null
          scheduled_delivery: Json | null
          status: string
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_recipients?: Json | null
          file_path?: string | null
          file_size?: number | null
          generated_by?: string | null
          generated_by_name?: string | null
          generation_date?: string
          id?: string
          instance_name: string
          org_id: string
          report_data?: Json
          report_period_end?: string | null
          report_period_start?: string | null
          scheduled_delivery?: Json | null
          status?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_recipients?: Json | null
          file_path?: string | null
          file_size?: number | null
          generated_by?: string | null
          generated_by_name?: string | null
          generation_date?: string
          id?: string
          instance_name?: string
          org_id?: string
          report_data?: Json
          report_period_end?: string | null
          report_period_start?: string | null
          scheduled_delivery?: Json | null
          status?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_date: string | null
          next_run_date: string | null
          org_id: string
          recipients: string[] | null
          schedule_name: string
          template_id: string | null
          time_of_day: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_date?: string | null
          next_run_date?: string | null
          org_id: string
          recipients?: string[] | null
          schedule_name: string
          template_id?: string | null
          time_of_day: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_date?: string | null
          next_run_date?: string | null
          org_id?: string
          recipients?: string[] | null
          schedule_name?: string
          template_id?: string | null
          time_of_day?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string
          created_by: string | null
          data_blocks: Json
          description: string | null
          id: string
          is_active: boolean
          is_system_template: boolean
          layout_config: Json
          org_id: string
          template_config: Json
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_blocks?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          is_system_template?: boolean
          layout_config?: Json
          org_id: string
          template_config?: Json
          template_name: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_blocks?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          is_system_template?: boolean
          layout_config?: Json
          org_id?: string
          template_config?: Json
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_alerts: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          change_magnitude: number | null
          created_at: string
          current_value: Json | null
          description: string
          id: string
          org_id: string
          previous_value: Json | null
          severity: string
          source_attribution: string
          triggered_at: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          change_magnitude?: number | null
          created_at?: string
          current_value?: Json | null
          description: string
          id?: string
          org_id: string
          previous_value?: Json | null
          severity: string
          source_attribution: string
          triggered_at?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          change_magnitude?: number | null
          created_at?: string
          current_value?: Json | null
          description?: string
          id?: string
          org_id?: string
          previous_value?: Json | null
          severity?: string
          source_attribution?: string
          triggered_at?: string
          updated_at?: string
          vendor_id?: string | null
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
      risk_correlations: {
        Row: {
          analysis_period: unknown
          correlation_coefficient: number
          correlation_context: Json | null
          correlation_strength: string
          created_at: string
          factor_a_id: string | null
          factor_a_type: string
          factor_b_id: string | null
          factor_b_type: string
          id: string
          org_id: string
          statistical_significance: number | null
          updated_at: string
        }
        Insert: {
          analysis_period: unknown
          correlation_coefficient: number
          correlation_context?: Json | null
          correlation_strength: string
          created_at?: string
          factor_a_id?: string | null
          factor_a_type: string
          factor_b_id?: string | null
          factor_b_type: string
          id?: string
          org_id: string
          statistical_significance?: number | null
          updated_at?: string
        }
        Update: {
          analysis_period?: unknown
          correlation_coefficient?: number
          correlation_context?: Json | null
          correlation_strength?: string
          created_at?: string
          factor_a_id?: string | null
          factor_a_type?: string
          factor_b_id?: string | null
          factor_b_type?: string
          id?: string
          org_id?: string
          statistical_significance?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      risk_framework_templates: {
        Row: {
          created_at: string
          description: string | null
          framework_components: Json
          id: string
          implementation_roadmap: Json
          is_active: boolean | null
          name: string
          target_profile: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework_components?: Json
          id?: string
          implementation_roadmap?: Json
          is_active?: boolean | null
          name: string
          target_profile?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          framework_components?: Json
          id?: string
          implementation_roadmap?: Json
          is_active?: boolean | null
          name?: string
          target_profile?: Json
          updated_at?: string
        }
        Relationships: []
      }
      risk_intelligence: {
        Row: {
          attribution: string
          collected_at: string
          confidence_score: number
          created_at: string
          data_freshness_hours: number
          expires_at: string | null
          id: string
          intelligence_type: string
          org_id: string
          processed_data: Json
          raw_data: Json
          risk_level: string
          risk_score: number
          source_id: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          attribution: string
          collected_at?: string
          confidence_score?: number
          created_at?: string
          data_freshness_hours?: number
          expires_at?: string | null
          id?: string
          intelligence_type: string
          org_id: string
          processed_data?: Json
          raw_data?: Json
          risk_level: string
          risk_score: number
          source_id?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          attribution?: string
          collected_at?: string
          confidence_score?: number
          created_at?: string
          data_freshness_hours?: number
          expires_at?: string | null
          id?: string
          intelligence_type?: string
          org_id?: string
          processed_data?: Json
          raw_data?: Json
          risk_level?: string
          risk_score?: number
          source_id?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_intelligence_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "external_data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_intelligence_feeds: {
        Row: {
          created_at: string
          description: string
          feed_type: string
          id: string
          published_at: string
          region: string
          risk_category: string
          sector: string
          severity: string
          source: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          feed_type: string
          id?: string
          published_at: string
          region?: string
          risk_category: string
          sector?: string
          severity: string
          source: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          feed_type?: string
          id?: string
          published_at?: string
          region?: string
          risk_category?: string
          sector?: string
          severity?: string
          source?: string
          tags?: string[] | null
          title?: string
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
      scenario_execution_schedules: {
        Row: {
          assigned_team: Json | null
          auto_execute: boolean
          created_at: string
          execution_frequency: string
          execution_parameters: Json | null
          execution_time: string | null
          id: string
          is_active: boolean
          next_execution_date: string
          notification_settings: Json | null
          org_id: string
          preparation_checklist: Json | null
          scenario_id: string | null
          scenario_type: string
          schedule_name: string
          updated_at: string
        }
        Insert: {
          assigned_team?: Json | null
          auto_execute?: boolean
          created_at?: string
          execution_frequency?: string
          execution_parameters?: Json | null
          execution_time?: string | null
          id?: string
          is_active?: boolean
          next_execution_date: string
          notification_settings?: Json | null
          org_id: string
          preparation_checklist?: Json | null
          scenario_id?: string | null
          scenario_type: string
          schedule_name: string
          updated_at?: string
        }
        Update: {
          assigned_team?: Json | null
          auto_execute?: boolean
          created_at?: string
          execution_frequency?: string
          execution_parameters?: Json | null
          execution_time?: string | null
          id?: string
          is_active?: boolean
          next_execution_date?: string
          notification_settings?: Json | null
          org_id?: string
          preparation_checklist?: Json | null
          scenario_id?: string | null
          scenario_type?: string
          schedule_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      scenario_execution_steps: {
        Row: {
          actual_outcome: string | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          expected_outcome: string | null
          id: string
          notes: string | null
          responsible_person: string | null
          scenario_result_id: string
          started_at: string | null
          status: string
          step_description: string | null
          step_name: string
          step_number: number
          updated_at: string
        }
        Insert: {
          actual_outcome?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          expected_outcome?: string | null
          id?: string
          notes?: string | null
          responsible_person?: string | null
          scenario_result_id: string
          started_at?: string | null
          status?: string
          step_description?: string | null
          step_name: string
          step_number: number
          updated_at?: string
        }
        Update: {
          actual_outcome?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          expected_outcome?: string | null
          id?: string
          notes?: string | null
          responsible_person?: string | null
          scenario_result_id?: string
          started_at?: string | null
          status?: string
          step_description?: string | null
          step_name?: string
          step_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_execution_steps_scenario_result_id_fkey"
            columns: ["scenario_result_id"]
            isOneToOne: false
            referencedRelation: "scenario_results"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_monte_carlo_simulations: {
        Row: {
          confidence_interval: number
          created_at: string
          id: string
          number_of_iterations: number
          org_id: string
          risk_metrics: Json
          scenario_test_id: string
          simulation_parameters: Json
          simulation_results: Json
          statistical_summary: Json
          updated_at: string
        }
        Insert: {
          confidence_interval?: number
          created_at?: string
          id?: string
          number_of_iterations?: number
          org_id: string
          risk_metrics?: Json
          scenario_test_id: string
          simulation_parameters?: Json
          simulation_results?: Json
          statistical_summary?: Json
          updated_at?: string
        }
        Update: {
          confidence_interval?: number
          created_at?: string
          id?: string
          number_of_iterations?: number
          org_id?: string
          risk_metrics?: Json
          scenario_test_id?: string
          simulation_parameters?: Json
          simulation_results?: Json
          statistical_summary?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_monte_carlo_simulations_scenario_test_id_fkey"
            columns: ["scenario_test_id"]
            isOneToOne: false
            referencedRelation: "scenario_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_results: {
        Row: {
          affected_functions_count: number | null
          ai_recommendations: string | null
          created_at: string
          execution_completed_at: string | null
          execution_notes: string | null
          execution_started_at: string
          id: string
          lessons_learned: string | null
          org_id: string
          overall_score: number | null
          recovery_time_minutes: number | null
          response_time_minutes: number | null
          scenario_test_id: string
          success_rate: number | null
          test_coverage_score: number | null
          updated_at: string
        }
        Insert: {
          affected_functions_count?: number | null
          ai_recommendations?: string | null
          created_at?: string
          execution_completed_at?: string | null
          execution_notes?: string | null
          execution_started_at?: string
          id?: string
          lessons_learned?: string | null
          org_id: string
          overall_score?: number | null
          recovery_time_minutes?: number | null
          response_time_minutes?: number | null
          scenario_test_id: string
          success_rate?: number | null
          test_coverage_score?: number | null
          updated_at?: string
        }
        Update: {
          affected_functions_count?: number | null
          ai_recommendations?: string | null
          created_at?: string
          execution_completed_at?: string | null
          execution_notes?: string | null
          execution_started_at?: string
          id?: string
          lessons_learned?: string | null
          org_id?: string
          overall_score?: number | null
          recovery_time_minutes?: number | null
          response_time_minutes?: number | null
          scenario_test_id?: string
          success_rate?: number | null
          test_coverage_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_results_scenario_test_id_fkey"
            columns: ["scenario_test_id"]
            isOneToOne: false
            referencedRelation: "scenario_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          impact_parameters: Json
          is_regulatory_required: boolean | null
          org_id: string
          probability_distributions: Json
          recovery_assumptions: Json
          regulatory_framework: string | null
          scenario_description: string
          stress_factors: Json
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          impact_parameters?: Json
          is_regulatory_required?: boolean | null
          org_id: string
          probability_distributions?: Json
          recovery_assumptions?: Json
          regulatory_framework?: string | null
          scenario_description: string
          stress_factors?: Json
          template_name: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          impact_parameters?: Json
          is_regulatory_required?: boolean | null
          org_id?: string
          probability_distributions?: Json
          recovery_assumptions?: Json
          regulatory_framework?: string | null
          scenario_description?: string
          stress_factors?: Json
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      scenario_test_controls: {
        Row: {
          control_name: string
          control_type: string | null
          created_at: string
          effectiveness: string
          id: string
          notes: string | null
          scenario_test_id: string
        }
        Insert: {
          control_name: string
          control_type?: string | null
          created_at?: string
          effectiveness?: string
          id?: string
          notes?: string | null
          scenario_test_id: string
        }
        Update: {
          control_name?: string
          control_type?: string | null
          created_at?: string
          effectiveness?: string
          id?: string
          notes?: string | null
          scenario_test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_test_controls_scenario_test_id_fkey"
            columns: ["scenario_test_id"]
            isOneToOne: false
            referencedRelation: "scenario_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_test_functions: {
        Row: {
          actual_downtime: string | null
          business_function_id: string
          created_at: string
          estimated_downtime: string | null
          id: string
          impact_level: string
          scenario_test_id: string
        }
        Insert: {
          actual_downtime?: string | null
          business_function_id: string
          created_at?: string
          estimated_downtime?: string | null
          id?: string
          impact_level?: string
          scenario_test_id: string
        }
        Update: {
          actual_downtime?: string | null
          business_function_id?: string
          created_at?: string
          estimated_downtime?: string | null
          id?: string
          impact_level?: string
          scenario_test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_test_functions_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_test_functions_scenario_test_id_fkey"
            columns: ["scenario_test_id"]
            isOneToOne: false
            referencedRelation: "scenario_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_test_metrics: {
        Row: {
          average_recovery_time_minutes: number | null
          average_response_time_minutes: number | null
          created_at: string
          critical_functions_tested: number | null
          failed_tests: number | null
          high_priority_functions_tested: number | null
          id: string
          org_id: string
          successful_tests: number | null
          test_coverage_percentage: number | null
          test_date: string
          total_tests_conducted: number | null
          updated_at: string
        }
        Insert: {
          average_recovery_time_minutes?: number | null
          average_response_time_minutes?: number | null
          created_at?: string
          critical_functions_tested?: number | null
          failed_tests?: number | null
          high_priority_functions_tested?: number | null
          id?: string
          org_id: string
          successful_tests?: number | null
          test_coverage_percentage?: number | null
          test_date?: string
          total_tests_conducted?: number | null
          updated_at?: string
        }
        Update: {
          average_recovery_time_minutes?: number | null
          average_response_time_minutes?: number | null
          created_at?: string
          critical_functions_tested?: number | null
          failed_tests?: number | null
          high_priority_functions_tested?: number | null
          id?: string
          org_id?: string
          successful_tests?: number | null
          test_coverage_percentage?: number | null
          test_date?: string
          total_tests_conducted?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      scenario_tests: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          current_step: number
          description: string | null
          disruption_type: string
          id: string
          improvements_identified: string | null
          lessons_learned: string | null
          org_id: string
          outcome: string | null
          post_mortem: string | null
          response_plan: string | null
          severity_level: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          current_step?: number
          description?: string | null
          disruption_type: string
          id?: string
          improvements_identified?: string | null
          lessons_learned?: string | null
          org_id: string
          outcome?: string | null
          post_mortem?: string | null
          response_plan?: string | null
          severity_level?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          current_step?: number
          description?: string | null
          disruption_type?: string
          id?: string
          improvements_identified?: string | null
          lessons_learned?: string | null
          org_id?: string
          outcome?: string | null
          post_mortem?: string | null
          response_plan?: string | null
          severity_level?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sector_thresholds: {
        Row: {
          created_at: string
          id: string
          metric: string
          rationale: string
          recommended_value: string
          regulatory_basis: string | null
          sector: string
          sub_sector: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric: string
          rationale: string
          recommended_value: string
          regulatory_basis?: string | null
          sector: string
          sub_sector?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric?: string
          rationale?: string
          recommended_value?: string
          regulatory_basis?: string | null
          sector?: string
          sub_sector?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action_performed: string
          correlation_id: string | null
          event_category: string
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          location_data: Json | null
          org_id: string
          resource_id: string | null
          resource_type: string | null
          risk_score: number | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_performed: string
          correlation_id?: string | null
          event_category: string
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          org_id: string
          resource_id?: string | null
          resource_type?: string | null
          risk_score?: number | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_performed?: string
          correlation_id?: string | null
          event_category?: string
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          org_id?: string
          resource_id?: string | null
          resource_type?: string | null
          risk_score?: number | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          affected_systems: Json
          assigned_team: string | null
          created_at: string
          description: string | null
          escalated_at: string | null
          escalation_level: number
          evidence_data: Json
          id: string
          incident_type: string
          org_id: string
          resolved_at: string | null
          response_actions: Json
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_systems?: Json
          assigned_team?: string | null
          created_at?: string
          description?: string | null
          escalated_at?: string | null
          escalation_level?: number
          evidence_data?: Json
          id?: string
          incident_type: string
          org_id: string
          resolved_at?: string | null
          response_actions?: Json
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_systems?: Json
          assigned_team?: string | null
          created_at?: string
          description?: string | null
          escalated_at?: string | null
          escalation_level?: number
          evidence_data?: Json
          id?: string
          incident_type?: string
          org_id?: string
          resolved_at?: string | null
          response_actions?: Json
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          org_id: string
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          risk_score: number | null
          session_id: string | null
          status: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          org_id: string
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          risk_score?: number | null
          session_id?: string | null
          status?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          org_id?: string
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          risk_score?: number | null
          session_id?: string | null
          status?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      security_metrics: {
        Row: {
          baseline_value: number | null
          created_at: string
          id: string
          measurement_date: string
          measurement_period: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_unit: string | null
          metric_value: number
          org_id: string
          threshold_critical: number | null
          threshold_warning: number | null
          trend_direction: string | null
        }
        Insert: {
          baseline_value?: number | null
          created_at?: string
          id?: string
          measurement_date?: string
          measurement_period?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          org_id: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          trend_direction?: string | null
        }
        Update: {
          baseline_value?: number | null
          created_at?: string
          id?: string
          measurement_date?: string
          measurement_period?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          org_id?: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          trend_direction?: string | null
        }
        Relationships: []
      }
      security_playbooks: {
        Row: {
          automation_level: string
          created_at: string
          created_by: string | null
          escalation_rules: Json
          id: string
          is_active: boolean
          org_id: string
          playbook_name: string
          priority: number
          response_steps: Json
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          automation_level?: string
          created_at?: string
          created_by?: string | null
          escalation_rules?: Json
          id?: string
          is_active?: boolean
          org_id: string
          playbook_name: string
          priority?: number
          response_steps?: Json
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          automation_level?: string
          created_at?: string
          created_by?: string | null
          escalation_rules?: Json
          id?: string
          is_active?: boolean
          org_id?: string
          playbook_name?: string
          priority?: number
          response_steps?: Json
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      security_threats: {
        Row: {
          affected_resources: Json
          assigned_to: string | null
          created_at: string
          detected_at: string
          detection_method: string
          id: string
          mitigation_actions: Json
          org_id: string
          resolved_at: string | null
          severity: string
          status: string
          threat_indicators: Json
          threat_type: string
          updated_at: string
        }
        Insert: {
          affected_resources?: Json
          assigned_to?: string | null
          created_at?: string
          detected_at?: string
          detection_method: string
          id?: string
          mitigation_actions?: Json
          org_id: string
          resolved_at?: string | null
          severity: string
          status?: string
          threat_indicators?: Json
          threat_type: string
          updated_at?: string
        }
        Update: {
          affected_resources?: Json
          assigned_to?: string | null
          created_at?: string
          detected_at?: string
          detection_method?: string
          id?: string
          mitigation_actions?: Json
          org_id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          threat_indicators?: Json
          threat_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_policies: {
        Row: {
          absolute_timeout_minutes: number
          allowed_ip_ranges: Json | null
          created_at: string
          id: string
          idle_timeout_minutes: number
          ip_restriction_enabled: boolean
          is_active: boolean
          max_concurrent_sessions: number
          org_id: string
          policy_name: string
          require_mfa_for_sensitive_actions: boolean
          updated_at: string
        }
        Insert: {
          absolute_timeout_minutes?: number
          allowed_ip_ranges?: Json | null
          created_at?: string
          id?: string
          idle_timeout_minutes?: number
          ip_restriction_enabled?: boolean
          is_active?: boolean
          max_concurrent_sessions?: number
          org_id: string
          policy_name: string
          require_mfa_for_sensitive_actions?: boolean
          updated_at?: string
        }
        Update: {
          absolute_timeout_minutes?: number
          allowed_ip_ranges?: Json | null
          created_at?: string
          id?: string
          idle_timeout_minutes?: number
          ip_restriction_enabled?: boolean
          is_active?: boolean
          max_concurrent_sessions?: number
          org_id?: string
          policy_name?: string
          require_mfa_for_sensitive_actions?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          org_id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          org_id: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          org_id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      siem_integrations: {
        Row: {
          authentication_config: Json
          created_at: string
          created_by: string | null
          endpoint_url: string
          event_filters: Json
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean
          last_sync_at: string | null
          org_id: string
          sync_status: string
          updated_at: string
        }
        Insert: {
          authentication_config?: Json
          created_at?: string
          created_by?: string | null
          endpoint_url: string
          event_filters?: Json
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean
          last_sync_at?: string | null
          org_id: string
          sync_status?: string
          updated_at?: string
        }
        Update: {
          authentication_config?: Json
          created_at?: string
          created_by?: string | null
          endpoint_url?: string
          event_filters?: Json
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean
          last_sync_at?: string | null
          org_id?: string
          sync_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      supply_chain_dependencies: {
        Row: {
          created_at: string
          criticality_level: string
          dependency_description: string | null
          dependency_type: string
          dependent_vendor_id: string
          id: string
          mitigation_strategies: Json | null
          org_id: string
          primary_vendor_id: string
          risk_multiplier: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criticality_level?: string
          dependency_description?: string | null
          dependency_type: string
          dependent_vendor_id: string
          id?: string
          mitigation_strategies?: Json | null
          org_id: string
          primary_vendor_id: string
          risk_multiplier?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criticality_level?: string
          dependency_description?: string | null
          dependency_type?: string
          dependent_vendor_id?: string
          id?: string
          mitigation_strategies?: Json | null
          org_id?: string
          primary_vendor_id?: string
          risk_multiplier?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sync_events: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          error_details: Json | null
          event_data: Json
          event_type: string
          id: string
          max_retries: number | null
          org_id: string
          processed_at: string | null
          retry_count: number | null
          source_module: string
          sync_status: string
          target_modules: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          error_details?: Json | null
          event_data?: Json
          event_type: string
          id?: string
          max_retries?: number | null
          org_id: string
          processed_at?: string | null
          retry_count?: number | null
          source_module: string
          sync_status?: string
          target_modules?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          error_details?: Json | null
          event_data?: Json
          event_type?: string
          id?: string
          max_retries?: number | null
          org_id?: string
          processed_at?: string | null
          retry_count?: number | null
          source_module?: string
          sync_status?: string
          target_modules?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      temp_organization_setup: {
        Row: {
          completion_estimate: number
          created_at: string
          current_step: number
          framework_progress: Json
          id: string
          setup_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_estimate?: number
          created_at?: string
          current_step?: number
          framework_progress?: Json
          id?: string
          setup_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_estimate?: number
          created_at?: string
          current_step?: number
          framework_progress?: Json
          id?: string
          setup_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_categories: {
        Row: {
          category_description: string | null
          category_name: string
          created_at: string
          id: string
          industry_focus: string[] | null
          is_active: boolean
          parent_category_id: string | null
          regulatory_frameworks: string[] | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category_description?: string | null
          category_name: string
          created_at?: string
          id?: string
          industry_focus?: string[] | null
          is_active?: boolean
          parent_category_id?: string | null
          regulatory_frameworks?: string[] | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category_description?: string | null
          category_name?: string
          created_at?: string
          id?: string
          industry_focus?: string[] | null
          is_active?: boolean
          parent_category_id?: string | null
          regulatory_frameworks?: string[] | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      template_customization_rules: {
        Row: {
          created_at: string
          customization_actions: Json
          id: string
          is_active: boolean
          parameter_adjustments: Json | null
          priority: number | null
          rule_name: string
          rule_type: string
          template_id: string
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          customization_actions?: Json
          id?: string
          is_active?: boolean
          parameter_adjustments?: Json | null
          priority?: number | null
          rule_name: string
          rule_type?: string
          template_id: string
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          customization_actions?: Json
          id?: string
          is_active?: boolean
          parameter_adjustments?: Json | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          template_id?: string
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_customization_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_template_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      template_dependencies: {
        Row: {
          created_at: string
          dependency_strength: string
          dependency_type: string
          dependent_template_id: string
          id: string
          implementation_order: number | null
          integration_notes: string | null
          is_active: boolean
          source_template_id: string
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          dependency_strength?: string
          dependency_type?: string
          dependent_template_id: string
          id?: string
          implementation_order?: number | null
          integration_notes?: string | null
          is_active?: boolean
          source_template_id: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          dependency_strength?: string
          dependency_type?: string
          dependent_template_id?: string
          id?: string
          implementation_order?: number | null
          integration_notes?: string | null
          is_active?: boolean
          source_template_id?: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "template_dependencies_dependent_template_id_fkey"
            columns: ["dependent_template_id"]
            isOneToOne: false
            referencedRelation: "industry_template_libraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_dependencies_source_template_id_fkey"
            columns: ["source_template_id"]
            isOneToOne: false
            referencedRelation: "industry_template_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      template_effectiveness_tracking: {
        Row: {
          actual_vs_planned_timeline: number | null
          compliance_improvement_score: number | null
          cost_benefit_ratio: number | null
          created_at: string
          id: string
          implementation_completion_date: string | null
          implementation_notes: string | null
          implementation_start_date: string
          implementation_success_rate: number | null
          issues_encountered: Json | null
          lessons_learned: Json | null
          operational_efficiency_gain: number | null
          org_id: string
          recommendations_for_improvement: Json | null
          reported_by: string | null
          reported_by_name: string | null
          template_id: string
          updated_at: string
          user_satisfaction_score: number | null
          would_recommend: boolean | null
        }
        Insert: {
          actual_vs_planned_timeline?: number | null
          compliance_improvement_score?: number | null
          cost_benefit_ratio?: number | null
          created_at?: string
          id?: string
          implementation_completion_date?: string | null
          implementation_notes?: string | null
          implementation_start_date: string
          implementation_success_rate?: number | null
          issues_encountered?: Json | null
          lessons_learned?: Json | null
          operational_efficiency_gain?: number | null
          org_id: string
          recommendations_for_improvement?: Json | null
          reported_by?: string | null
          reported_by_name?: string | null
          template_id: string
          updated_at?: string
          user_satisfaction_score?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          actual_vs_planned_timeline?: number | null
          compliance_improvement_score?: number | null
          cost_benefit_ratio?: number | null
          created_at?: string
          id?: string
          implementation_completion_date?: string | null
          implementation_notes?: string | null
          implementation_start_date?: string
          implementation_success_rate?: number | null
          issues_encountered?: Json | null
          lessons_learned?: Json | null
          operational_efficiency_gain?: number | null
          org_id?: string
          recommendations_for_improvement?: Json | null
          reported_by?: string | null
          reported_by_name?: string | null
          template_id?: string
          updated_at?: string
          user_satisfaction_score?: number | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "template_effectiveness_tracking_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_template_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      template_usage_analytics: {
        Row: {
          access_method: string | null
          customization_applied: boolean | null
          customization_details: Json | null
          device_type: string | null
          feedback_provided: boolean | null
          id: string
          org_id: string
          session_duration: number | null
          success_outcome: boolean | null
          template_id: string
          timestamp: string
          usage_context: string | null
          usage_type: string
          user_id: string | null
        }
        Insert: {
          access_method?: string | null
          customization_applied?: boolean | null
          customization_details?: Json | null
          device_type?: string | null
          feedback_provided?: boolean | null
          id?: string
          org_id: string
          session_duration?: number | null
          success_outcome?: boolean | null
          template_id: string
          timestamp?: string
          usage_context?: string | null
          usage_type?: string
          user_id?: string | null
        }
        Update: {
          access_method?: string | null
          customization_applied?: boolean | null
          customization_details?: Json | null
          device_type?: string | null
          feedback_provided?: boolean | null
          id?: string
          org_id?: string
          session_duration?: number | null
          success_outcome?: boolean | null
          template_id?: string
          timestamp?: string
          usage_context?: string | null
          usage_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_usage_analytics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "industry_template_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      third_party_profiles: {
        Row: {
          address: string | null
          annual_spend: number | null
          contact_email: string | null
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          created_by: string | null
          criticality: string
          id: string
          last_assessment_date: string | null
          next_assessment_date: string | null
          notes: string | null
          org_id: string
          risk_rating: string | null
          service_provided: string
          sla_expiry_date: string | null
          status: string
          updated_at: string
          vendor_name: string
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_spend?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          created_by?: string | null
          criticality: string
          id?: string
          last_assessment_date?: string | null
          next_assessment_date?: string | null
          notes?: string | null
          org_id: string
          risk_rating?: string | null
          service_provided: string
          sla_expiry_date?: string | null
          status?: string
          updated_at?: string
          vendor_name: string
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_spend?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          created_by?: string | null
          criticality?: string
          id?: string
          last_assessment_date?: string | null
          next_assessment_date?: string | null
          notes?: string | null
          org_id?: string
          risk_rating?: string | null
          service_provided?: string
          sla_expiry_date?: string | null
          status?: string
          updated_at?: string
          vendor_name?: string
          website?: string | null
        }
        Relationships: []
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
          vendor_profile_id: string | null
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
          vendor_profile_id?: string | null
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
          vendor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "third_party_reviews_vendor_profile_id_fkey"
            columns: ["vendor_profile_id"]
            isOneToOne: false
            referencedRelation: "third_party_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_indicators: {
        Row: {
          confidence_score: number
          created_at: string
          expires_at: string | null
          first_seen_at: string
          id: string
          indicator_type: string
          indicator_value: string
          is_active: boolean
          last_seen_at: string
          metadata: Json | null
          org_id: string
          severity: string
          source_feed: string
          threat_type: string
          updated_at: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          expires_at?: string | null
          first_seen_at?: string
          id?: string
          indicator_type: string
          indicator_value: string
          is_active?: boolean
          last_seen_at?: string
          metadata?: Json | null
          org_id: string
          severity: string
          source_feed: string
          threat_type: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          expires_at?: string | null
          first_seen_at?: string
          id?: string
          indicator_type?: string
          indicator_value?: string
          is_active?: boolean
          last_seen_at?: string
          metadata?: Json | null
          org_id?: string
          severity?: string
          source_feed?: string
          threat_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          org_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          org_id: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          org_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa_settings: {
        Row: {
          backup_codes_generated_at: string | null
          created_at: string
          email_enabled: boolean
          id: string
          last_mfa_verification: string | null
          mfa_enabled: boolean
          org_id: string
          phone_number: string | null
          sms_enabled: boolean
          totp_enabled: boolean
          totp_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes_generated_at?: string | null
          created_at?: string
          email_enabled?: boolean
          id?: string
          last_mfa_verification?: string | null
          mfa_enabled?: boolean
          org_id: string
          phone_number?: string | null
          sms_enabled?: boolean
          totp_enabled?: boolean
          totp_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes_generated_at?: string | null
          created_at?: string
          email_enabled?: boolean
          id?: string
          last_mfa_verification?: string | null
          mfa_enabled?: boolean
          org_id?: string
          phone_number?: string | null
          sms_enabled?: boolean
          totp_enabled?: boolean
          totp_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          step_id: string
          step_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step_id: string
          step_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step_id?: string
          step_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: string
          role_type: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role: string
          role_type?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string
          role_type?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity_at: string
          location_data: Json | null
          org_id: string
          session_token: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity_at?: string
          location_data?: Json | null
          org_id: string
          session_token: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity_at?: string
          location_data?: Json | null
          org_id?: string
          session_token?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendor_assessments: {
        Row: {
          assessment_date: string
          assessment_methodology: Json
          assessment_type: string
          assessor_id: string | null
          compliance_score: number | null
          created_at: string
          financial_score: number | null
          id: string
          mitigation_recommendations: Json
          next_assessment_date: string | null
          operational_score: number | null
          org_id: string
          overall_risk_score: number
          risk_factors: Json
          security_score: number | null
          status: string
          updated_at: string
          vendor_profile_id: string
        }
        Insert: {
          assessment_date?: string
          assessment_methodology?: Json
          assessment_type?: string
          assessor_id?: string | null
          compliance_score?: number | null
          created_at?: string
          financial_score?: number | null
          id?: string
          mitigation_recommendations?: Json
          next_assessment_date?: string | null
          operational_score?: number | null
          org_id: string
          overall_risk_score: number
          risk_factors?: Json
          security_score?: number | null
          status?: string
          updated_at?: string
          vendor_profile_id: string
        }
        Update: {
          assessment_date?: string
          assessment_methodology?: Json
          assessment_type?: string
          assessor_id?: string | null
          compliance_score?: number | null
          created_at?: string
          financial_score?: number | null
          id?: string
          mitigation_recommendations?: Json
          next_assessment_date?: string | null
          operational_score?: number | null
          org_id?: string
          overall_risk_score?: number
          risk_factors?: Json
          security_score?: number | null
          status?: string
          updated_at?: string
          vendor_profile_id?: string
        }
        Relationships: []
      }
      vendor_business_functions: {
        Row: {
          business_function_id: string
          created_at: string
          dependency_level: string
          id: string
          vendor_profile_id: string
        }
        Insert: {
          business_function_id: string
          created_at?: string
          dependency_level?: string
          id?: string
          vendor_profile_id: string
        }
        Update: {
          business_function_id?: string
          created_at?: string
          dependency_level?: string
          id?: string
          vendor_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_business_functions_business_function_id_fkey"
            columns: ["business_function_id"]
            isOneToOne: false
            referencedRelation: "business_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_business_functions_vendor_profile_id_fkey"
            columns: ["vendor_profile_id"]
            isOneToOne: false
            referencedRelation: "third_party_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contracts: {
        Row: {
          auto_renewal: boolean | null
          contract_name: string
          contract_type: string
          contract_value: number | null
          created_at: string | null
          end_date: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          renewal_notice_days: number | null
          responsible_user_id: string | null
          responsible_user_name: string | null
          start_date: string
          status: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          vendor_profile_id: string
          version_number: number
        }
        Insert: {
          auto_renewal?: boolean | null
          contract_name: string
          contract_type?: string
          contract_value?: number | null
          created_at?: string | null
          end_date: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          renewal_notice_days?: number | null
          responsible_user_id?: string | null
          responsible_user_name?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          vendor_profile_id: string
          version_number?: number
        }
        Update: {
          auto_renewal?: boolean | null
          contract_name?: string
          contract_type?: string
          contract_value?: number | null
          created_at?: string | null
          end_date?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          renewal_notice_days?: number | null
          responsible_user_id?: string | null
          responsible_user_name?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          vendor_profile_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contracts_vendor_profile_id_fkey"
            columns: ["vendor_profile_id"]
            isOneToOne: false
            referencedRelation: "third_party_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents: {
        Row: {
          description: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          upload_date: string
          uploaded_by: string | null
          vendor_profile_id: string
        }
        Insert: {
          description?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          upload_date?: string
          uploaded_by?: string | null
          vendor_profile_id: string
        }
        Update: {
          description?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          upload_date?: string
          uploaded_by?: string | null
          vendor_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_documents_vendor_profile_id_fkey"
            columns: ["vendor_profile_id"]
            isOneToOne: false
            referencedRelation: "third_party_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_monitoring_feeds: {
        Row: {
          alert_thresholds: Json
          created_at: string
          current_status: string
          feed_source: string
          feed_type: string
          id: string
          last_check_at: string | null
          monitoring_frequency: string
          org_id: string
          risk_indicators: Json
          updated_at: string
          vendor_profile_id: string
        }
        Insert: {
          alert_thresholds?: Json
          created_at?: string
          current_status?: string
          feed_source: string
          feed_type: string
          id?: string
          last_check_at?: string | null
          monitoring_frequency?: string
          org_id: string
          risk_indicators?: Json
          updated_at?: string
          vendor_profile_id: string
        }
        Update: {
          alert_thresholds?: Json
          created_at?: string
          current_status?: string
          feed_source?: string
          feed_type?: string
          id?: string
          last_check_at?: string | null
          monitoring_frequency?: string
          org_id?: string
          risk_indicators?: Json
          updated_at?: string
          vendor_profile_id?: string
        }
        Relationships: []
      }
      vendor_sla_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_date: string
          alert_type: string
          created_at: string
          days_before_alert: number
          email_sent_at: string | null
          id: string
          status: string
          updated_at: string
          vendor_profile_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_date: string
          alert_type: string
          created_at?: string
          days_before_alert?: number
          email_sent_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          vendor_profile_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_date?: string
          alert_type?: string
          created_at?: string
          days_before_alert?: number
          email_sent_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          vendor_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_sla_alerts_vendor_profile_id_fkey"
            columns: ["vendor_profile_id"]
            isOneToOne: false
            referencedRelation: "third_party_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_execution_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_details: string | null
          execution_id: string
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          node_id: string
          output_data: Json | null
          started_at: string
          status: string
          step_name: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_details?: string | null
          execution_id: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          node_id: string
          output_data?: Json | null
          started_at?: string
          status: string
          step_name: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_details?: string | null
          execution_id?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          node_id?: string
          output_data?: Json | null
          started_at?: string
          status?: string
          step_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execution_logs_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_node: string | null
          error_message: string | null
          execution_context: Json | null
          execution_log: Json | null
          id: string
          org_id: string
          started_at: string
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_node?: string | null
          error_message?: string | null
          execution_context?: Json | null
          execution_log?: Json | null
          id?: string
          org_id: string
          started_at?: string
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_node?: string | null
          error_message?: string | null
          execution_context?: Json | null
          execution_log?: Json | null
          id?: string
          org_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_orchestrations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          org_id: string
          owner_id: string | null
          owner_name: string | null
          started_at: string | null
          status: string
          template_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          org_id: string
          owner_id?: string | null
          owner_name?: string | null
          started_at?: string | null
          status?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          org_id?: string
          owner_id?: string | null
          owner_name?: string | null
          started_at?: string | null
          status?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_integrations: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          last_sync_at: string | null
          module_name: string
          org_id: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean
          last_sync_at?: string | null
          module_name: string
          org_id: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          last_sync_at?: string | null
          module_name?: string
          org_id?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_integrations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_orchestrations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_node_types: {
        Row: {
          category: string
          color_class: string | null
          configuration_schema: Json | null
          created_at: string
          description: string | null
          display_name: string
          icon_name: string | null
          id: string
          input_schema: Json | null
          is_active: boolean | null
          is_system: boolean | null
          node_type: string
          output_schema: Json | null
          updated_at: string
        }
        Insert: {
          category?: string
          color_class?: string | null
          configuration_schema?: Json | null
          created_at?: string
          description?: string | null
          display_name: string
          icon_name?: string | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_system?: boolean | null
          node_type: string
          output_schema?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string
          color_class?: string | null
          configuration_schema?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string
          icon_name?: string | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_system?: boolean | null
          node_type?: string
          output_schema?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      workflow_orchestrations: {
        Row: {
          business_rules: Json | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          edges: Json
          id: string
          name: string
          nodes: Json
          org_id: string
          status: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
          variables: Json | null
          version: number
        }
        Insert: {
          business_rules?: Json | null
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json
          id?: string
          name: string
          nodes?: Json
          org_id: string
          status?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          variables?: Json | null
          version?: number
        }
        Update: {
          business_rules?: Json | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json
          id?: string
          name?: string
          nodes?: Json
          org_id?: string
          status?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          variables?: Json | null
          version?: number
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          status: string
          step_description: string | null
          step_name: string
          step_number: number
          updated_at: string
          workflow_instance_id: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          step_description?: string | null
          step_name: string
          step_number: number
          updated_at?: string
          workflow_instance_id: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          step_description?: string | null
          step_name?: string
          step_number?: number
          updated_at?: string
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          module: string
          name: string
          org_id: string
          steps: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          module: string
          name: string
          org_id: string
          steps?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          module?: string
          name?: string
          org_id?: string
          steps?: Json
          updated_at?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          status: string
          triggers: Json
          updated_at: string
          workflow_definition: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          status?: string
          triggers?: Json
          updated_at?: string
          workflow_definition?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          status?: string
          triggers?: Json
          updated_at?: string
          workflow_definition?: Json
        }
        Relationships: []
      }
    }
    Views: {
      performance_dashboard_metrics: {
        Row: {
          avg_cpu_usage: number | null
          avg_error_rate: number | null
          avg_memory_usage: number | null
          avg_response_time: number | null
          avg_throughput: number | null
          metric_count: number | null
          metric_hour: string | null
          org_id: string | null
          service_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_kri_appetite_variance: {
        Args: {
          p_kri_id: string
          p_actual_value: number
          p_measurement_date: string
        }
        Returns: string
      }
      calculate_session_risk_score: {
        Args: {
          user_id: string
          device_fingerprint_id: string
          location_data: Json
        }
        Returns: number
      }
      calculate_vendor_risk_score: {
        Args: {
          vendor_criticality: string
          last_assessment_date: string
          contract_end_date: string
          sla_expiry_date: string
          status: string
        }
        Returns: number
      }
      check_expiring_contracts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_incident_sla_breaches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_session_timeout: {
        Args: { session_token: string }
        Returns: boolean
      }
      check_user_framework_access: {
        Args: { framework_id: string }
        Returns: boolean
      }
      check_user_framework_for_changelog: {
        Args: { framework_id: string }
        Returns: boolean
      }
      check_user_org_access: {
        Args: { target_org_id: string }
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
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_organization_with_profile: {
        Args: {
          p_org_name: string
          p_sector: string
          p_size: string
          p_regulatory_guidelines?: string[]
          p_user_id?: string
        }
        Returns: {
          organization_id: string
          profile_updated: boolean
        }[]
      }
      create_organizational_profile_safe: {
        Args: {
          p_organization_id: string
          p_preferred_framework_types?: string[]
          p_auto_generate_frameworks?: boolean
        }
        Returns: string
      }
      detect_data_patterns: {
        Args: { data_content: string; org_id: string }
        Returns: Json
      }
      get_analytics_summary: {
        Args: { org_id_param: string }
        Returns: Json
      }
      get_incidents_summary: {
        Args: { org_id_param: string }
        Returns: Json
      }
      get_kri_summary: {
        Args: { start_date_param?: string; end_date_param?: string }
        Returns: Json
      }
      get_org_dashboard_metrics: {
        Args: { target_org_id?: string }
        Returns: {
          total_incidents: number
          high_severity_incidents: number
          total_controls: number
          active_controls: number
          total_kris: number
          total_vendors: number
          high_risk_vendors: number
          last_incident_date: string
        }[]
      }
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_org_safe: {
        Args: { user_id?: string }
        Returns: string
      }
      get_user_role_safe: {
        Args: { user_id?: string }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
      is_admin_role: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      log_audit_action: {
        Args: {
          p_user_id: string
          p_org_id: string
          p_action_type: string
          p_module: string
          p_resource_id?: string
          p_resource_type?: string
          p_action_details?: Json
          p_ip_address?: string
          p_user_agent?: string
          p_user_name?: string
          p_success?: boolean
        }
        Returns: string
      }
      match_knowledge_base: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          org_filter: string
        }
        Returns: {
          id: string
          org_id: string
          title: string
          category: string
          content: string
          tags: string[]
          visibility: string
          created_at: string
          updated_at: string
          similarity: number
        }[]
      }
      refresh_performance_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_weekly_executive_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_onboarding_step: {
        Args: {
          p_user_id: string
          p_step_id: string
          p_step_name: string
          p_completed?: boolean
          p_data?: Json
        }
        Returns: undefined
      }
      update_user_role_safe: {
        Args: {
          p_user_id: string
          p_new_role: string
          p_organization_id: string
        }
        Returns: Json
      }
      user_has_org_access: {
        Args: { target_org_id: string; user_id?: string }
        Returns: boolean
      }
      validate_org_access: {
        Args: { table_org_id: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password: string; org_id: string }
        Returns: Json
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "analyst"
        | "user"
        | "auditor"
        | "executive"
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
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "analyst",
        "user",
        "auditor",
        "executive",
      ],
    },
  },
} as const
