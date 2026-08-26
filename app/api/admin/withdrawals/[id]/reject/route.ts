import { requireAdmin } from '@/lib/adminAuth'
import { serviceClient } from '@/lib/supabase/service'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason?.trim()) {
      return Response.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const { error } = await serviceClient
      .from('withdrawal_requests')
      .update({
        status: 'rejected',
        reject_reason: reason.trim(),
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'pending') // Safety: only reject pending requests

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Note: wallet balance is NOT deducted on rejection — money stays
    return Response.json({ success: true })
  } catch (res) {
    if (res instanceof Response) return res
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
