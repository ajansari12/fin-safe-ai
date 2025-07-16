
import { createClient } from '@supabase/supabase-js';

// Supabase configuration (hardcoded for Lovable)
const SUPABASE_URL = 'https://ooocjyscnvbahsyryzxp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vb2NqeXNjbnZiYWhzeXJ5enhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDM3NzEsImV4cCI6MjA2MzI3OTc3MX0.aL4w8IZPxRRFToyxiKTctC8ZJFRiF6OgbD9Nlvw8WzI';

// Create and export the Supabase client with security configurations
export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'fin-safe-ai'
      }
    }
  }
);
