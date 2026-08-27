import { requireAdmin } from '@/lib/adminAuth'
import { serviceClient } from '@/lib/supabase/service'
import { getConfigNumber } from '@/lib/config'
import { creditReferralIfEligible } from '@/app/api/payments/verify/route'

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

    // Step 2: Unlock platform posting for the user + credit welcome bonus cashback
    const welcomeBonus = await getConfigNumber('welcome_bonus_amount', 50)
    const { data: payingUser } = await serviceClient
      .from('users')
      .select('wallet_balance')
      .eq('id', payment.user_id)
      .single()

    const currentBalance = Number(payingUser?.wallet_balance ?? 0)

    await serviceClient
      .from('users')
      .update({
        has_paid_platform_fee: true,
        wallet_balance: currentBalance + welcomeBonus,
      })
      .eq('id', payment.user_id)

    // Step 3: Process pending referral commission (idempotent)
    await creditReferralIfEligible(payment.user_id)

    return Response.json({ success: true })
  } catch (res) {
    if (res instanceof Response) return res
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
