import { requireAdmin } from '@/lib/adminAuth'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin()
    const { id } = await params

    const { error } = await supabase
      .from('users')
      .update({ is_banned: false, ban_reason: null })
      .eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (res) {
    return res as Response
  }
}
