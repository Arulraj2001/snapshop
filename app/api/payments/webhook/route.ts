import { createHmac } from 'crypto'
import { serviceClient } from '@/lib/supabase/service'
import { creditReferralIfEligible } from '@/app/api/payments/verify/route'

/**
 * Razorpay Webhook Handler
 *
 * Setup in Razorpay Dashboard:
 *   Webhooks → Add New Webhook
 *   URL: https://yourdomain.com/api/payments/webhook
 *   Secret: set RAZORPAY_WEBHOOK_SECRET in .env.local
 *   Events: payment.captured
 *
 * This is a safety net: if the browser closes after Razorpay processes
 * the payment but before /api/payments/verify fires, this webhook ensures
 * the user still gets their paid status and referral commission.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature') ?? ''

    // 1. Verify webhook signature using RAZORPAY_WEBHOOK_SECRET
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not set')
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const expectedSig = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSig !== signature) {
      return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    // 2. Parse event
    const event = JSON.parse(rawBody)
    if (event.event !== 'payment.captured') {
      // Acknowledge but ignore other events
      return Response.json({ received: true })
    }

    const payment = event.payload?.payment?.entity
    if (!payment) {
      return Response.json({ error: 'Missing payment entity' }, { status: 400 })
    }

    const orderId: string = payment.order_id
    const paymentId: string = payment.id

    if (!orderId || !paymentId) {
      return Response.json({ error: 'Missing order_id or payment_id' }, { status: 400 })
    }

    // 3. Find the payment row in our DB (serviceClient bypasses RLS)
    const { data: paymentRow } = await serviceClient
      .from('payments')
      .select('id, user_id, status')
      .eq('gateway_order_id', orderId)
      .maybeSingle()

    if (!paymentRow) {
      // Payment not found in our DB — could be a test event, ignore safely
      console.warn('[webhook] Payment row not found for order:', orderId)
      return Response.json({ received: true })
    }

    // 4. Idempotency: already processed
    if (paymentRow.status === 'success') {
      return Response.json({ received: true, alreadyProcessed: true })
    }

    const userId: string = paymentRow.user_id

    // 5. Mark payment as success
    await serviceClient
      .from('payments')
      .update({
        status: 'success',
        gateway_payment_id: paymentId,
      })
      .eq('id', paymentRow.id)

    // 6. Unlock posting for user + credit welcome bonus
    const { getConfigNumber } = await import('@/lib/config')
    const welcomeBonus = await getConfigNumber('welcome_bonus_amount', 50)

    const { data: payingUser } = await serviceClient
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single()

    const currentBalance = Number(payingUser?.wallet_balance ?? 0)

    await serviceClient
      .from('users')
      .update({
        has_paid_platform_fee: true,
        wallet_balance: currentBalance + welcomeBonus,
      })
      .eq('id', userId)

    // 7. Credit referral commission if applicable (idempotent)
    await creditReferralIfEligible(userId)

    return Response.json({ received: true })
  } catch (err: unknown) {
    console.error('[webhook] Error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
