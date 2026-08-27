import { POST as handlePaymentWebhook } from '@/app/api/payments/webhook/route'

/**
/api/webhooks/razorpay route alias.
Delegates directly to /api/payments/webhook for unified logic.
*/
export async function POST(request: Request) {
  return handlePaymentWebhook(request)
}
