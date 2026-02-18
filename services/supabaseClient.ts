
import { createClient } from '@supabase/supabase-js';

// Credentials mapped from process.env via vite.config.ts
// Fallbacks are provided to ensure the application initializes correctly even if environment variables are missing
const supabaseUrl = process.env.SUPABASE_URL || 'https://tzokfbchrotuxxrovsqv.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2tmYmNocm90dXh4cm92c3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDcyMzIsImV4cCI6MjA4NjkyMzIzMn0.PJsb400R9TFZeDc0s4XgK4zdke7ceesRK7wgQQFpDYg';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing from environment. Using internal fallbacks for session management.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
