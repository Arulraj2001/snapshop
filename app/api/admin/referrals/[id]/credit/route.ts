import { requireAdmin } from '@/lib/adminAuth'
import { serviceClient } from '@/lib/supabase/service'
import { getConfigNumber } from '@/lib/config'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const { data: referral, error } = await serviceClient
      .from('referrals')
      .select('id, referrer_id, referred_id, status')
      .eq('id', id)
      .single()

    if (error || !referral) {
      return Response.json({ error: 'Referral not found' }, { status: 404 })
    }
    if (referral.status === 'paid') {
      return Response.json({ error: 'Referral already paid' }, { status: 400 })
    }

    const commission = await getConfigNumber('referral_commission')

    // Mark referral as paid
    await serviceClient
      .from('referrals')
      .update({
        status: 'paid',
        commission_amount: commission,
        paid_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Credit referrer's wallet
    if (commission > 0) {
      const { data: referrer } = await serviceClient
        .from('users')
        .select('wallet_balance')
        .eq('id', referral.referrer_id)
        .single()

      if (referrer) {
        await serviceClient
          .from('users')
          .update({ wallet_balance: Number(referrer.wallet_balance) + commission })
          .eq('id', referral.referrer_id)
      }
    }

    return Response.json({ success: true, commission })
  } catch (res) {
    if (res instanceof Response) return res
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
