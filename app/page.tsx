import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getConfigString } from '@/lib/config'
import Header from '@/components/Header'
import HeroBanner from '@/components/HeroBanner'
import StoreTabs from '@/components/StoreTabs'
import CategoryTabs from '@/components/CategoryTabs'
import ProductCard from '@/components/ProductCard'
import EmptyState from '@/components/EmptyState'
import Footer from '@/components/Footer'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function str(v: string | string[] | undefined): string | undefined {
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v[0]
  return undefined
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

  const spRecord: Record<string, string> = {}
  if (store) spRecord.store = store
  if (category) spRecord.category = category
  if (q) spRecord.q = q

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
    heroGradStart,
    heroGradEnd,
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
    getConfigString('hero_stat_3_val', '₹100 Bonus'),
    getConfigString('hero_stat_3_lbl', 'Per Referral'),
    getConfigString('site_hero_gradient_start', '#6040d1'),
    getConfigString('site_hero_gradient_end', '#371e94'),
  ])

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#f2f3fb' }}>
      <div>
        {/* Header */}
        <Suspense fallback={<HeaderSkeleton />}>
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
              gradientStart={heroGradStart}
              gradientEnd={heroGradEnd}
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

            {/* ── Right Section: Active Filters + Product Grid ─────────────── */}
            <div className="flex-1 min-w-0 w-full">
              {/* Active search or filter label */}
              {(q || store || category) && (
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl border" style={{ backgroundColor: '#ffffff', borderColor: '#d7d5dc' }}>
                  <p className="text-sm" style={{ color: '#bab0c1' }}>
                    Showing deals for{' '}
                    <span style={{ color: '#6040d1', fontWeight: 600 }}>
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
              <Suspense fallback={<ProductGridSkeleton />}>
                <ProductGrid store={store} category={category} q={q} />
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
}: {
  store?: string
  category?: string
  q?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      'id, title, images, offer_price, mrp, store, category, description, affiliate_link, click_count'
    )
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (store) query = query.eq('store', store)
  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: products, error } = await query

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Something went wrong"
        subtitle="Could not load deals right now. Please try again."
      />
    )
  }

  if (!products || products.length === 0) {
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          images={product.images ?? []}
          offer_price={product.offer_price}
          mrp={product.mrp}
          store={product.store}
          category={product.category}
          description={product.description}
          affiliate_link={product.affiliate_link}
        />
      ))}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div
      className="h-14 w-full"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d7d5dc',
      }}
    />
  )
}
