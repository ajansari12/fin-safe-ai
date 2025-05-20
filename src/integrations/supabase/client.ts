
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ooocjyscnvbahsyryzxp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vb2NqeXNjbnZiYWhzeXJ5enhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDM3NzEsImV4cCI6MjA2MzI3OTc3MX0.aL4w8IZPxRRFToyxiKTctC8ZJFRiF6OgbD9Nlvw8WzI";

// Define the extended database type with our custom tables
type ExtendedDatabase = Database & {
  public: {
    Tables: Database['public']['Tables'] & {
      governance_policy_reviews: {
        Row: {
          id: string;
          policy_id: string | null;
          reviewer_id: string;
          reviewer_name: string;
          status: 'approved' | 'rejected';
          comments: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          policy_id?: string | null;
          reviewer_id: string;
          reviewer_name: string;
          status: 'approved' | 'rejected';
          comments?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          policy_id?: string | null;
          reviewer_id?: string;
          reviewer_name?: string;
          status?: 'approved' | 'rejected';
          comments?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      governance_policy_approvals: {
        Row: {
          id: string;
          policy_id: string | null;
          approver_id: string;
          approver_name: string;
          approval_date: string;
          signature: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          policy_id?: string | null;
          approver_id: string;
          approver_name: string;
          approval_date: string;
          signature?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          policy_id?: string | null;
          approver_id?: string;
          approver_name?: string;
          approval_date?: string;
          signature?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    }
  }
};

// Create and export the Supabase client with the extended types
export const supabase = createClient<ExtendedDatabase>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
