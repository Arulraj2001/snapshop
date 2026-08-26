import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/supabase/service'

/**
 * Verifies the current session belongs to an admin user.
 * Call this at the top of every /api/admin/* route handler.
 *
 * Returns the authenticated admin user + serviceClient (bypasses RLS) on success.
 * Throws a Response with status 401 or 403 on failure —
 * simply re-throw it in your route handler:
 *
 *   const { user, supabase } = await requireAdmin()
 *
 * NOTE: `supabase` here is the SERVICE ROLE client — it bypasses all RLS.
 * Use it for all admin DB reads/writes. Auth is still verified via session.
 */
export async function requireAdmin() {
  // Use session client ONLY for auth verification
  const sessionClient = await createClient()
  const {
    data: { user },
  } = await sessionClient.auth.getUser()

  if (!user) {
    throw Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify admin role — use serviceClient to avoid recursive RLS on users table
  const { data: profile } = await serviceClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Return serviceClient so all admin route mutations bypass RLS
  return { user, supabase: serviceClient }
}
