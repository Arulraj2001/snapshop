import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses all RLS policies.
 * ONLY use this in server-side code (API routes, webhooks).
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
