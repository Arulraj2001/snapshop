'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReferralRow {
  id: string
  status: 'pending' | 'paid'
  commission_amount: number
  paid_at: string | null
  created_at: string
  referrer_id: string
  referred_id: string
  referrer: { name: string; email: string } | { name: string; email: string }[] | null
  referred: { name: string; email: string; has_paid_platform_fee: boolean }
    | { name: string; email: string; has_paid_platform_fee: boolean }[]
    | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(d))
}

function getField<T>(val: T | T[] | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? (val[0] ?? null) : val
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    paid: { bg: 'rgba(96,64,209,0.09)', color: '#6040d1' },
    pending: { bg: 'rgba(234,179,8,0.1)', color: '#a16207' },
  }
  const st = s[status] ?? s.pending
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: st.bg, color: st.color }}>
      {status}
    </span>
  )
}

const STATUS_TABS = ['all', 'paid', 'pending'] as const

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReferralsTable({
  initialReferrals,
  currentStatus,
}: {
  initialReferrals: ReferralRow[]
  currentStatus: string
}) {
  const router = useRouter()
  const [referrals, setReferrals] = useState<ReferralRow[]>(initialReferrals)
  const [processing, setProcessing] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  function setProc(id: string, on: boolean) {
    setProcessing(prev => { const s = new Set(prev); on ? s.add(id) : s.delete(id); return s })
  }

  async function credit(id: string) {
    setError(null)
    setProc(id, true)
    const res = await fetch(`/api/admin/referrals/${id}/credit`, { method: 'PATCH' })
    const data = await res.json()
    setProc(id, false)
    if (res.ok) {
      setReferrals(prev => prev.map(r =>
        r.id === id
          ? { ...r, status: 'paid', commission_amount: data.commission, paid_at: new Date().toISOString() }
          : r
      ))
    } else {
      setError(data.error)
    }
  }

  async function reverse(id: string) {
    if (!confirm('Reverse this referral? The commission will be deducted from the referrer\'s wallet.')) return
    setError(null)
    setProc(id, true)
    const res = await fetch(`/api/admin/referrals/${id}/reverse`, { method: 'PATCH' })
    const data = await res.json()
    setProc(id, false)
    if (res.ok) {
      setReferrals(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'pending', commission_amount: 0, paid_at: null } : r
      ))
    } else {
      setError(data.error)
    }
  }

  return (
    <>
      {/* Status tabs */}
      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map(tab => {
          const active = currentStatus === tab
          return (
            <button key={tab} id={`ref-tab-${tab}`}
              onClick={() => router.push(`/admin/referrals?status=${tab}`)}
              className="px-4 py-1.5 rounded-full text-sm font-medium capitalize cursor-pointer border"
              style={{
                backgroundColor: active ? '#6040d1' : '#fff',
                color: active ? '#fff' : '#000',
                borderColor: active ? '#6040d1' : '#d7d5dc',
              }}>
              {tab}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-xs mb-3 px-1" style={{ color: '#dc2626' }}>{error}</p>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}>
        {referrals.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: '#bab0c1' }}>
            No referrals found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead style={{ borderBottom: '1px solid #f2f3fb' }}>
                <tr>
                  {['Referrer', 'Referred User', 'Joined', 'Fee Paid', 'Commission', 'Status', 'Actions'].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#bab0c1' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, i) => {
                  const referrer = getField(r.referrer)
                  const referred = getField(r.referred)
                  const busy = processing.has(r.id)
                  const referredHasPaid = referred?.has_paid_platform_fee ?? false
                  return (
                    <tr key={r.id}
                      style={{
                        borderBottom: i < referrals.length - 1 ? '1px solid #f2f3fb' : 'none',
                        opacity: busy ? 0.5 : 1,
                      }}>
                      {/* Referrer */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs" style={{ color: '#000' }}>{referrer?.name ?? '—'}</p>
                        <p className="text-xs" style={{ color: '#bab0c1' }}>{referrer?.email ?? ''}</p>
                      </td>
                      {/* Referred */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs" style={{ color: '#000' }}>{referred?.name ?? '—'}</p>
                        <p className="text-xs" style={{ color: '#bab0c1' }}>{referred?.email ?? ''}</p>
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3 text-xs" style={{ color: '#bab0c1' }}>
                        {fmtDate(r.created_at)}
                      </td>
                      {/* Fee Paid */}
                      <td className="px-4 py-3">
                        <span className="text-xs rounded-full px-2 py-0.5 font-medium"
                          style={{
                            backgroundColor: referredHasPaid ? 'rgba(22,163,74,0.09)' : '#d7d5dc',
                            color: referredHasPaid ? '#15803d' : '#bab0c1',
                          }}>
                          {referredHasPaid ? 'Yes' : 'No'}
                        </span>
                      </td>
                      {/* Commission */}
                      <td className="px-4 py-3 font-semibold text-xs"
                        style={{ color: r.status === 'paid' ? '#6040d1' : '#bab0c1' }}>
                        {r.status === 'paid'
                          ? `₹${Number(r.commission_amount).toLocaleString('en-IN')}`
                          : '—'}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-right">
                        <StatusBadge status={r.status} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'pending' && referredHasPaid && (
                            <button
                              onClick={() => credit(r.id)}
                              disabled={busy}
                              className="px-2 py-1 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
                              style={{ backgroundColor: '#6040d1' }}>
                              Credit
                            </button>
                          )}
                          {r.status === 'paid' && (
                            <button
                              onClick={() => reverse(r.id)}
                              disabled={busy}
                              className="px-2 py-1 text-xs font-medium cursor-pointer disabled:opacity-50"
                              style={{ color: '#dc2626', background: 'none', border: 'none' }}>
                              Reverse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
