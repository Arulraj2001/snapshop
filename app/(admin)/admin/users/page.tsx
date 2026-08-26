import type { Metadata } from 'next'
import Link from 'next/link'
import { serviceClient } from '@/lib/supabase/service'
import PaginationBar from '@/components/admin/PaginationBar'

export const metadata: Metadata = { title: 'snapShop Admin — Users' }

interface Props {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>
}

function PlanBadge({ paid }: { paid: boolean }) {
  return paid ? (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: 'rgba(96,64,209,0.09)', color: '#6040d1' }}
    >
      Paid
    </span>
  ) : (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: '#d7d5dc', color: '#bab0c1' }}
    >
      Free
    </span>
  )
}

function StatusDot({ banned }: { banned: boolean }) {
  return (
    <span
      className="text-xs font-semibold"
      style={{ color: banned ? '#dc2626' : '#16a34a' }}
    >
      {banned ? 'Banned' : 'Active'}
    </span>
  )
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q = '', filter = 'all', page = '1' } = await searchParams
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = 20
  let query = serviceClient
    .from('users')
    .select(
      'id, name, email, referral_code, post_count, wallet_balance, has_paid_platform_fee, is_banned, created_at'
    )
    .order('created_at', { ascending: false })

  if (q.trim()) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }
  if (filter === 'paid') query = query.eq('has_paid_platform_fee', true)
  if (filter === 'banned') query = query.eq('is_banned', true)

  query = query.range((pageNum - 1) * pageSize, pageNum * pageSize)

  const { data: rawUsers } = await query
  const users = rawUsers?.slice(0, pageSize) ?? []
  const hasMore = (rawUsers?.length ?? 0) > pageSize

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#000' }}>
          Users
        </h1>
        <p className="text-sm" style={{ color: '#bab0c1' }}>
          Platform users list
          {q && ` matching "${q}"`}
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <form className="flex-1">
          <input
            id="admin-user-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6040d1]"
            style={{ borderColor: '#d7d5dc', color: '#000', backgroundColor: '#fff' }}
          />
        </form>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'paid', 'banned'] as const).map((f) => {
            const active = filter === f
            return (
              <Link
                key={f}
                href={`/admin/users?filter=${f}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className="px-3 py-2 rounded-lg text-sm font-medium capitalize border"
                style={{
                  backgroundColor: active ? '#6040d1' : '#fff',
                  color: active ? '#fff' : '#000',
                  borderColor: active ? '#6040d1' : '#d7d5dc',
                  textDecoration: 'none',
                }}
              >
                {f}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#fff', borderColor: '#d7d5dc' }}
      >
        {!users?.length ? (
          <p className="text-sm text-center py-12" style={{ color: '#bab0c1' }}>
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead style={{ borderBottom: '1px solid #f2f3fb' }}>
                <tr>
                  {[
                    'Name / Email',
                    'Referral Code',
                    'Posts',
                    'Wallet',
                    'Plan',
                    'Joined',
                    'Status',
                    '',
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${i === 7 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#bab0c1' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom:
                        i < users.length - 1 ? '1px solid #f2f3fb' : 'none',
                    }}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: '#000' }}>
                        {u.name ?? '—'}
                      </p>
                      <p className="text-xs" style={{ color: '#bab0c1' }}>
                        {u.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs" style={{ color: '#655baa' }}>
                        {u.referral_code ?? '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#000' }}>
                      {u.post_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: '#6040d1' }}>
                      ₹{Number(u.wallet_balance ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge paid={u.has_paid_platform_fee} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#bab0c1' }}>
                      {new Intl.DateTimeFormat('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }).format(new Date(u.created_at))}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDot banned={u.is_banned} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border"
                        style={{
                          borderColor: '#d7d5dc',
                          color: '#6040d1',
                          textDecoration: 'none',
                        }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PaginationBar
        currentPage={pageNum}
        hasMore={hasMore}
        baseUrl="/admin/users"
        searchParams={{ filter, q }}
      />
    </div>
  )
}
