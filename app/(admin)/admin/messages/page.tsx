import type { Metadata } from 'next'
import { serviceClient } from '@/lib/supabase/service'
import MessagesTable, { ContactMessageRow } from '@/components/admin/MessagesTable'

export const metadata: Metadata = {
  title: 'snapShop Admin — Contact Messages',
  description: 'Manage user inquiries, support messages, and feedback.',
}

type SearchParams = Promise<{ filter?: string }>

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { filter = 'all' } = await searchParams

  // Auto mark all unread messages as read when opening the Messages page
  await serviceClient
    .from('contact_messages')
    .update({ status: 'read' })
    .eq('status', 'unread')

  let query = serviceClient
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter !== 'all') {
    query = query.eq('status', filter)
  }

  const { data: messages, error } = await query

  if (error) {
    return (
      <div className="p-6 rounded-2xl border bg-white text-center text-red-600 font-semibold" style={{ borderColor: '#d7d5dc' }}>
        Failed to load contact messages. Please verify that table public.contact_messages exists in Supabase.
      </div>
    )
  }

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black">Contact Messages 💬</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review user feedback, payout inquiries, and broken deal reports from the Contact page.
          </p>
        </div>
      </div>

      <MessagesTable
        initialMessages={(messages as ContactMessageRow[]) ?? []}
        currentFilter={filter}
      />
    </div>
  )
}
