import { requireAdmin } from '@/lib/adminAuth'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAdmin()
    const { id } = await params

    const { error } = await supabase
      .from('products')
      .update({
        status: 'approved',
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
