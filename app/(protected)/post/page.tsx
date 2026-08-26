import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getConfigBool, getConfigNumber } from '@/lib/config'
import PostForm from '@/components/PostForm'

export const metadata: Metadata = {
  title: 'snapShop — Post a Deal',
  description: 'Share an affiliate deal with the snapShop community.',
}

export default async function PostPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Parallel fetch: user profile, daily post count, and dynamic platform config
  const [
    { data: profile },
    { count: todayPostCount },
    freeLimit,
    platformFee,
    maxPostsPerDay,
    requiresApproval,
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo),
    getConfigNumber('free_post_limit'),
    getConfigNumber('platform_fee_amount'),
    getConfigNumber('max_posts_per_day'),
    getConfigBool('new_posts_require_approval'),
  ])

  if (!profile) redirect('/login')

  // Banned check
  if (profile.is_banned) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#f2f3fb' }}
      >
        <div
          className="max-w-sm w-full rounded-xl border p-6 text-center"
          style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}
        >
          <span className="text-3xl">🚫</span>
          <h1 className="text-lg font-semibold mt-3" style={{ color: '#000' }}>
            Account Suspended
          </h1>
          <p className="text-sm mt-2" style={{ color: '#bab0c1' }}>
            Your account has been suspended.
            {profile.ban_reason && (
              <>
                {' '}
                Reason: <em>{profile.ban_reason}</em>
              </>
            )}
          </p>
          <p className="text-sm mt-3" style={{ color: '#bab0c1' }}>
            Contact support if you believe this is a mistake.
          </p>
        </div>
      </div>
    )
  }

  const showPaywall =
    profile.post_count >= freeLimit && !profile.has_paid_platform_fee

  return (
    <PostForm
      userId={user.id}
      postCount={profile.post_count}
      todayPostCount={todayPostCount ?? 0}
      freeLimit={freeLimit}
      platformFee={platformFee}
      maxPostsPerDay={maxPostsPerDay}
      hasPaidFee={profile.has_paid_platform_fee}
      requiresApproval={requiresApproval}
      initialShowPaywall={showPaywall}
    />
  )
}
