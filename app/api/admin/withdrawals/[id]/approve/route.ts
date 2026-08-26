import { requireAdmin } from '@/lib/adminAuth'
import { serviceClient } from '@/lib/supabase/service'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin()
    const { id } = await params

    // Fetch the withdrawal request
    const { data: wr, error } = await serviceClient
      .from('withdrawal_requests')
      .select('id, user_id, amount, upi_id, status')
      .eq('id', id)
      .single()

    if (error || !wr) {
      return Response.json({ error: 'Withdrawal request not found' }, { status: 404 })
    }
    if (wr.status !== 'pending') {
      return Response.json({ error: 'Request is no longer pending' }, { status: 400 })
    }

    // Verify user still has sufficient balance
    const { data: profile } = await serviceClient
      .from('users')
      .select('wallet_balance')
      .eq('id', wr.user_id)
      .single()

    if (!profile || Number(profile.wallet_balance) < Number(wr.amount)) {
      return Response.json(
        { error: 'User has insufficient balance to process this withdrawal' },
        { status: 400 }
      )
    }

    // Mark request as approved
    await serviceClient
      .from('withdrawal_requests')
      .update({
        status: 'approved',
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Deduct from user wallet
    await serviceClient
      .from('users')
      .update({
        wallet_balance: Number(profile.wallet_balance) - Number(wr.amount),
      })
      .eq('id', wr.user_id)

    return Response.json({ success: true })
  } catch (res) {
    if (res instanceof Response) return res
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
