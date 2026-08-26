import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UserDetailPanel from '@/components/admin/UserDetailPanel'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `snapShop Admin — User ${id.slice(0, 8)}` }
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: user },
    { data: products },
    { data: referrals },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('products')
      .select('id, title, status, created_at, store, offer_price, images')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('referrals')
      .select('id, referred_id, status, commission_amount, created_at, paid_at')
      .eq('referrer_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('id, type, amount, status, created_at, gateway_order_id')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!user) notFound()

  return (
    <UserDetailPanel
      user={user}
      products={products ?? []}
      referrals={referrals ?? []}
      payments={payments ?? []}
    />
  )
}
