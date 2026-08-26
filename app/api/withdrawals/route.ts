import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/supabase/service'
import { getConfigNumber } from '@/lib/config'

export async function POST(request: Request) {
  try {
    // Auth: session client for identity only
    const sessionSupabase = await createClient()
    const {
      data: { user },
    } = await sessionSupabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, upi_id } = body

    // Basic input validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 })
    }
    if (!upi_id || typeof upi_id !== 'string' || !upi_id.trim()) {
      return Response.json({ error: 'UPI ID is required' }, { status: 400 })
    }

    // Fetch user profile (serviceClient to bypass RLS)
    const { data: profile, error: profileErr } = await serviceClient
      .from('users')
      .select('wallet_balance, has_paid_platform_fee')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return Response.json({ error: 'Could not fetch profile' }, { status: 500 })
    }

    // Guard: only paid members can withdraw
    if (!profile.has_paid_platform_fee) {
      return Response.json(
        {
          error:
            'Only members who have paid the platform fee can withdraw earnings. Pay ₹249 to unlock withdrawals.',
        },
        { status: 403 }
      )
    }

    const minWithdrawal = await getConfigNumber('min_withdrawal_amount')

    if (amount < minWithdrawal) {
      return Response.json(
        { error: `Minimum withdrawal amount is ₹${minWithdrawal}` },
        { status: 400 }
      )
    }

    if (Number(profile.wallet_balance) < amount) {
      return Response.json({ error: 'Insufficient wallet balance' }, { status: 400 })
    }

    // Check for existing pending withdrawal
    const { data: existing } = await serviceClient
      .from('withdrawal_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return Response.json(
        { error: 'You already have a pending withdrawal request' },
        { status: 400 }
      )
    }

    // Insert withdrawal request (serviceClient bypasses RLS)
    const { error: insertErr } = await serviceClient
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount,
        upi_id: upi_id.trim(),
        status: 'pending',
      })

    if (insertErr) {
      return Response.json({ error: insertErr.message }, { status: 500 })
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return Response.json({ error: msg }, { status: 500 })
  }
}
