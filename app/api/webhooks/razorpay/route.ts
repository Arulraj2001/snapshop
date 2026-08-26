import { createHmac } from 'crypto'
import { serviceClient } from '@/lib/supabase/service'

/**
 * Razorpay sends webhooks with x-razorpay-signature header.
 * We verify using HMAC-SHA256 over the raw body with RAZORPAY_WEBHOOK_SECRET.
 * IMPORTANT: Must read the body as raw text before parsing to preserve exact bytes.
 */
export async function POST(request: Request) {
  // 1. Read raw body as text (critical — do NOT call request.json() first)
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  // 2. Verify webhook signature
  const expectedSig = createHmac(
    'sha256',
    process.env.RAZORPAY_WEBHOOK_SECRET!
  )
    .update(rawBody)
    .digest('hex')

  if (expectedSig !== signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 3. Parse event
  let event: {
    event: string
    payload: {
      payment: {
        entity: {
          id: string
          order_id: string
          notes?: Record<string, string>
        }
      }
    }
  }

  try {
    event = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 4. Only handle payment.captured
  if (event.event !== 'payment.captured') {
    return Response.json({ received: true }, { status: 200 })
  }

  const payment = event.payload.payment.entity
  const paymentId = payment.id
  const orderId = payment.order_id
  const notes = payment.notes ?? {}
  const type = notes.type
  const userId = notes.user_id

  if (type !== 'platform_fee' || !userId) {
    return Response.json({ received: true }, { status: 200 })
  }

  try {
    // ── Step 1: Mark payment as success ──────────────────────────────────────
    await serviceClient
      .from('payments')
      .update({ status: 'success', gateway_payment_id: paymentId })
      .eq('gateway_order_id', orderId)

    // ── Step 2: Unlock unlimited posting for the user ─────────────────────────
    await serviceClient
      .from('users')
      .update({ has_paid_platform_fee: true })
      .eq('id', userId)

    // ── Step 3: Process referral commission ───────────────────────────────────
    const { data: referral } = await serviceClient
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .single()

    if (referral) {
      // Read commission amount from platform_config
      const { data: configRow } = await serviceClient
        .from('platform_config')
        .select('value')
        .eq('key', 'referral_commission')
        .single()

      const commission = Number(configRow?.value ?? 0)

      // Mark referral as paid
      await serviceClient
        .from('referrals')
        .update({
          status: 'paid',
          commission_amount: commission,
          paid_at: new Date().toISOString(),
        })
        .eq('id', referral.id)

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
            .update({
              wallet_balance:
                Number(referrer.wallet_balance) + commission,
            })
            .eq('id', referral.referrer_id)
        }
      }
    }
  } catch (err) {
    // Log but don't surface — Razorpay expects 200 to avoid retries on logic errors
    console.error('[razorpay-webhook] error processing payment.captured:', err)
  }

  return Response.json({ received: true }, { status: 200 })
}
