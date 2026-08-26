'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductRow {
  id: string
  title: string
  images: string[]
  store: string
  category: string
  offer_price: number
  status: string
  reject_reason: string | null
  created_at: string
  // Supabase FK join returns array; we take [0] when rendering
  users: { name: string; email: string }[] | { name: string; email: string } | null
}

interface Props {
  initialProducts: ProductRow[]
  currentStatus: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(d))
}

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    approved: { bg: 'rgba(96,64,209,0.09)', color: '#6040d1' },
    pending: { bg: 'rgba(186,176,193,0.2)', color: '#bab0c1' },
    rejected: { bg: 'rgba(220,38,38,0.09)', color: '#dc2626' },
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

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({
  productId,
  onDone,
  onCancel,
}: {
  productId: string
  onDone: (id: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!reason.trim()) { setError('Reason is required'); return }
    setLoading(true)
    const res = await fetch(`/api/admin/products/${productId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    setLoading(false)
    if (res.ok) { onDone(productId) }
    else { const d = await res.json(); setError(d.error) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-5"
        style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}
      >
        <h3 className="font-semibold text-sm mb-3" style={{ color: '#000' }}>
          Reason for Rejection
        </h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Describe why this product is being rejected…"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
          style={{ borderColor: '#d7d5dc', color: '#000' }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #6040d1')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
        />
        {error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{error}</p>}
        <div className="flex gap-2 mt-3">
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: '#dc2626' }}
          >
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm border cursor-pointer"
            style={{ borderColor: '#d7d5dc', color: '#000' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export default function ProductModerationTable({
  initialProducts,
  currentStatus,
}: Props) {
  const router = useRouter()
  const [products, setProducts] = useState<ProductRow[]>(initialProducts)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [processing, setProcessing] = useState<Set<string>>(new Set())

  function removeProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s })
  }

  function setProcessingId(id: string, on: boolean) {
    setProcessing((prev) => {
      const s = new Set(prev)
      on ? s.add(id) : s.delete(id)
      return s
    })
  }

  async function approve(id: string) {
    setProcessingId(id, true)
    const res = await fetch(`/api/admin/products/${id}/approve`, { method: 'PATCH' })
    setProcessingId(id, false)
    if (res.ok) removeProduct(id)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product permanently?')) return
    setProcessingId(id, true)
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setProcessingId(id, false)
    if (res.ok) removeProduct(id)
  }

  async function bulkApprove() {
    const ids = Array.from(selected)
    await Promise.all(ids.map(approve))
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  function toggleAll() {
    setSelected(
      selected.size === products.length
        ? new Set()
        : new Set(products.map((p) => p.id))
    )
  }

  return (
    <>
      {rejectingId && (
        <RejectModal
          productId={rejectingId}
          onDone={(id) => { removeProduct(id); setRejectingId(null) }}
          onCancel={() => setRejectingId(null)}
        />
      )}

      {/* Status tabs */}
      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map((tab) => {
          const active = currentStatus === tab
          return (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => router.push(`/admin/products?status=${tab}`)}
              className="px-4 py-1.5 rounded-full text-sm font-medium capitalize cursor-pointer transition"
              style={{
                backgroundColor: active ? '#6040d1' : '#fff',
                color: active ? '#fff' : '#000',
                border: `1px solid ${active ? '#6040d1' : '#d7d5dc'}`,
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div
          className="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-xl border"
          style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}
        >
          <span className="text-sm" style={{ color: '#000' }}>
            {selected.size} selected
          </span>
          <button
            onClick={bulkApprove}
            className="px-3 py-1 rounded-lg text-white text-xs font-semibold cursor-pointer"
            style={{ backgroundColor: '#6040d1' }}
          >
            Approve Selected
          </button>
          <button
            onClick={() => {
              const first = Array.from(selected)[0]
              setRejectingId(first)
            }}
            className="px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer"
            style={{ borderColor: '#d7d5dc', color: '#000' }}
          >
            Reject Selected
          </button>
        </div>
      )}

      {/* Table card */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}
      >
        {products.length === 0 ? (
          <p
            className="text-sm text-center py-12"
            style={{ color: '#bab0c1' }}
          >
            No {currentStatus} products.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead style={{ borderBottom: '1px solid #f2f3fb' }}>
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === products.length && products.length > 0}
                      onChange={toggleAll}
                      className="cursor-pointer"
                      style={{ accentColor: '#6040d1' }}
                    />
                  </th>
                  {['Image', 'Title', 'Store', 'Posted By', 'Date', 'Status', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#bab0c1' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const busy = processing.has(p.id)
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom:
                          i < products.length - 1 ? '1px solid #f2f3fb' : 'none',
                        opacity: busy ? 0.5 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="cursor-pointer"
                          style={{ accentColor: '#6040d1' }}
                        />
                      </td>

                      {/* Thumbnail */}
                      <td className="px-3 py-3">
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: '#f2f3fb' }}
                        >
                          {p.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>🛍️</span>
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-3 py-3">
                        <p
                          className="font-medium max-w-[200px] truncate"
                          style={{ color: '#000' }}
                          title={p.title}
                        >
                          {p.title}
                        </p>
                        <p className="text-xs" style={{ color: '#bab0c1' }}>
                          {p.category} · ₹{Number(p.offer_price).toLocaleString('en-IN')}
                        </p>
                        {p.reject_reason && (
                          <p className="text-xs mt-0.5 max-w-[200px] truncate" style={{ color: '#dc2626' }} title={p.reject_reason}>
                            Reason: {p.reject_reason}
                          </p>
                        )}
                      </td>

                      {/* Store */}
                      <td className="px-3 py-3 text-xs" style={{ color: '#000' }}>
                        {p.store}
                      </td>

                      {/* Posted By */}
                      <td className="px-3 py-3">
                        {(() => {
                          const u = Array.isArray(p.users) ? p.users[0] : p.users
                          return (
                            <>
                              <p className="text-xs" style={{ color: '#000' }}>{u?.name ?? 'Unknown'}</p>
                              <p className="text-xs" style={{ color: '#bab0c1' }}>{u?.email ?? ''}</p>
                            </>
                          )
                        })()}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 text-xs" style={{ color: '#bab0c1' }}>
                        {formatDate(p.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 text-right">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approve(p.id)}
                                disabled={busy}
                                className="px-2 py-1 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: '#6040d1' }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingId(p.id)}
                                disabled={busy}
                                className="px-2 py-1 rounded-lg text-xs border cursor-pointer disabled:opacity-50"
                                style={{ borderColor: '#d7d5dc', color: '#000' }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {p.status === 'approved' && (
                            <button
                              onClick={() => deleteProduct(p.id)}
                              disabled={busy}
                              className="px-2 py-1 text-xs font-medium cursor-pointer disabled:opacity-50"
                              style={{ color: '#dc2626', background: 'none', border: 'none' }}
                            >
                              Delete
                            </button>
                          )}
                          {p.status === 'rejected' && (
                            <button
                              onClick={() => approve(p.id)}
                              disabled={busy}
                              className="px-2 py-1 rounded-lg text-xs border cursor-pointer disabled:opacity-50"
                              style={{ borderColor: '#6040d1', color: '#6040d1' }}
                            >
                              Re-approve
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
