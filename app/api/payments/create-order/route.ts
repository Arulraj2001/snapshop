import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/supabase/service'
import { getConfigNumber } from '@/lib/config'
import Razorpay from 'razorpay'

export async function POST() {
  try {
    // Auth: verify session (session client is fine for auth only)
    const sessionSupabase = await createClient()
    const {
      data: { user },
    } = await sessionSupabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Guard: if user has already paid, reject
    const { data: profile } = await serviceClient
      .from('users')
      .select('has_paid_platform_fee')
      .eq('id', user.id)
      .single()

    if (profile?.has_paid_platform_fee) {
      return Response.json(
        { error: 'Platform fee already paid.' },
        { status: 400 }
      )
    }

    // Idempotency: return existing pending order if one exists (created within last 30 min)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { data: existingPayment } = await serviceClient
      .from('payments')
      .select('gateway_order_id')
      .eq('user_id', user.id)
      .eq('type', 'platform_fee')
      .eq('status', 'pending')
      .gte('created_at', thirtyMinAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const fee = await getConfigNumber('platform_fee_amount')

    if (existingPayment?.gateway_order_id) {
      // Return existing order to avoid duplicate charges
      return Response.json({
        orderId: existingPayment.gateway_order_id,
        amount: fee * 100,
        key: process.env.RAZORPAY_KEY_ID,
      })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: fee * 100, // ₹ to paise
      currency: 'INR',
      notes: { user_id: user.id, type: 'platform_fee' },
    })

    // Insert pending payment record using serviceClient (bypasses RLS)
    await serviceClient.from('payments').insert({
      user_id: user.id,
      type: 'platform_fee',
      amount: fee,
      gateway_order_id: order.id,
      status: 'pending',
    })

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create order'
    return Response.json({ error: msg }, { status: 500 })
  }
}
