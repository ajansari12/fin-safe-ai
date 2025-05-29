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
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          regulatory_guidelines: string[] | null
          sector: string | null
          size: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          regulatory_guidelines?: string[] | null
          sector?: string | null
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          regulatory_guidelines?: string[] | null
          sector?: string | null
          size?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_kri_appetite_variance: {
        Args: {
          p_kri_id: string
          p_actual_value: number
          p_measurement_date: string
        }
        Returns: string
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
