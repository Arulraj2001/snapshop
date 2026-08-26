'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useWallet } from '@/hooks/useWallet'
import { useReferrals } from '@/hooks/useReferrals'
import { getReferralLink } from '@/lib/referral'
import ReferralLinkCard from '@/components/ReferralLink'
import WithdrawalForm from '@/components/WithdrawalForm'
import PaywallModal from '@/components/PaywallModal'

interface Product {
  id: string
  title: string
  images: string[]
  status: string
  created_at: string
  offer_price: number
  store: string
}

interface Referral {
  id: string
  referred_id: string
  status: 'pending' | 'paid'
  commission_amount: number
  paid_at: string | null
  created_at: string
}

interface DashboardProps {
  userId: string
  userName: string
  userRole?: string
  initialBalance: number
  postCount: number
  hasPaidFee: boolean
  referralCode: string
  freeLimit: number
  minWithdrawal: number
  commissionAmount: number
  platformFee?: number
  products: Product[]
  initialReferrals: Referral[]
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: 'Approved' },
  paid: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: 'Paid' },
  pending: { bg: 'rgba(234,179,8,0.15)', color: '#ca8a04', label: 'Pending' },
  rejected: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', label: 'Rejected' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

export default function Dashboard({
  userId,
  userName,
  userRole = 'user',
  initialBalance,
  postCount,
  hasPaidFee,
  referralCode,
  freeLimit,
  minWithdrawal,
  commissionAmount,
  platformFee = 249,
  products,
  initialReferrals,
}: DashboardProps) {
  const [showPaywall, setShowPaywall] = useState(false)
  const [paidLocally, setPaidLocally] = useState(hasPaidFee)
  const balance = useWallet(userId, initialBalance)
  const {
    referrals: hookReferrals,
    paidCount: hookPaidCount,
    pendingCount: hookPendingCount,
    loading: referralsLoading,
  } = useReferrals(userId)

  const referrals = referralsLoading ? initialReferrals : hookReferrals
  const paidCount = referralsLoading
    ? initialReferrals.filter((r) => r.status === 'paid').length
    : hookPaidCount
  const pendingCount = referralsLoading
    ? initialReferrals.filter((r) => r.status === 'pending').length
    : hookPendingCount

  const referralLink = getReferralLink(referralCode)
  const remaining = Math.max(0, freeLimit - postCount)
  const isUnlocked = paidLocally // local state updates immediately after payment

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#f2f3fb' }}>
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Admin Banner */}
          {userRole === 'admin' && (
            <div
              className="rounded-2xl border p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#6040d1',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 text-white shadow-xs"
                  style={{ backgroundColor: '#6040d1' }}
                >
                  ⚡
                </div>
                <div>
                  <p className="text-base font-extrabold text-[#6040d1]">Admin Controls Active</p>
                  <p className="text-xs text-gray-500">
                    Moderate user posts, manage payments, process withdrawal requests &amp; system config.
                  </p>
                </div>
              </div>
              <Link
                href="/admin"
                id="dashboard-admin-btn"
                className="w-full sm:w-auto text-center rounded-xl px-5 py-2.5 text-xs font-bold text-white transition shrink-0 cursor-pointer shadow-xs"
                style={{ backgroundColor: '#6040d1', textDecoration: 'none' }}
              >
                Open Admin Panel →
              </Link>
            </div>
          )}

          {/* Header row */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black">Dashboard 📊</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, {userName} 👋</p>
            </div>
            {userRole === 'admin' && (
              <span className="text-xs font-bold rounded-full px-3 py-1 text-white bg-[#6040d1] shadow-xs">
                Admin Profile
              </span>
            )}
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {/* Wallet Balance */}
            <div className="rounded-2xl border p-5 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Wallet Balance</span>
                <span className="text-xl">💰</span>
              </div>
              <p className="text-3xl font-extrabold text-[#6040d1] tabular-nums">
                ₹{balance.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Min. ₹{minWithdrawal.toLocaleString('en-IN')} threshold to withdraw
              </p>
            </div>

            {/* Paid Referrals */}
            <div className="rounded-2xl border p-5 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Paid Referrals</span>
                <span className="text-xl">👥</span>
              </div>
              <p className="text-3xl font-extrabold text-black tabular-nums">{paidCount}</p>
              <p className="text-xs text-gray-400 mt-1">
                {pendingCount > 0 ? `${pendingCount} pending payment` : 'No pending referrals'}
              </p>
            </div>

            {/* Posts Used / Upgrade CTA */}
            {isUnlocked ? (
              <div className="rounded-2xl border p-5 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Posts Used</span>
                  <span className="text-xl">📝</span>
                </div>
                <p className="text-3xl font-extrabold text-black tabular-nums">{postCount}</p>
                <p className="text-xs mt-1 font-semibold" style={{ color: '#16a34a' }}>
                  ✓ Unlimited posting unlocked
                </p>
              </div>
            ) : (
              /* Upgrade CTA card for free users */
              <div
                className="rounded-2xl border p-5 bg-white shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
                style={{ borderColor: '#6040d1', borderWidth: '1.5px' }}
                onClick={() => setShowPaywall(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6040d1' }}>Posts Used</span>
                  <span className="text-xl">🚀</span>
                </div>
                <p className="text-3xl font-extrabold text-black tabular-nums">
                  {postCount}<span className="text-lg font-normal text-gray-400"> / {freeLimit}</span>
                </p>
                <p className="text-xs mt-1 font-semibold text-gray-400">
                  {remaining} free post{remaining !== 1 ? 's' : ''} remaining
                </p>
                <button
                  className="mt-3 w-full rounded-lg py-1.5 text-xs font-bold text-white cursor-pointer"
                  style={{ backgroundColor: '#6040d1' }}
                  onClick={(e) => { e.stopPropagation(); setShowPaywall(true) }}
                >
                  Upgrade — ₹{platformFee} Unlock Unlimited
                </button>
              </div>
            )}
          </div>

          {/* Desktop 2-Column Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Referral Link + Withdrawal */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Referral Link — gated to paid users only */}
              {isUnlocked ? (
                <ReferralLinkCard link={referralLink} commissionAmount={commissionAmount} />
              ) : (
                <div
                  className="rounded-2xl border p-5 bg-white shadow-xs"
                  style={{ borderColor: '#d7d5dc' }}
                >
                  <p className="font-semibold text-sm text-black mb-1">Your Referral Link</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Earn ₹{commissionAmount.toLocaleString('en-IN')} for every user who joins and pays via your link.
                  </p>
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed"
                    style={{ borderColor: '#d7d5dc', backgroundColor: '#f9f9fc' }}
                  >
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="text-sm font-bold text-black">Referral link locked</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pay the one-time platform fee to unlock your referral link and start earning.
                      </p>
                    </div>
                  </div>
                  <button
                    id="dashboard-unlock-referral"
                    onClick={() => setShowPaywall(true)}
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#6040d1' }}
                  >
                    🚀 Unlock — Pay ₹{platformFee} One-Time Fee
                  </button>
                </div>
              )}

              {/* Withdrawal — only shown to paid members with balance */}
              {isUnlocked && balance > 0 && (
                <WithdrawalForm balance={balance} minWithdrawal={minWithdrawal} />
              )}

              {/* Referral History Table */}
              <div className="rounded-2xl border p-6 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span>🔗</span> Referral History
                  </h3>
                  <span className="text-xs text-gray-400 font-semibold">{referrals.length} Total</span>
                </div>

                {/* Legend */}
                {referrals.length > 0 && (
                  <div className="flex gap-3 mb-4">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#ca8a04' }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#ca8a04' }} />
                      Pending — referred person hasn&apos;t paid yet
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#16a34a' }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#16a34a' }} />
                      Paid — ₹{commissionAmount} credited
                    </span>
                  </div>
                )}

                {referrals.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed rounded-xl" style={{ borderColor: '#f2f3fb' }}>
                    <span className="text-3xl mb-2 block">👥</span>
                    <p className="text-sm font-semibold text-gray-600">No referrals recorded yet</p>
                    <p className="text-xs text-gray-400 mt-1">Share your link to earn ₹{commissionAmount} per verified join!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b text-xs font-bold uppercase text-gray-400" style={{ borderColor: '#f2f3fb' }}>
                          <th className="pb-3">User</th>
                          <th className="pb-3">Joined Date</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map((r, i) => (
                          <tr key={r.id} className="border-b last:border-b-0 text-xs" style={{ borderColor: '#f2f3fb' }}>
                            <td className="py-3 font-semibold text-black">Member #{i + 1}</td>
                            <td className="py-3 text-gray-500">{formatDate(r.created_at)}</td>
                            <td className="py-3"><StatusBadge status={r.status} /></td>
                            <td className="py-3 text-right font-extrabold text-[#6040d1]">
                              {r.status === 'paid' ? `₹${Number(r.commission_amount).toLocaleString('en-IN')}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): My Submitted Posts */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-2xl border p-6 bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span>🛍️</span> My Submitted Deals
                  </h3>
                  <Link href="/post" className="text-xs font-bold text-[#6040d1] hover:underline" style={{ textDecoration: 'none' }}>
                    + Post Deal
                  </Link>
                </div>

                {products.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed rounded-xl" style={{ borderColor: '#f2f3fb' }}>
                    <span className="text-3xl mb-2 block">🛍️</span>
                    <p className="text-sm font-semibold text-gray-600">No deal posts yet</p>
                    <Link
                      href="/post"
                      className="mt-3 inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6040d1] shadow-xs"
                      style={{ textDecoration: 'none' }}
                    >
                      Post Your First Deal →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 rounded-xl border hover:bg-slate-50 transition-colors"
                        style={{ borderColor: '#f2f3fb' }}
                      >
                        <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border aspect-square flex items-center justify-center bg-slate-100" style={{ borderColor: '#d7d5dc' }}>
                          {p.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🛍️</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-black truncate">{p.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.store} · <span className="font-semibold text-[#6040d1]">₹{Number(p.offer_price).toLocaleString('en-IN')}</span>
                          </p>
                        </div>

                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* PaywallModal — shown from Upgrade button or locked referral section */}
      {showPaywall && (
        <PaywallModal
          platformFee={platformFee}
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false)
            setPaidLocally(true)
          }}
        />
      )}
    </div>
  )
}
