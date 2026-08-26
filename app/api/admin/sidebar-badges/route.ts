import { requireAdmin } from '@/lib/adminAuth'
import { serviceClient } from '@/lib/supabase/service'

export async function GET() {
  try {
    await requireAdmin()

    const [
      { count: pendingProductsCount },
      { count: pendingWithdrawalsCount },
      { count: unreadMessagesCount },
    ] = await Promise.all([
      serviceClient
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      serviceClient
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      serviceClient
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread'),
    ])

    return Response.json({
      '/admin/products': pendingProductsCount ?? 0,
      '/admin/withdrawals': pendingWithdrawalsCount ?? 0,
      '/admin/messages': unreadMessagesCount ?? 0,
    })
  } catch (res) {
    if (res instanceof Response) return res
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
