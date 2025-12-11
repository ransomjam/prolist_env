import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables - set in Vercel dashboard
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Only create client if properly configured
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : (null as unknown as SupabaseClient);

export { SUPABASE_URL, SUPABASE_ANON_KEY };
