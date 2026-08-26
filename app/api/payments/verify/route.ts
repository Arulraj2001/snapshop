import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/supabase/service'
import { getConfigNumber } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: 'Missing payment fields' }, { status: 400 })
    }

    // 1. Verify HMAC SHA256 signature FIRST — before any DB writes
    const signingString = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSig = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(signingString)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return Response.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // 2. Auth: get current user
    const sessionSupabase = await createClient()
    const {
      data: { user },
    } = await sessionSupabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Idempotency: check if this order was already processed
    const { data: existingPayment } = await serviceClient
      .from('payments')
      .select('status')
      .eq('gateway_order_id', razorpay_order_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingPayment?.status === 'success') {
      // Already processed — return success without re-crediting wallet
      return Response.json({ success: true, alreadyProcessed: true })
    }

    // 4. Mark payment as success (serviceClient bypasses RLS)
    await serviceClient
      .from('payments')
      .update({
        status: 'success',
        gateway_payment_id: razorpay_payment_id,
      })
      .eq('gateway_order_id', razorpay_order_id)
      .eq('user_id', user.id)

    // 5. Unlock unlimited posting for this user
    await serviceClient
      .from('users')
      .update({ has_paid_platform_fee: true })
      .eq('id', user.id)

    // 6. Credit referral commission to referrer (if applicable)
    await creditReferralIfEligible(user.id)

    return Response.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}

/**
 * When a user pays the platform fee, check if they were referred by someone.
 * If so, credit the referral commission to the referrer's wallet.
 * This is idempotent: only runs if referral status is still 'pending'.
 */
export async function creditReferralIfEligible(paidUserId: string) {
  try {
    // Find pending referral where this user was the referred person
    const { data: referral } = await serviceClient
      .from('referrals')
      .select('id, referrer_id, status')
      .eq('referred_id', paidUserId)
      .eq('status', 'pending')
      .maybeSingle()

    if (!referral) return // No pending referral — nothing to do

    // Get commission amount from platform config
    const commission = await getConfigNumber('referral_commission')

    // Mark referral as paid
    await serviceClient
      .from('referrals')
      .update({
        status: 'paid',
        commission_amount: commission,
        paid_at: new Date().toISOString(),
      })
      .eq('id', referral.id)

    // Credit commission to referrer wallet (atomic increment)
    const { data: referrer } = await serviceClient
      .from('users')
      .select('wallet_balance')
      .eq('id', referral.referrer_id)
      .single()

    if (referrer) {
      await serviceClient
        .from('users')
        .update({
          wallet_balance: Number(referrer.wallet_balance) + commission,
        })
        .eq('id', referral.referrer_id)
    }
  } catch (err) {
    // Log but don't throw — payment itself succeeded, referral credit can be retried
    console.error('[creditReferralIfEligible] error:', err)
  }
}
