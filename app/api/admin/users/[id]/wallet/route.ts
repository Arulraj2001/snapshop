import { requireAdmin } from '@/lib/adminAuth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { amount } = body

    if (typeof amount !== 'number' || amount === 0) {
      return Response.json(
        { error: 'Amount must be a non-zero number' },
        { status: 400 }
      )
    }

    // Fetch current balance first to validate floor
    const { data: profile } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', id)
      .single()

    if (!profile) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const newBalance = Number(profile.wallet_balance) + amount
    if (newBalance < 0) {
      return Response.json(
        { error: 'Adjustment would bring wallet below ₹0' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true, newBalance })
  } catch (res) {
    return res as Response
  }
}
