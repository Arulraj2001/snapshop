import { serviceClient } from '@/lib/supabase/service'
import ProductModerationTable from '@/components/admin/ProductModerationTable'
import PaginationBar from '@/components/admin/PaginationBar'

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export const metadata = {
  title: 'snapShop Admin — Products',
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { status = 'pending', page = '1' } = await searchParams
  const validStatus = ['pending', 'approved', 'rejected'].includes(status)
    ? status
    : 'pending'
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = 20

  const { data: rawProducts } = await serviceClient
    .from('products')
    .select(`
      id, title, images, store, category, offer_price,
      status, reject_reason, created_at,
      users!products_user_id_fkey (name, email)
    `)
    .eq('status', validStatus)
    .order('created_at', { ascending: false })
    .range((pageNum - 1) * pageSize, pageNum * pageSize) // fetch 21 to check hasMore

  const products = rawProducts?.slice(0, pageSize) ?? []
  const hasMore = (rawProducts?.length ?? 0) > pageSize

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#000' }}>
          Products
        </h1>
        <p className="text-sm" style={{ color: '#bab0c1' }}>
          Review and moderate user-submitted products
        </p>
      </div>

      <ProductModerationTable
        initialProducts={products as unknown as import('@/components/admin/ProductModerationTable').ProductRow[]}
        currentStatus={validStatus}
      />

      <PaginationBar
        currentPage={pageNum}
        hasMore={hasMore}
        baseUrl="/admin/products"
        searchParams={{ status: validStatus }}
      />
    </div>
  )
}
