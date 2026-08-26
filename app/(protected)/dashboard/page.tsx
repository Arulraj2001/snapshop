import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getConfigNumber } from '@/lib/config'
import Dashboard from '@/components/Dashboard'

export const metadata: Metadata = {
  title: 'snapShop — Dashboard',
  description: 'Your snapShop dashboard — wallet, referrals, posts and earnings.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all dashboard data in parallel
  const [
    { data: profile },
    { data: products },
    { data: initialReferrals },
    freeLimit,
    minWithdrawal,
    commissionAmount,
    platformFee,
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('products')
      .select('id, title, images, status, created_at, offer_price, store')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('referrals')
      .select('id, referred_id, status, commission_amount, paid_at, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false }),
    getConfigNumber('free_post_limit'),
    getConfigNumber('min_withdrawal_amount'),
    getConfigNumber('referral_commission'),
    getConfigNumber('platform_fee_amount'),
  ])

  if (!profile) redirect('/login')

  return (
    <Dashboard
      userId={user.id}
      userName={profile.name ?? 'there'}
      userRole={profile.role ?? 'user'}
      initialBalance={Number(profile.wallet_balance ?? 0)}
      postCount={Number(profile.post_count ?? 0)}
      hasPaidFee={profile.has_paid_platform_fee ?? false}
      referralCode={profile.referral_code ?? ''}
      freeLimit={freeLimit}
      minWithdrawal={minWithdrawal}
      commissionAmount={commissionAmount}
      platformFee={platformFee}
      products={products ?? []}
      initialReferrals={initialReferrals ?? []}
    />
  )
}
