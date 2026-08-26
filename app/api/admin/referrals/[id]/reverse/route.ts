import { requireAdmin } from '@/lib/adminAuth'
import { serviceClient } from '@/lib/supabase/service'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const { data: referral, error } = await serviceClient
      .from('referrals')
      .select('id, referrer_id, status, commission_amount')
      .eq('id', id)
      .single()

    if (error || !referral) {
      return Response.json({ error: 'Referral not found' }, { status: 404 })
    }
    if (referral.status !== 'paid') {
      return Response.json({ error: 'Only paid referrals can be reversed' }, { status: 400 })
    }

    const commission = Number(referral.commission_amount)

    // Revert referral to pending
    await serviceClient
      .from('referrals')
      .update({
        status: 'pending',
        commission_amount: 0,
        paid_at: null,
      })
      .eq('id', id)

    // Deduct from referrer's wallet (floor at 0)
    if (commission > 0) {
      const { data: referrer } = await serviceClient
        .from('users')
        .select('wallet_balance')
        .eq('id', referral.referrer_id)
        .single()

      if (referrer) {
        const newBalance = Math.max(0, Number(referrer.wallet_balance) - commission)
        await serviceClient
          .from('users')
          .update({ wallet_balance: newBalance })
          .eq('id', referral.referrer_id)
      }
    }

    return Response.json({ success: true })
  } catch (res) {
    if (res instanceof Response) return res
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
