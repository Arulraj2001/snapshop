import type { Metadata } from 'next'
import { serviceClient } from '@/lib/supabase/service'
import PaymentsTable from '@/components/admin/PaymentsTable'
import PaginationBar from '@/components/admin/PaginationBar'

export const metadata: Metadata = { title: 'snapShop Admin — Payments' }

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const { status = 'all', page = '1' } = await searchParams
  const validStatus = ['all', 'success', 'pending', 'failed'].includes(status)
    ? status
    : 'all'
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = 20

  let query = serviceClient
    .from('payments')
    .select(`
      id, type, amount, status,
      gateway_order_id, gateway_payment_id,
      created_at, user_id,
      users!payments_user_id_fkey (name, email)
    `)
    .order('created_at', { ascending: false })

  if (validStatus !== 'all') {
    query = query.eq('status', validStatus)
  }

  query = query.range((pageNum - 1) * pageSize, pageNum * pageSize)

  const { data: rawPayments } = await query
  const payments = rawPayments?.slice(0, pageSize) ?? []
  const hasMore = (rawPayments?.length ?? 0) > pageSize

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#000' }}>
          Payments
        </h1>
        <p className="text-sm" style={{ color: '#bab0c1' }}>
          All platform fee transactions
        </p>
      </div>
      <PaymentsTable
        initialPayments={(payments ?? []) as unknown as import('@/components/admin/PaymentsTable').PaymentRow[]}
        currentStatus={validStatus}
      />
      <PaginationBar
        currentPage={pageNum}
        hasMore={hasMore}
        baseUrl="/admin/payments"
        searchParams={{ status: validStatus }}
      />
    </div>
  )
}
