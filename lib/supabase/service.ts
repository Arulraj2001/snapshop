import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses all RLS policies.
 * ONLY use this in server-side code (API routes, webhooks, server pages).
 * Uses NEXT_PUBLIC_SUPABASE_ANON_KEY as safety fallback if evaluated on client.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pclhzdpuzrfasvadrngh.supabase.co'
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-key-for-client-eval'

export const serviceClient = createClient(supabaseUrl, supabaseKey)
