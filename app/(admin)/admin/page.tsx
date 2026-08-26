import type { Metadata } from 'next'
import Link from 'next/link'
import { serviceClient } from '@/lib/supabase/service'
import { getConfigNumber } from '@/lib/config'

export const metadata: Metadata = {
  title: 'snapShop Admin — Overview',
  description: 'snapShop administration overview.',
}

// Helper for stat cards
function StatCard({
  label,
  value,
  accentColor = '#6040d1',
}: {
  label: string
  value: string
  accentColor?: string
}) {
  return (
    <div
      className="rounded-xl border p-4 flex gap-3"
      style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
    >
      {/* Left accent bar */}
      <div
        className="w-1 rounded-full shrink-0"
        style={{ backgroundColor: accentColor }}
      />
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: '#bab0c1' }}
        >
          {label}
        </p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: '#000' }}>
          {value}
        </p>
      </div>
    </div>
  )
}

export default async function AdminOverviewPage() {
  const commission = await getConfigNumber('referral_commission')

  // Build today's date range in ISO format
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [
    { count: totalUsers },
    { count: pendingProducts },
    { count: approvedProducts },
    { data: todayPayments },
    { data: allPayments },
    { count: pendingWithdrawals },
    { count: paidReferrals },
  ] = await Promise.all([
    serviceClient
      .from('users')
      .select('*', { count: 'exact', head: true }),
    serviceClient
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    serviceClient
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    serviceClient
      .from('payments')
      .select('amount')
      .eq('status', 'success')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString()),
    serviceClient.from('payments').select('amount').eq('status', 'success'),
    serviceClient
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    serviceClient
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid'),
  ])

  const revenueToday = (todayPayments ?? []).reduce(
    (s, p) => s + Number(p.amount),
    0
  )
  const revenueTotal = (allPayments ?? []).reduce(
    (s, p) => s + Number(p.amount),
    0
  )
  const referralPayouts = (paidReferrals ?? 0) * commission

  const fmt = (n: number) =>
    '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#000' }}>
          Overview
        </h1>
        <p className="text-sm" style={{ color: '#bab0c1' }}>
          Platform health at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={String(totalUsers ?? 0)}
        />
        <StatCard
          label="Pending Reviews"
          value={String(pendingProducts ?? 0)}
          accentColor={(pendingProducts ?? 0) > 0 ? '#f59e0b' : '#6040d1'}
        />
        <StatCard
          label="Approved Products"
          value={String(approvedProducts ?? 0)}
        />
        <StatCard
          label="Revenue Today"
          value={fmt(revenueToday)}
        />
        <StatCard
          label="Total Revenue"
          value={fmt(revenueTotal)}
        />
        <StatCard
          label="Referral Payouts"
          value={fmt(referralPayouts)}
        />
        <StatCard
          label="Pending Withdrawals"
          value={String(pendingWithdrawals ?? 0)}
          accentColor={(pendingWithdrawals ?? 0) > 0 ? '#f59e0b' : '#6040d1'}
        />
        <StatCard
          label="Paid Referrals"
          value={String(paidReferrals ?? 0)}
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products?status=pending"
          id="admin-review-pending"
          className="inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: '#6040d1', textDecoration: 'none' }}
        >
          Review Pending Products
          {(pendingProducts ?? 0) > 0 && (
            <span
              className="ml-2 rounded-full px-1.5 py-0.5 text-xs"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            >
              {pendingProducts}
            </span>
          )}
        </Link>
        <Link
          href="/admin/withdrawals?status=pending"
          id="admin-process-withdrawals"
          className="inline-block rounded-lg px-4 py-2 text-sm font-semibold border"
          style={{
            borderColor: '#d7d5dc',
            color: '#000',
            textDecoration: 'none',
          }}
        >
          Process Withdrawals
          {(pendingWithdrawals ?? 0) > 0 && (
            <span
              className="ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: '#f59e0b', color: '#fff' }}
            >
              {pendingWithdrawals}
            </span>
          )}
        </Link>
      </div>
    </div>
  )
}
