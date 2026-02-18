
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzokfbchrotuxxrovsqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2tmYmNocm90dXh4cm92c3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDcyMzIsImV4cCI6MjA4NjkyMzIzMn0.PJsb400R9TFZeDc0s4XgK4zdke7ceesRK7wgQQFpDYg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
