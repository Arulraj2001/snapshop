'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentRow {
  id: string
  type: string
  amount: number
  status: string
  gateway_order_id: string | null
  gateway_payment_id: string | null
  created_at: string
  user_id: string
  users: { name: string; email: string } | { name: string; email: string }[] | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(d))
}

function getUser(users: PaymentRow['users']) {
  if (!users) return { name: 'Unknown', email: '' }
  const u = Array.isArray(users) ? users[0] : users
  return u ?? { name: 'Unknown', email: '' }
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  success: { bg: 'rgba(22,163,74,0.09)', color: '#15803d' },
  pending: { bg: 'rgba(234,179,8,0.1)', color: '#a16207' },
  failed: { bg: 'rgba(220,38,38,0.09)', color: '#dc2626' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.pending
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

const STATUS_TABS = ['all', 'success', 'pending', 'failed'] as const

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PaymentsTable({
  initialPayments,
  currentStatus,
}: {
  initialPayments: PaymentRow[]
  currentStatus: string
}) {
  const router = useRouter()
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processing, setProcessing] = useState<Set<string>>(new Set())

  function setProc(id: string, on: boolean) {
    setProcessing(prev => { const s = new Set(prev); on ? s.add(id) : s.delete(id); return s })
  }

  async function markPaid(id: string) {
    setProc(id, true)
    const res = await fetch(`/api/admin/payments/${id}/mark-paid`, { method: 'PATCH' })
    setProc(id, false)
    if (res.ok) {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'success' } : p))
    }
  }

  return (
    <>
      {/* Status tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(tab => {
          const active = currentStatus === tab
          return (
            <button key={tab} id={`payments-tab-${tab}`}
              onClick={() => router.push(`/admin/payments?status=${tab}`)}
              className="px-4 py-1.5 rounded-full text-sm font-medium capitalize cursor-pointer transition border"
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

      {/* Table */}
      <div className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}>
        {payments.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: '#bab0c1' }}>
            No {currentStatus === 'all' ? '' : currentStatus} payments found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead style={{ borderBottom: '1px solid #f2f3fb' }}>
                <tr>
                  {['User', 'Type', 'Amount', 'Gateway Order ID', 'Status', 'Date', 'Actions'].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#bab0c1' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const user = getUser(p.users)
                  const busy = processing.has(p.id)
                  const expanded = expandedId === p.id
                  return (
                    <Fragment key={p.id}>
                      <tr
                        onClick={() => setExpandedId(expanded ? null : p.id)}
                        className="cursor-pointer transition"
                        style={{
                          borderBottom: expanded ? 'none' : i < payments.length - 1 ? '1px solid #f2f3fb' : 'none',
                          opacity: busy ? 0.5 : 1,
                          backgroundColor: expanded ? '#fafafa' : undefined,
                        }}
                        onMouseEnter={e => { if (!expanded) e.currentTarget.style.backgroundColor = '#fafafa' }}
                        onMouseLeave={e => { if (!expanded) e.currentTarget.style.backgroundColor = '' }}
                      >
                        {/* User */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-xs" style={{ color: '#000' }}>{user.name}</p>
                          <p className="text-xs" style={{ color: '#bab0c1' }}>{user.email}</p>
                        </td>
                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="text-xs capitalize px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#f2f3fb', color: '#655baa' }}>
                            {p.type?.replace(/_/g, ' ') ?? '—'}
                          </span>
                        </td>
                        {/* Amount */}
                        <td className="px-4 py-3 font-semibold" style={{ color: '#6040d1' }}>
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </td>
                        {/* Gateway Order ID */}
                        <td className="px-4 py-3">
                          <code className="text-xs truncate max-w-[120px] block" style={{ color: '#bab0c1' }}
                            title={p.gateway_order_id ?? ''}>
                            {p.gateway_order_id
                              ? p.gateway_order_id.slice(0, 16) + '…'
                              : '—'}
                          </code>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-right" style={{ color: '#bab0c1' }}>
                          {fmtDate(p.created_at)}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          {p.status === 'pending' && (
                            <button
                              onClick={() => markPaid(p.id)}
                              disabled={busy}
                              className="px-2 py-1 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
                              style={{ backgroundColor: '#6040d1' }}>
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Inline JSON accordion */}
                      {expanded && (
                        <tr key={`${p.id}-detail`} style={{ borderBottom: i < payments.length - 1 ? '1px solid #f2f3fb' : 'none' }}>
                          <td colSpan={7} className="px-4 pb-3">
                            <div className="rounded-lg p-3 text-xs font-mono overflow-x-auto"
                              style={{ backgroundColor: '#f2f3fb', color: '#000' }}>
                              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {JSON.stringify({
                                  id: p.id,
                                  user_id: p.user_id,
                                  type: p.type,
                                  amount: p.amount,
                                  status: p.status,
                                  gateway_order_id: p.gateway_order_id,
                                  gateway_payment_id: p.gateway_payment_id,
                                  created_at: p.created_at,
                                }, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
