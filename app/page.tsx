import { Suspense } from 'react'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import HeroBanner from '@/components/HeroBanner'
import StoreTabs from '@/components/StoreTabs'
import CategoryTabs from '@/components/CategoryTabs'
import ProductCard from '@/components/ProductCard'
import EmptyState from '@/components/EmptyState'
import Footer from '@/components/Footer'
import SortSelect from '@/components/SortSelect'
import Pagination from '@/components/Pagination'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'
import { createClient } from '@/lib/supabase/server'
import { getConfigString, getConfigNumber } from '@/lib/config'

type SearchParams = Promise<{
  store?: string | string[]
  category?: string | string[]
  q?: string | string[]
  sort?: string | string[]
  page?: string | string[]
}>

function str(val: string | string[] | undefined): string | undefined {
  if (!val) return undefined
  return Array.isArray(val) ? val[0] : val
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const sp = await searchParams
  const store = str(sp.store)
  const category = str(sp.category)
  const q = str(sp.q)

  let title = 'snapShop — Best Affiliate Deals'
  if (category && store) {
    title = `${category} Deals on ${store} — snapShop`
  } else if (category) {
    title = `${category} Deals — snapShop`
  } else if (store) {
    title = `${store} Deals — snapShop`
  } else if (q) {
    title = `Search results for "${q}" — snapShop`
  }

  return {
    title,
    description:
      'Discover and share the best affiliate deals on Amazon, Flipkart, Meesho and Myntra.',
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const store = str(sp.store)
  const category = str(sp.category)
  const q = str(sp.q)
  const sort = str(sp.sort) || 'newest'
  const page = Math.max(1, parseInt(str(sp.page) || '1', 10) || 1)

  const spRecord: Record<string, string> = {}
  if (store) spRecord.store = store
  if (category) spRecord.category = category
  if (q) spRecord.q = q
  if (sort && sort !== 'newest') spRecord.sort = sort

  // Parallel fetch dynamic hero copy & branding settings
  const [
    heroBadge,
    heroHeadline,
    heroSubtitle,
    heroStat1Val,
    heroStat1Lbl,
    heroStat2Val,
    heroStat2Lbl,
    heroStat3Val,
    heroStat3Lbl,
    heroGradientStart,
    heroGradientEnd,
    itemsPerPage,
  ] = await Promise.all([
    getConfigString('hero_badge_text', "🔥 India's #1 Community Deal Hub"),
    getConfigString('hero_headline', 'Discover & Share Craziest Price Drops'),
    getConfigString(
      'hero_subtitle',
      'Hand-picked discounts on Amazon, Flipkart, Myntra & Meesho. Post deals to earn rewards or refer friends to claim rewards!'
    ),
    getConfigString('hero_stat_1_val', '5,000+'),
    getConfigString('hero_stat_1_lbl', 'Verified Deals'),
    getConfigString('hero_stat_2_val', '⚡ Real-time'),
    getConfigString('hero_stat_2_lbl', 'Price Drops'),
    getConfigString('hero_stat_3_val', '₹50 Bonus'),
    getConfigString('hero_stat_3_lbl', 'Per Referral'),
    getConfigString('site_hero_gradient_from', 'var(--site-hero-gradient-from, var(--site-primary-color, #6040d1))'),
    getConfigString('site_hero_gradient_to', 'var(--site-hero-gradient-to, var(--site-secondary-color, #9f2089))'),
    getConfigNumber('items_per_page', 12),
  ])

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#f2f3fb' }}>
      <div>
        {/* Header */}
        <Suspense fallback={<div className="h-14 bg-white border-b" />}>
          <Header />
        </Suspense>

        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
          {/* Top: Hero Banner (Shown when no search query is active) */}
          {!q && (
            <HeroBanner
              badgeText={heroBadge}
              headline={heroHeadline}
              subtitle={heroSubtitle}
              stat1Val={heroStat1Val}
              stat1Lbl={heroStat1Lbl}
              stat2Val={heroStat2Val}
              stat2Lbl={heroStat2Lbl}
              stat3Val={heroStat3Val}
              stat3Lbl={heroStat3Lbl}
              gradientStart={heroGradientStart}
              gradientEnd={heroGradientEnd}
            />
          )}

          {/* Store Filter Bar — Horizontally below Hero Banner */}
          <div
            className="rounded-xl border p-3.5 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
            style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider shrink-0 w-24" style={{ color: '#bab0c1' }}>
              Stores
            </span>
            <div className="flex-1 overflow-hidden">
              <StoreTabs activeStore={store} searchParams={spRecord} layout="horizontal" />
            </div>
          </div>

          {/* Mobile Categories Bar (< lg) */}
          <div
            className="lg:hidden rounded-xl border p-3 mb-5 shadow-xs flex flex-col gap-1.5"
            style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bab0c1' }}>
              Categories
            </span>
            <CategoryTabs activeCategory={category} searchParams={spRecord} layout="horizontal" />
          </div>

          {/* Main Layout: Left Categories Sidebar + Product Grid */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* ── Left Sidebar: Categories ONLY (Desktop >= lg) ────────────── */}
            <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-20">
              <div
                className="rounded-xl border p-4 shadow-xs"
                style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: '#000000' }}>
                  <span>📂</span> Categories
                </h3>
                <CategoryTabs activeCategory={category} searchParams={spRecord} layout="vertical" />
              </div>
            </aside>

            {/* ── Right Section: Header Controls (Sort + Filters) + Product Grid ─────────────── */}
            <div className="flex-1 min-w-0 w-full">
              {/* Section Header: Feed Title + Sort Dropdown */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: '#d7d5dc' }}>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <span>🛍️</span> Live Deal Feed
                </h2>
                {/* Dynamic Sort Component */}
                <SortSelect currentSort={sort} />
              </div>

              {/* Active search or filter label */}
              {(q || store || category) && (
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl border" style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}>
                  <p className="text-sm" style={{ color: '#bab0c1' }}>
                    Showing deals for{' '}
                    <span style={{ color: 'var(--site-primary-color, #6040d1)', fontWeight: 600 }}>
                      {[store, category, q ? `"${q}"` : null].filter(Boolean).join(' · ')}
                    </span>
                  </p>
                  <a
                    href="/"
                    className="text-xs font-semibold text-[#dc2626] hover:underline"
                  >
                    Clear Filters ×
                  </a>
                </div>
              )}

              {/* Product Grid with Suspense */}
              <Suspense
                fallback={
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <ProductGrid store={store} category={category} q={q} sort={sort} page={page} itemsPerPage={itemsPerPage} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

async function ProductGrid({
  store,
  category,
  q,
  sort = 'newest',
  page = 1,
  itemsPerPage = 12,
}: {
  store?: string
  category?: string
  q?: string
  sort?: string
  page?: number
  itemsPerPage?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      'id, title, images, offer_price, mrp, store, category, description, affiliate_link, click_count, created_at',
      { count: 'exact' }
    )
    .eq('status', 'approved')

  if (store) query = query.eq('store', store)
  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  // Apply DB sorting rules (except custom in-memory discount sort)
  if (sort === 'price_asc') {
    query = query.order('offer_price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('offer_price', { ascending: false })
  } else if (sort === 'popular') {
    query = query.order('click_count', { ascending: false })
  } else if (sort !== 'discount') {
    query = query.order('created_at', { ascending: false })
  }

  const { data: productsData, count, error } = await query

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Something went wrong"
        subtitle="Could not load deals right now. Please try again."
      />
    )
  }

  let products = productsData || []

  // In-memory Highest Discount sorting
  if (sort === 'discount') {
    products = [...products].sort((a, b) => {
      const discA = a.mrp && a.mrp > a.offer_price ? (a.mrp - a.offer_price) / a.mrp : 0
      const discB = b.mrp && b.mrp > b.offer_price ? (b.mrp - b.offer_price) / b.mrp : 0
      return discB - discA
    })
  }

  const totalItems = count ?? products.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Paginate sliced items for current page
  const fromIndex = (page - 1) * itemsPerPage
  const paginatedProducts = products.slice(fromIndex, fromIndex + itemsPerPage)

  if (paginatedProducts.length === 0) {
    return (
      <EmptyState
        icon={q ? '🔍' : '🛍️'}
        title={q ? `No results for "${q}"` : 'No deals found'}
        subtitle={
          q
            ? 'Try searching for something else or clearing your active filters.'
            : 'Be the first community member to share a deal!'
        }
        action={!q ? { label: 'Post a Deal', href: '/post' } : undefined}
      />
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            images={product.images ?? []}
            offer_price={Number(product.offer_price)}
            mrp={product.mrp ? Number(product.mrp) : null}
            store={product.store}
            category={product.category}
            description={product.description}
            affiliate_link={product.affiliate_link}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}
