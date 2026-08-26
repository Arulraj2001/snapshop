import { requireAdmin } from '@/lib/adminAuth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason?.trim()) {
      return Response.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('products')
      .update({
        status: 'rejected',
        reject_reason: reason.trim(),
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (res) {
    return res as Response
  }
}
