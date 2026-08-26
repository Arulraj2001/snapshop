'use client'

import { useState } from 'react'

export interface ContactMessageRow {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  admin_notes: string | null
  created_at: string
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'unread') {
    return (
      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800">
        Unread
      </span>
    )
  }
  if (status === 'replied') {
    return (
      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-green-100 text-green-800">
        Replied
      </span>
    )
  }
  if (status === 'read') {
    return (
      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800">
        Read
      </span>
    )
  }
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-600">
      Archived
    </span>
  )
}

export default function MessagesTable({
  initialMessages,
  currentFilter,
}: {
  initialMessages: ContactMessageRow[]
  currentFilter: string
}) {
  const [messages, setMessages] = useState<ContactMessageRow[]>(initialMessages)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState<Record<string, string>>({})

  async function updateStatus(id: string, newStatus: 'unread' | 'read' | 'replied' | 'archived') {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      )
    } catch {
      alert('Action failed')
    } finally {
      setProcessingId(null)
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Are you sure you want to delete this message?')) return
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch {
      alert('Delete failed')
    } finally {
      setProcessingId(null)
    }
  }

  async function saveNote(id: string) {
    const note = noteText[id] ?? ''
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: note }),
      })

      if (!res.ok) throw new Error('Failed to save note')

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, admin_notes: note } : m))
      )
    } catch {
      alert('Failed to save note')
    } finally {
      setProcessingId(null)
    }
  }

  function handleExpand(m: ContactMessageRow) {
    if (expandedId === m.id) {
      setExpandedId(null)
    } else {
      setExpandedId(m.id)
      if (m.status === 'unread') {
        updateStatus(m.id, 'read')
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { label: 'All Messages', value: 'all' },
          { label: 'Unread', value: 'unread' },
          { label: 'Read', value: 'read' },
          { label: 'Replied', value: 'replied' },
        ].map((t) => {
          const active = currentFilter === t.value
          return (
            <a
              key={t.value}
              href={`/admin/messages?filter=${t.value}`}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                backgroundColor: active ? '#6040d1' : '#ffffff',
                color: active ? '#ffffff' : '#000000',
                border: active ? '1px solid #6040d1' : '1px solid #d7d5dc',
                textDecoration: 'none',
              }}
            >
              {t.label}
            </a>
          )
        })}
      </div>

      {/* Messages Card */}
      <div className="rounded-2xl border overflow-hidden bg-white shadow-xs" style={{ borderColor: '#d7d5dc' }}>
        {messages.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            No contact messages found.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {messages.map((m) => {
              const isExpanded = expandedId === m.id
              const busy = processingId === m.id

              return (
                <div key={m.id} className="flex flex-col transition-colors hover:bg-slate-50/50">
                  {/* Header Row */}
                  <div
                    onClick={() => handleExpand(m)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                    style={{ opacity: busy ? 0.6 : 1 }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-[#6040d1]/10 text-[#6040d1] shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-black truncate">{m.name}</p>
                          <span className="text-xs text-gray-400">&lt;{m.email}&gt;</span>
                        </div>
                        <p className="text-xs font-medium text-gray-600 truncate mt-0.5">
                          <span className="font-bold text-black">{m.subject}:</span> {m.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={m.status} />
                      <span className="text-xs text-gray-400">{formatDate(m.created_at)}</span>
                      <span className="text-xs text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded Detail Reader */}
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-2 bg-slate-50/70 border-t border-gray-100 flex flex-col gap-4">
                      {/* Message Body */}
                      <div className="rounded-xl border p-4 bg-white text-sm leading-relaxed text-black" style={{ borderColor: '#d7d5dc' }}>
                        <p className="whitespace-pre-wrap">{m.message}</p>
                      </div>

                      {/* Admin Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
                          <button
                            onClick={() => updateStatus(m.id, 'unread')}
                            className="px-3 py-1 rounded-lg text-xs font-bold border bg-white hover:bg-slate-100"
                            style={{ borderColor: '#d7d5dc', color: '#000' }}
                          >
                            Mark Unread
                          </button>
                          <button
                            onClick={() => updateStatus(m.id, 'replied')}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-xs"
                          >
                            Mark Replied ✓
                          </button>
                          <a
                            href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#6040d1] hover:bg-[#655baa] shadow-xs"
                            style={{ textDecoration: 'none' }}
                          >
                            Reply via Email ✉️
                          </a>
                        </div>

                        <button
                          onClick={() => deleteMessage(m.id)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete Message 🗑️
                        </button>
                      </div>

                      {/* Admin Notes */}
                      <div className="flex flex-col gap-1.5 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Internal Admin Notes</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            defaultValue={m.admin_notes ?? ''}
                            onChange={(e) => setNoteText((prev) => ({ ...prev, [m.id]: e.target.value }))}
                            placeholder="Add private admin notes..."
                            className="flex-1 rounded-xl border px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#6040d1] bg-white"
                            style={{ borderColor: '#d7d5dc' }}
                          />
                          <button
                            onClick={() => saveNote(m.id)}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-black cursor-pointer shadow-xs"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
