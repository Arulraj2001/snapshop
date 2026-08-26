import { requireAdmin } from '@/lib/adminAuth'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin()
    const { id } = await params

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (res) {
    return res as Response
  }
}
