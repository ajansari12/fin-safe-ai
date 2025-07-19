
import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ooocjyscnvbahsyryzxp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vb2NqeXNjbnZiYWhzeXJ5enhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MDM3NzEsImV4cCI6MjA2MzI3OTc3MX0.aL4w8IZPxRRFToyxiKTctC8ZJFRiF6OgbD9Nlvw8WzI";

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

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
