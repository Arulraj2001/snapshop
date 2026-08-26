'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WithdrawalRow {
  id: string
  amount: number
  upi_id: string
  status: string
  reject_reason: string | null
  created_at: string
  user_id: string
  users:
    | { name: string; email: string; wallet_balance: number }
    | { name: string; email: string; wallet_balance: number }[]
    | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(d))
}

function getUser(users: WithdrawalRow['users']) {
  if (!users) return { name: 'Unknown', email: '', wallet_balance: 0 }
  const u = Array.isArray(users) ? users[0] : users
  return u ?? { name: 'Unknown', email: '', wallet_balance: 0 }
}

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    pending: { bg: 'rgba(234,179,8,0.1)', color: '#a16207' },
    approved: { bg: 'rgba(22,163,74,0.09)', color: '#15803d' },
    rejected: { bg: 'rgba(220,38,38,0.09)', color: '#dc2626' },
  }
  const st = s[status] ?? s.pending
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: st.bg, color: st.color }}>
      {status}
    </span>
  )
}

// ─── Approve Modal ────────────────────────────────────────────────────────────

function ApproveModal({
  withdrawal,
  userName,
  onConfirm,
  onCancel,
}: {
  withdrawal: WithdrawalRow
  userName: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}) {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!checked) { setError('Please confirm you have completed the UPI transfer'); return }
    setLoading(true)
    try { await onConfirm() } catch { setError('Failed. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-sm rounded-xl border p-5"
        style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}>
        <h3 className="font-semibold text-sm mb-1" style={{ color: '#000' }}>
          Confirm Withdrawal Payment
        </h3>
        <p className="text-xs mb-4" style={{ color: '#bab0c1' }}>
          You are about to mark ₹{Number(withdrawal.amount).toLocaleString('en-IN')} as paid
          to <strong style={{ color: '#000' }}>{withdrawal.upi_id}</strong> for{' '}
          <strong style={{ color: '#000' }}>{userName}</strong>.
        </p>

        {/* Summary box */}
        <div className="rounded-lg p-3 mb-4"
          style={{ backgroundColor: '#f2f3fb', border: '1px solid #d7d5dc' }}>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#bab0c1' }}>Amount</span>
            <span className="font-bold" style={{ color: '#6040d1' }}>
              ₹{Number(withdrawal.amount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#bab0c1' }}>UPI ID</span>
            <span className="font-medium" style={{ color: '#000' }}>{withdrawal.upi_id}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: '#bab0c1' }}>User</span>
            <span style={{ color: '#000' }}>{userName}</span>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            className="mt-0.5 cursor-pointer"
            style={{ accentColor: '#6040d1' }}
          />
          <span className="text-xs" style={{ color: '#000' }}>
            I have completed the UPI transfer and verified the recipient details.
          </span>
        </label>

        {error && <p className="text-xs mb-2" style={{ color: '#dc2626' }}>{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: '#6040d1' }}>
            {loading ? 'Processing…' : 'Confirm & Mark Approved'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm border cursor-pointer"
            style={{ borderColor: '#d7d5dc', color: '#000' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectInline({
  id,
  onDone,
  onCancel,
}: {
  id: string
  onDone: (id: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!reason.trim()) { setError('Reason required'); return }
    setLoading(true)
    const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    setLoading(false)
    if (res.ok) { onDone(id) }
    else { const d = await res.json(); setError(d.error) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-sm rounded-xl border p-5"
        style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}>
        <h3 className="font-semibold text-sm mb-3" style={{ color: '#000' }}>
          Rejection Reason
        </h3>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="Why is this withdrawal being rejected?"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
          style={{ borderColor: '#d7d5dc', color: '#000' }}
          onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px #6040d1')}
          onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
        />
        {error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{error}</p>}
        <div className="flex gap-2 mt-3">
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: '#dc2626' }}>
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm border cursor-pointer"
            style={{ borderColor: '#d7d5dc', color: '#000' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WithdrawalsTable({
  initialWithdrawals,
  currentStatus,
  totalPending,
}: {
  initialWithdrawals: WithdrawalRow[]
  currentStatus: string
  totalPending: number
}) {
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>(initialWithdrawals)
  const [approvingItem, setApprovingItem] = useState<WithdrawalRow | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [processing, setProcessing] = useState<Set<string>>(new Set())

  function removeRow(id: string) {
    setWithdrawals(prev => prev.filter(w => w.id !== id))
  }

  async function doApprove(id: string) {
    const res = await fetch(`/api/admin/withdrawals/${id}/approve`, { method: 'PATCH' })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error)
    }
    setApprovingItem(null)
    removeRow(id)
  }

  return (
    <>
      {/* Modals */}
      {approvingItem && (
        <ApproveModal
          withdrawal={approvingItem}
          userName={getUser(approvingItem.users).name}
          onConfirm={() => doApprove(approvingItem.id)}
          onCancel={() => setApprovingItem(null)}
        />
      )}
      {rejectingId && (
        <RejectInline
          id={rejectingId}
          onDone={(id) => { removeRow(id); setRejectingId(null) }}
          onCancel={() => setRejectingId(null)}
        />
      )}

      {/* Status tabs */}
      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map(tab => {
          const active = currentStatus === tab
          return (
            <button key={tab} id={`wd-tab-${tab}`}
              onClick={() => router.push(`/admin/withdrawals?status=${tab}`)}
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

      {/* Pending summary bar */}
      {currentStatus === 'pending' && withdrawals.length > 0 && (
        <div
          className="rounded-xl border px-4 py-3 mb-4 flex items-center justify-between"
          style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}>
          <p className="text-sm" style={{ color: '#000' }}>
            Total pending payout
          </p>
          <p className="text-sm font-bold" style={{ color: '#6040d1' }}>
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: '#bab0c1' }}>
            No {currentStatus} withdrawals.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead style={{ borderBottom: '1px solid #f2f3fb' }}>
                <tr>
                  {['User', 'Wallet', 'Amount', 'UPI ID', 'Requested', 'Status', 'Actions'].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#bab0c1' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w, i) => {
                  const user = getUser(w.users)
                  const busy = processing.has(w.id)
                  return (
                    <tr key={w.id}
                      style={{
                        borderBottom: i < withdrawals.length - 1 ? '1px solid #f2f3fb' : 'none',
                        opacity: busy ? 0.5 : 1,
                      }}>
                      {/* User */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs" style={{ color: '#000' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: '#bab0c1' }}>{user.email}</p>
                      </td>
                      {/* Wallet balance */}
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: '#000' }}>
                        ₹{Number(user.wallet_balance).toLocaleString('en-IN')}
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3 font-bold" style={{ color: '#6040d1' }}>
                        ₹{Number(w.amount).toLocaleString('en-IN')}
                      </td>
                      {/* UPI ID */}
                      <td className="px-4 py-3">
                        <code className="text-xs font-semibold" style={{ color: '#000' }}>
                          {w.upi_id}
                        </code>
                      </td>
                      {/* Requested date */}
                      <td className="px-4 py-3 text-xs" style={{ color: '#bab0c1' }}>
                        {fmtDate(w.created_at)}
                        {w.reject_reason && (
                          <p className="text-xs mt-0.5 max-w-[150px] truncate"
                            style={{ color: '#dc2626' }}
                            title={w.reject_reason}>
                            {w.reject_reason}
                          </p>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-right">
                        <StatusBadge status={w.status} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {w.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setApprovingItem(w)}
                              disabled={busy}
                              className="px-2 py-1 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
                              style={{ backgroundColor: '#6040d1' }}>
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(w.id)}
                              disabled={busy}
                              className="px-2 py-1 rounded-lg text-xs border cursor-pointer disabled:opacity-50"
                              style={{ borderColor: '#d7d5dc', color: '#000' }}>
                              Reject
                            </button>
                          </div>
                        )}
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
