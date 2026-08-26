import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StoreLogo from '@/components/StoreLogo'
import { serviceClient } from '@/lib/supabase/service'
import { getSiteConfig } from '@/lib/config'
import {
  generateProductMetadata,
  generateProductSchema,
  slugify,
  getDiscountPercentage,
  ProductSeoData,
} from '@/lib/seo'

interface Props {
  params: Promise<{ id: string; slug: string }>
}

async function getProduct(id: string): Promise<ProductSeoData | null> {
  const { data } = await serviceClient
    .from('products')
    .select('id, title, images, offer_price, mrp, store, category, description, affiliate_link, created_at')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()

  return data as ProductSeoData | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Deal Not Found' }

  const siteConfig = await getSiteConfig()
  return generateProductMetadata(product, siteConfig.siteName)
}

export default async function DealDetailPage({ params }: Props) {
  const { id, slug: currentSlug } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const siteConfig = await getSiteConfig()
  const schemaJson = generateProductSchema(product, siteConfig.siteName)
  const discount = getDiscountPercentage(product.offer_price, product.mrp)
  const correctSlug = slugify(product.title)

  // Clean store logos or fallbacks
  const storeLogos: Record<string, string> = {
    Amazon: '/stores/amazon.png',
    Flipkart: '/stores/flipkart.png',
    Meesho: '/stores/meesho.png',
    Myntra: '/stores/myntra.png',
  }
  const logoUrl = storeLogos[product.store] || '/stores/amazon.png'

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#f2f3fb' }}>
      {/* Schema.org JSON-LD for Google Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <div>
        <Header siteName={siteConfig.siteName} siteLogoEmoji={siteConfig.siteLogoEmoji} />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
            <Link href="/" className="hover:underline text-black font-semibold">
              Home
            </Link>
            <span>/</span>
            <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:underline text-black font-semibold">
              {product.category}
            </Link>
            <span>/</span>
            <Link href={`/?store=${encodeURIComponent(product.store)}`} className="hover:underline text-black font-semibold">
              {product.store}
            </Link>
            <span>/</span>
            <span className="text-gray-400 truncate max-w-[200px]">{product.title}</span>
          </div>

          {/* Product Card Landing */}
          <div className="rounded-2xl border p-6 sm:p-8 bg-white shadow-sm" style={{ borderColor: '#d7d5dc' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Image Gallery */}
              <div className="flex flex-col gap-3">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-slate-50 flex items-center justify-center" style={{ borderColor: '#d7d5dc' }}>
                  {product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <span className="text-4xl">🛍️</span>
                  )}
                  {discount > 0 && (
                    <span
                      className="absolute top-3 left-3 text-xs font-extrabold text-white px-2.5 py-1 rounded-full shadow-xs"
                      style={{ backgroundColor: siteConfig.secondaryColor || '#9f2089' }}
                    >
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Additional Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="w-14 h-14 rounded-lg overflow-hidden border shrink-0 bg-slate-50"
                        style={{ borderColor: '#d7d5dc' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Pricing & Details */}
              <div className="flex flex-col gap-4">
                {/* Store badge */}
                <div className="flex items-center gap-2">
                  <StoreLogo logoUrl={logoUrl} name={product.store} fallbackEmoji="🏪" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {product.store} Deal · {product.category}
                  </span>
                </div>

                {/* Product Title */}
                <h1 className="text-xl sm:text-2xl font-extrabold text-black leading-tight">
                  {product.title}
                </h1>

                {/* Pricing Box */}
                <div className="flex items-baseline gap-3 my-1">
                  <span className="text-3xl font-extrabold" style={{ color: siteConfig.primaryColor || '#6040d1' }}>
                    ₹{Number(product.offer_price).toLocaleString('en-IN')}
                  </span>
                  {product.mrp && product.mrp > product.offer_price && (
                    <span className="text-base text-gray-400 line-through font-semibold">
                      ₹{Number(product.mrp).toLocaleString('en-IN')}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Save ₹{Number(product.mrp! - product.offer_price).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: '#f2f3fb' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-1">Product Highlights</h3>
                    <p className="whitespace-pre-line">{product.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-4">
                  <a
                    href={product.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl text-white font-extrabold text-center text-sm shadow-md transition-all hover:opacity-95 cursor-pointer block"
                    style={{ backgroundColor: siteConfig.primaryColor || '#6040d1', textDecoration: 'none' }}
                  >
                    Buy Deal on {product.store} →
                  </a>

                  <Link
                    href="/"
                    className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-black border hover:bg-slate-50"
                    style={{ borderColor: '#d7d5dc', textDecoration: 'none' }}
                  >
                    ← Browse More Live Deals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
