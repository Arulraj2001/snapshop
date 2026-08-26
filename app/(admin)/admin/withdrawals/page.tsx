import type { Metadata } from 'next'
import { serviceClient } from '@/lib/supabase/service'
import WithdrawalsTable from '@/components/admin/WithdrawalsTable'
import PaginationBar from '@/components/admin/PaginationBar'

export const metadata: Metadata = { title: 'snapShop Admin — Withdrawals' }

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminWithdrawalsPage({ searchParams }: Props) {
  const { status = 'pending', page = '1' } = await searchParams
  const validStatus = ['pending', 'approved', 'rejected'].includes(status)
    ? status
    : 'pending'
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = 20

  const { data: rawWithdrawals } = await serviceClient
    .from('withdrawal_requests')
    .select(`
      id, amount, upi_id, status, reject_reason, created_at, user_id,
      users!withdrawal_requests_user_id_fkey (name, email, wallet_balance)
    `)
    .eq('status', validStatus)
    .order('created_at', { ascending: false })
    .range((pageNum - 1) * pageSize, pageNum * pageSize)

  const withdrawals = rawWithdrawals?.slice(0, pageSize) ?? []
  const hasMore = (rawWithdrawals?.length ?? 0) > pageSize

  // Compute total pending payout for the summary bar
  const totalPending =
    validStatus === 'pending'
      ? (withdrawals ?? []).reduce((s, w) => s + Number(w.amount), 0)
      : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#000' }}>
          Withdrawals
        </h1>
        <p className="text-sm" style={{ color: '#bab0c1' }}>
          Process user withdrawal requests
        </p>
      </div>
      <WithdrawalsTable
        initialWithdrawals={(withdrawals ?? []) as unknown as import('@/components/admin/WithdrawalsTable').WithdrawalRow[]}
        currentStatus={validStatus}
        totalPending={totalPending}
      />
      <PaginationBar
        currentPage={pageNum}
        hasMore={hasMore}
        baseUrl="/admin/withdrawals"
        searchParams={{ status: validStatus }}
      />
    </div>
  )
}
