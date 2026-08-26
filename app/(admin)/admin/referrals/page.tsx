import type { Metadata } from 'next'
import { serviceClient } from '@/lib/supabase/service'
import ReferralsTable from '@/components/admin/ReferralsTable'
import PaginationBar from '@/components/admin/PaginationBar'

export const metadata: Metadata = { title: 'snapShop Admin — Referrals' }

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminReferralsPage({ searchParams }: Props) {
  const { status = 'all', page = '1' } = await searchParams
  const validStatus = ['all', 'paid', 'pending'].includes(status) ? status : 'all'
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = 20

  let query = serviceClient
    .from('referrals')
    .select(`
      id, status, commission_amount, paid_at, created_at,
      referrer_id, referred_id,
      referrer:users!referrals_referrer_id_fkey (name, email),
      referred:users!referrals_referred_id_fkey (name, email, has_paid_platform_fee)
    `)
    .order('created_at', { ascending: false })

  if (validStatus !== 'all') {
    query = query.eq('status', validStatus)
  }

  query = query.range((pageNum - 1) * pageSize, pageNum * pageSize)

  const { data: rawReferrals } = await query
  const referrals = rawReferrals?.slice(0, pageSize) ?? []
  const hasMore = (rawReferrals?.length ?? 0) > pageSize

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#000' }}>
          Referrals
        </h1>
        <p className="text-sm" style={{ color: '#bab0c1' }}>
          Referral chain and commission payouts
        </p>
      </div>
      <ReferralsTable
        initialReferrals={(referrals ?? []) as unknown as import('@/components/admin/ReferralsTable').ReferralRow[]}
        currentStatus={validStatus}
      />
      <PaginationBar
        currentPage={pageNum}
        hasMore={hasMore}
        baseUrl="/admin/referrals"
        searchParams={{ status: validStatus }}
      />
    </div>
  )
}
