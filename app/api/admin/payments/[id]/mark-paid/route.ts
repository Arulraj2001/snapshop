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

    // Fetch the payment record
    const { data: payment, error: fetchErr } = await serviceClient
      .from('payments')
      .select('id, user_id, status, amount')
      .eq('id', id)
      .single()

    if (fetchErr || !payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 })
    }
    if (payment.status === 'success') {
      return Response.json({ error: 'Payment already marked as paid' }, { status: 400 })
    }

    // Step 1: Mark payment as success
    await serviceClient
      .from('payments')
      .update({ status: 'success' })
      .eq('id', id)

    // Step 2: Unlock platform posting for the user
    await serviceClient
      .from('users')
      .update({ has_paid_platform_fee: true })
      .eq('id', payment.user_id)

    // Step 3: Process pending referral commission (mirror webhook logic)
    const { data: referral } = await serviceClient
      .from('referrals')
      .select('*')
      .eq('referred_id', payment.user_id)
      .eq('status', 'pending')
      .single()

    if (referral) {
      const commission = await getConfigNumber('referral_commission')

      await serviceClient
        .from('referrals')
        .update({
          status: 'paid',
          commission_amount: commission,
          paid_at: new Date().toISOString(),
        })
        .eq('id', referral.id)

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
    }

    return Response.json({ success: true })
  } catch (res) {
    if (res instanceof Response) return res
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
