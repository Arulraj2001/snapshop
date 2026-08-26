import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id } = body

    if (!product_id || typeof product_id !== 'string') {
      return Response.json({ error: 'product_id required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get session — user_id is optional (anonymous clicks are valid)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from('clicks').insert({
      product_id,
      user_id: user?.id ?? null,
    })

    return Response.json({ ok: true }, { status: 200 })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
