import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/supabase/service'
import { getConfigNumber } from '@/lib/config'
import Dashboard from '@/components/Dashboard'
import { nanoid } from 'nanoid'

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

  // Use serviceClient to safely fetch user data (bypasses RLS issues on Vercel)
  let { data: profile } = await serviceClient
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Auto-heal missing profile row if user exists in auth but not in public.users
  if (!profile) {
    const referralCode = 'SNAP' + nanoid(6).toUpperCase()
    const { data: newProfile } = await serviceClient
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email ?? '',
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'User',
          referral_code: referralCode,
          role: 'user',
          wallet_balance: 0,
          post_count: 0,
          has_paid_platform_fee: false,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single()

    profile = newProfile || {
      id: user.id,
      email: user.email ?? '',
      name: 'User',
      referral_code: referralCode,
      role: 'user',
      wallet_balance: 0,
      post_count: 0,
      has_paid_platform_fee: false,
    }
  }

  // Fetch products, referrals, and config parameters in parallel
  const [
    { data: products },
    { data: initialReferrals },
    freeLimit,
    minWithdrawal,
    commissionAmount,
    platformFee,
  ] = await Promise.all([
    serviceClient
      .from('products')
      .select('id, title, images, status, created_at, offer_price, store')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    serviceClient
      .from('referrals')
      .select('id, referred_id, status, commission_amount, paid_at, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false }),
    getConfigNumber('free_post_limit', 10),
    getConfigNumber('min_withdrawal_amount', 200),
    getConfigNumber('referral_commission', 100),
    getConfigNumber('platform_fee_amount', 249),
  ])

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
