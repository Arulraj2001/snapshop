'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string
  name: string | null
  email: string
  referral_code: string | null
  post_count: number
  wallet_balance: number
  has_paid_platform_fee: boolean
  is_banned: boolean
  ban_reason: string | null
  role: string
  created_at: string
}

interface Product {
  id: string
  title: string
  status: string
  created_at: string
  store: string
  offer_price: number
  images: string[]
}

interface Referral {
  id: string
  referred_id: string
  status: string
  commission_amount: number
  created_at: string
  paid_at: string | null
}

interface Payment {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
  gateway_order_id: string | null
}

interface Props {
  user: UserProfile
  products: Product[]
  referrals: Referral[]
  payments: Payment[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(d))
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    approved: { bg: 'rgba(96,64,209,0.09)', color: '#6040d1' },
    paid: { bg: 'rgba(96,64,209,0.09)', color: '#6040d1' },
    success: { bg: 'rgba(22,163,74,0.09)', color: '#16a34a' },
    pending: { bg: 'rgba(186,176,193,0.2)', color: '#bab0c1' },
    rejected: { bg: 'rgba(220,38,38,0.09)', color: '#dc2626' },
    failed: { bg: 'rgba(220,38,38,0.09)', color: '#dc2626' },
  }
  const st = s[status] ?? s.pending
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: st.bg, color: st.color }}
    >
      {status}
    </span>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-xl border p-4 mb-4"
      style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}
    >
      <p className="font-semibold text-sm mb-3" style={{ color: '#000' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

// ─── Ban section ──────────────────────────────────────────────────────────────

function BanSection({
  userId,
  isBanned,
  banReason,
  onUpdate,
}: {
  userId: string
  isBanned: boolean
  banReason: string | null
  onUpdate: () => void
}) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBan() {
    if (!reason.trim()) { setError('Reason is required'); return }
    setLoading(true)
    const res = await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    setLoading(false)
    if (res.ok) { onUpdate() }
    else { const d = await res.json(); setError(d.error) }
  }

  async function handleUnban() {
    setLoading(true)
    const res = await fetch(`/api/admin/users/${userId}/unban`, { method: 'PATCH' })
    setLoading(false)
    if (res.ok) { onUpdate() }
  }

  return (
    <SectionCard title="Account Status">
      {isBanned ? (
        <div>
          <p className="text-xs mb-2" style={{ color: '#dc2626' }}>
            ⛔ This user is banned{banReason ? `: ${banReason}` : '.'}
          </p>
          {error && <p className="text-xs mb-2" style={{ color: '#dc2626' }}>{error}</p>}
          <button
            onClick={handleUnban}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer disabled:opacity-60"
            style={{ borderColor: '#16a34a', color: '#16a34a' }}
          >
            {loading ? 'Processing…' : 'Unban User'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Reason for banning this user…"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
            style={{ borderColor: '#d7d5dc', color: '#000' }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #6040d1')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          />
          {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
          <button
            onClick={handleBan}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer disabled:opacity-60"
            style={{ borderColor: '#dc2626', color: '#dc2626' }}
          >
            {loading ? 'Processing…' : 'Ban User'}
          </button>
        </div>
      )}
    </SectionCard>
  )
}

// ─── Wallet adjust section ────────────────────────────────────────────────────

function WalletSection({
  userId,
  currentBalance,
  onUpdate,
}: {
  userId: string
  currentBalance: number
  onUpdate: () => void
}) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleAdjust() {
    const amt = Number(amount)
    if (!amt || isNaN(amt)) { setError('Enter a non-zero amount'); return }
    setError(null); setSuccess(null)
    setLoading(true)
    const res = await fetch(`/api/admin/users/${userId}/wallet`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amt }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setSuccess(`Done. New balance: ₹${Number(data.newBalance).toLocaleString('en-IN')}`)
      setAmount('')
      onUpdate()
    } else { setError(data.error) }
  }

  return (
    <SectionCard title="Manual Wallet Adjustment">
      <p className="text-xs mb-2" style={{ color: '#bab0c1' }}>
        Current balance:{' '}
        <strong style={{ color: '#6040d1' }}>
          ₹{Number(currentBalance).toLocaleString('en-IN')}
        </strong>
      </p>
      <p className="text-xs mb-2" style={{ color: '#bab0c1' }}>
        Enter a positive number to credit, negative to debit.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: '#bab0c1' }}>₹</span>
          <input
            id="wallet-adjust-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100 or -50"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ paddingLeft: '1.75rem', borderColor: '#d7d5dc', color: '#000', backgroundColor: '#fff' }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #6040d1')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          />
        </div>
        <button
          id="wallet-adjust-submit"
          onClick={handleAdjust}
          disabled={loading}
          className="px-3 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#6040d1' }}
        >
          {loading ? '…' : 'Adjust'}
        </button>
      </div>
      {error && <p className="text-xs mt-1.5" style={{ color: '#dc2626' }}>{error}</p>}
      {success && <p className="text-xs mt-1.5" style={{ color: '#16a34a' }}>{success}</p>}
    </SectionCard>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function UserDetailPanel({
  user,
  products,
  referrals,
  payments,
}: Props) {
  const router = useRouter()

  return (
    <div>
      {/* Back */}
      <div className="mb-5">
        <Link
          href="/admin/users"
          className="text-sm"
          style={{ color: '#6040d1', textDecoration: 'none' }}
        >
          ← Users
        </Link>
        <h1 className="text-xl font-bold mt-1" style={{ color: '#000' }}>
          {user.name ?? user.email}
        </h1>
        <p className="text-sm" style={{ color: '#bab0c1' }}>
          {user.email} · joined {fmtDate(user.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ── Left column ────────────────────────────────────────────── */}
        <div>
          {/* Profile card */}
          <SectionCard title="Profile">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ['Email', user.email],
                ['Referral Code', user.referral_code ?? '—'],
                ['Role', user.role],
                ['Plan', user.has_paid_platform_fee ? 'Paid' : 'Free'],
                ['Posts', String(user.post_count ?? 0)],
                ['Wallet', `₹${Number(user.wallet_balance).toLocaleString('en-IN')}`],
              ].map(([label, val]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide" style={{ color: '#bab0c1' }}>{label}</dt>
                  <dd className="font-medium mt-0.5" style={{ color: '#000' }}>{val}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          {/* Ban / unban */}
          <BanSection
            userId={user.id}
            isBanned={user.is_banned}
            banReason={user.ban_reason}
            onUpdate={() => router.refresh()}
          />

          {/* Wallet adjust */}
          <WalletSection
            userId={user.id}
            currentBalance={user.wallet_balance}
            onUpdate={() => router.refresh()}
          />
        </div>

        {/* ── Right column ───────────────────────────────────────────── */}
        <div>
          {/* Their posts */}
          <SectionCard title={`Posts (${products.length})`}>
            {products.length === 0 ? (
              <p className="text-xs" style={{ color: '#bab0c1' }}>No posts yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {products.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-sm"
                      style={{ backgroundColor: '#f2f3fb' }}
                    >
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : '🛍️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#000' }}>{p.title}</p>
                      <p className="text-xs" style={{ color: '#bab0c1' }}>{p.store} · {fmtDate(p.created_at)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
                {products.length > 10 && (
                  <p className="text-xs" style={{ color: '#bab0c1' }}>
                    +{products.length - 10} more
                  </p>
                )}
              </div>
            )}
          </SectionCard>

          {/* Referrals they made */}
          <SectionCard title={`Referrals Made (${referrals.length})`}>
            {referrals.length === 0 ? (
              <p className="text-xs" style={{ color: '#bab0c1' }}>No referrals yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {referrals.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span style={{ color: '#000' }}>Member #{i + 1}</span>
                    <span style={{ color: '#bab0c1' }}>{fmtDate(r.created_at)}</span>
                    <StatusBadge status={r.status} />
                    <span style={{ color: r.status === 'paid' ? '#6040d1' : '#bab0c1' }}>
                      {r.status === 'paid' ? `₹${Number(r.commission_amount).toLocaleString('en-IN')}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Payment log */}
          <SectionCard title={`Payments (${payments.length})`}>
            {payments.length === 0 ? (
              <p className="text-xs" style={{ color: '#bab0c1' }}>No payments.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="capitalize font-medium" style={{ color: '#000' }}>
                        {p.type.replace(/_/g, ' ')}
                      </span>
                      <span className="ml-1" style={{ color: '#bab0c1' }}>
                        · {fmtDate(p.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: '#6040d1' }}>
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
